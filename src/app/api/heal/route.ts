import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
    try {
        const { error, code, prompt } = await req.json();

        logger.info({ error }, `[AI Heal] Requesting Mistral API to fix error: "${error}"`);

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            logger.error("MISTRAL_API_KEY is missing from environment variables.");
            return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
        }

        const client = new Mistral({ apiKey });

        const SYSTEM_PROMPT = `You are an expert debugger and coding mentor for children.
The user is learning coding with blocks, but their program has a runtime error.

ERROR MESSAGE: "${error}"
CURRENT CODE:
${code}

YOUR TASK:
1. Analyze why the error occurred (e.g., missing variable, wrong library usage, logical order).
2. Fix the code so it runs perfectly.
3. Provide a very simple, kid-friendly explanation of the fix in Korean.

IMPORTANT RULES:
- Return a JSON object with two fields: "fixedCode" (string) and "explanation" (string in Korean).
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
    } catch (error: any) {
        logger.error({ err: error.message || error }, "[AI Heal] Mistral API Error");
        return NextResponse.json({ error: "Failed to heal code via Mistral" }, { status: 500 });
    }
}
