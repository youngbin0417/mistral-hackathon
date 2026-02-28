import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
    try {
        if (!process.env.MISTRAL_API_KEY) {
            return NextResponse.json({
                error: "MISTRAL_API_KEY is missing. Please add it to your .env file."
            }, { status: 500 });
        }

        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const ratelimit = await rateLimit(`generate:${ip}`, 10, 60);

        if (!ratelimit.success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a minute." },
                { status: 429 }
            );
        }

        const { prompt, context } = await req.json();

        logger.info({ prompt }, `[AI Backend] Requesting Mistral API for prompt: "${prompt}"`);

        // Check if cached first
        const cacheKey = `magic:prompt:${encodeURIComponent(prompt)}`;
        try {
            const cachedCode = await redis.get(cacheKey);
            if (cachedCode) {
                logger.info({ prompt }, `[AI Backend] Cache hit for "${prompt}"`);
                const parsed = JSON.parse(cachedCode);

                // Add to recent magics list (store prompt and code)
                await redis.lpush('recent:magics', JSON.stringify({ prompt, code: parsed.code, timestamp: Date.now() }));
                await redis.ltrim('recent:magics', 0, 49); // Keep last 50

                return NextResponse.json(parsed);
            }
        } catch (redisErr) {
            logger.warn({ err: redisErr }, `[AI Backend] Redis cache lookup failed, treating as cache miss`);
        }

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            logger.error("MISTRAL_API_KEY is missing from environment variables.");
            return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
        }

        const client = new Mistral({ apiKey });

        const SYSTEM_PROMPT = `You are a professional creative coder. 
The user will provide a prompt for a visual or interactive effect. 
Generate the most high-quality, impressive, and complete JavaScript code possible using p5.js or Matter.js.
Return ONLY raw JavaScript code. 
DO NOT use markdown code blocks. 
DO NOT include explanations unless they are in code comments.
ALL code comments and names MUST be strictly in English. NEVER use Korean.
Ensure the code is self-contained and runs immediately.`;

        const chatResponse = await client.chat.complete({
            model: 'codestral-latest',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ]
        });

        let rawContent = chatResponse.choices?.[0]?.message?.content || "";
        let generatedCode = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);

        // Fallback cleanup if the model still accidentally returns markdown blocks
        if (generatedCode.startsWith('```')) {
            generatedCode = generatedCode.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
        }

        // Auto-detect required libraries based on keywords in the generated code
        const injectedLibraries: string[] = [];
        if (generatedCode.includes('Matter.') || generatedCode.includes('Matter =')) {
            injectedLibraries.push('matter-js');
        }
        if (generatedCode.includes('p5') || generatedCode.includes('createCanvas')) {
            injectedLibraries.push('p5');
        }

        logger.info({ injectedLibraries }, `[AI Backend] Codestral response success. Libs detected: ${injectedLibraries.join(', ')}`);
        logger.debug({ code: generatedCode }, `[AI Backend] Generated Code for prompt "${prompt}":\n${generatedCode}`);

        const responseData = { code: generatedCode, injectedLibraries };

        // Save to cache and recent list
        try {
            await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60 * 60 * 24 * 7); // Cache for 7 days
            await redis.lpush('recent:magics', JSON.stringify({ prompt, code: generatedCode, timestamp: Date.now() }));
            await redis.ltrim('recent:magics', 0, 49);
        } catch (redisErr) {
            logger.warn({ err: redisErr }, `[AI Backend] Failed to store in Redis`);
        }

        return NextResponse.json(responseData);
    } catch (error: any) {
        logger.error({ err: error.message || error }, "[AI Backend] Mistral API Error");
        return NextResponse.json({ error: "Failed to generate code via Mistral" }, { status: 500 });
    }
}
