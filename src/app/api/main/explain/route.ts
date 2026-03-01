import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { rateLimit } from '@/lib/rateLimit';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
    try {
        if (!process.env.MISTRAL_API_KEY) {
            return NextResponse.json({
                error: "MISTRAL_API_KEY is missing. Please add it to your .env file."
            }, { status: 500 });
        }

        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const ratelimit = await rateLimit(`explain:${ip}`, 10, 60);

        if (!ratelimit.success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a minute." },
                { status: 429 }
            );
        }

        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        logger.info("[AI Explain] Requesting explanation from Mistral API");

        const client = new Mistral({
            apiKey: process.env.MISTRAL_API_KEY,
            serverURL: process.env.MISTRAL_API_URL || undefined
        });

        const SYSTEM_PROMPT = `You are a friendly coding mentor. 
The user is learning to code using a visual block editor.

YOUR TASK:
Explain this code to a 10-year-old in 2 or 3 short sentences. What does it do?
Respond in English.
Do NOT include any code blocks, markdown formatting, or complex terms. Keep it very simple and friendly.`;

        const chatResponse = await client.chat.complete({
            model: 'mistral-large-latest',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Explain this code:\n\n${code}` }
            ]
        });

        const explanation = chatResponse.choices?.[0]?.message?.content || "Failed to generate an explanation.";

        return NextResponse.json({ explanation });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        logger.error({ err: errorMsg }, "[AI Explain] Mistral API Error");
        return NextResponse.json({ error: "Failed to explain code" }, { status: 500 });
    }
}
