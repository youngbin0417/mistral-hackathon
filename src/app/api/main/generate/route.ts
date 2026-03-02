import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { logger } from '@/lib/logger';
import { redis } from '@/lib/redis';
import { rateLimit } from '@/lib/rateLimit';
import { ApiErrorResponse, GenerateRequest, GenerateResponse } from '@/types/api';

export async function POST(req: Request) {
    try {
        if (!process.env.MISTRAL_API_KEY) {
            return NextResponse.json({
                error: "MISTRAL_API_KEY is missing. Please add it to your .env file."
            }, { status: 500 });
        }

        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const ratelimit = await rateLimit(`generate:${ip}`, 1000, 60);

        if (!ratelimit.success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a minute." },
                { status: 429 }
            );
        }

        const { prompt } = (await req.json()) as GenerateRequest;

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

        const client = new Mistral({
            apiKey: process.env.MISTRAL_API_KEY,
            serverURL: process.env.MISTRAL_API_URL || undefined
        });

        const SYSTEM_PROMPT = `You are a professional creative coder.
The user will provide a prompt for a visual or interactive effect.
Generate the most high-quality, impressive, and complete JavaScript code possible using p5.js or Matter.js.

CRITICAL RUNTIME ENVIRONMENT RULES:
- p5.js and Matter.js are already loaded via CDN <script> tags. They are available as GLOBALS.
- You MUST use p5.js in GLOBAL MODE: define top-level "function setup()" and "function draw()" directly.
- NEVER use p5.js instance mode (e.g., "new p5(function(p) { ... })"). This will break the runtime.
- NEVER use import or require statements. All libraries are pre-loaded globals.
- The runtime also provides these global helper functions: createSprite(), moveForward(), turnRight(), setGravity(), applyForce(), drawShape(), explodeParticles(), addScore(), playBGM(), playSFX(), speakText(), setVoiceStyle(), dialogueScene(), onFrame(), applyStyle(). You may call them directly if relevant.
- The page has a <div id="app"> element. p5.js createCanvas() will handle its own canvas.

Return ONLY raw JavaScript code.
DO NOT use markdown code blocks.
DO NOT include explanations unless they are in code comments.
ALL code comments and names MUST be strictly in English.
Ensure the code runs immediately when evaluated.`;

        // Step 1: Draft Code Generation (Creative Phase)
        const chatResponse = await client.chat.complete({
            model: 'codestral-latest',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ]
        });

        let draftCode = chatResponse.choices?.[0]?.message?.content || "";
        if (typeof draftCode !== 'string') draftCode = JSON.stringify(draftCode);

        // Step 2: Refinement & Library Detection Phase (Review Phase)
        const REFINE_PROMPT = `You are a strict code reviewer and library detector.
Review the following drafted JavaScript code.
1. Fix any syntax errors, incomplete logic, or infinite loops.
2. Remove completely any markdown code blocks (e.g., \`\`\`javascript).
3. Detect which frontend libraries are required. We currently support: "p5", "p5.sound", "matter-js".
4. Ensure all comments and variable names are strictly in English.
5. CRITICAL: If p5.js is used, it MUST be in GLOBAL mode (top-level "function setup()" and "function draw()"). If the code uses instance mode ("new p5(function(p) { ... })"), REWRITE it to global mode. Replace all "p.xxx" calls with direct p5 global calls (e.g., p.createCanvas -> createCanvas, p.background -> background).
6. Remove ALL import/require statements. Libraries are loaded via CDN.

You MUST return ONLY a valid JSON object with exactly this structure:
{
  "code": "cleaned and fixed javascript code string that runs standalone",
  "libraries": ["array", "of", "required", "library", "strings"]
}`;

        logger.info(`[AI Backend] Starting Step 2: Refining drafted code...`);
        const refineResponse = await client.chat.complete({
            model: 'mistral-large-latest',
            responseFormat: { type: "json_object" },
            messages: [
                { role: 'system', content: REFINE_PROMPT },
                { role: 'user', content: `Here is the draft code to review and refine:\n\n${draftCode}` }
            ]
        });

        let finalResponseData: { code: string, libraries: string[] } = { code: "", libraries: [] };
        try {
            const rawRefine = refineResponse.choices?.[0]?.message?.content || "{}";
            finalResponseData = JSON.parse(typeof rawRefine === 'string' ? rawRefine : JSON.stringify(rawRefine));
        } catch (parseError) {
            logger.error({ err: parseError }, `[AI Backend] Step 2 JSON parsing failed. Falling back to draft.`);
            finalResponseData.code = draftCode;
        }

        let generatedCode = finalResponseData.code || draftCode;

        // Ultimate Fallback cleanup 
        if (generatedCode.startsWith('```')) {
            generatedCode = generatedCode.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
        }

        // Strip import statements — libraries are injected via CDN <script> tags, not ESM imports
        generatedCode = generatedCode
            .split('\n')
            .filter((line: string) => {
                const t = line.trim();
                return !t.startsWith('import ') && !t.startsWith('import{');
            })
            .join('\n')
            .trim();

        // Combine AI detected libs with rule-based detection for maximum safety
        const detectedLibraries = new Set<string>(finalResponseData.libraries || []);
        if (generatedCode.match(/loadSound|p5\.SoundFile|p5\.Oscillator|new p5\.Noise/)) {
            detectedLibraries.add('p5.sound');
            detectedLibraries.add('p5'); // p5.sound depends on p5
        }
        if (generatedCode.match(/Matter\.|Matter\s*=/)) {
            detectedLibraries.add('matter-js');
        }
        if (generatedCode.match(/p5|createCanvas|setup\(|draw\(/)) {
            detectedLibraries.add('p5');
        }

        const injectedLibraries = Array.from(detectedLibraries);

        logger.info({ injectedLibraries }, `[AI Backend] Codestral response success. Libs detected: ${injectedLibraries.join(', ')}`);
        logger.debug({ code: generatedCode }, `[AI Backend] Generated Code for prompt "${prompt}":\n${generatedCode}`);

        const responseData: GenerateResponse = { code: generatedCode, injectedLibraries };

        // Save to cache and recent list
        try {
            await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60 * 60 * 24 * 7); // Cache for 7 days
            await redis.lpush('recent:magics', JSON.stringify({ prompt, code: generatedCode, timestamp: Date.now() }));
            await redis.ltrim('recent:magics', 0, 49);
        } catch (redisErr) {
            logger.warn({ err: redisErr }, `[AI Backend] Failed to store in Redis`);
        }

        return NextResponse.json(responseData);
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        logger.error({ err: errorMsg }, "[AI Backend] Mistral API Error");
        const errResp: ApiErrorResponse = { error: "Failed to generate code via Mistral" };
        return NextResponse.json(errResp, { status: 500 });
    }
}
