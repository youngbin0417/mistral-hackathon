import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimit';
import { ApiErrorResponse, HealRequest } from '@/types/api';

export async function POST(req: Request) {
    try {
        if (!process.env.MISTRAL_API_KEY) {
            return NextResponse.json({
                error: "MISTRAL_API_KEY is missing. Please add it to your .env file."
            }, { status: 500 });
        }

        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const ratelimit = await rateLimit(`heal:${ip}`, 10, 60);

        if (!ratelimit.success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a minute." },
                { status: 429 }
            );
        }

        const { error, code } = (await req.json()) as HealRequest;

        logger.info({ error }, `[AI Heal] Requesting Mistral API to fix error: "${error}"`);

        const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

        const SYSTEM_PROMPT = `You are an expert debugger and coding mentor.
The user's block program has a runtime error.

ERROR MESSAGE: "${error}"
CURRENT CODE:
${code}

YOUR TASK:
1. Analyze why the error occurred (e.g., missing variable, wrong library usage, logical order).
2. Fix the code so it runs perfectly.
3. Provide a very simple explanation of the fix in English.

IMPORTANT RULES:
- Return a JSON object with two fields: "fixedCode" (string) and "explanation" (string in English).
- ALL explanations and comments MUST be in English. NEVER use Korean.
- Return ONLY the raw JSON. No markdown blocks.
- Preserve the user's creative intent.
- Ensure only one library (p5.js OR Matter.js) is used correctly.
`;

        const chatResponse = await client.chat.complete({
            model: 'codestral-latest',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Fix this error: ${error}` }
            ],
            responseFormat: { type: 'json_object' }
        });

        const content = chatResponse.choices?.[0]?.message?.content;
        let result;

        if (typeof content === 'string') {
            result = JSON.parse(content);
        } else {
            result = content;
        }

        logger.info("[AI Heal] Healing successful.");

        return NextResponse.json(result);
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        logger.error({ err: errorMsg }, "[AI Heal] Mistral API Error");
        const errResp: ApiErrorResponse = { error: "Failed to heal code via Mistral" };
        return NextResponse.json(errResp, { status: 500 });
    }
}
