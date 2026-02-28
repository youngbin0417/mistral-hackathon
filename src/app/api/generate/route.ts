import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        console.log(`[AI Backend] Requesting Mistral API for prompt: "${prompt}"`);

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            console.error("MISTRAL_API_KEY is missing from environment variables.");
            return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
        }

        const client = new Mistral({ apiKey });

        const SYSTEM_PROMPT = `You are Codestral, an expert creative coder.
The user placed a "Magic Block" with natural language in their block program.

Magic Request: "${prompt}"

Generate vanilla JavaScript code that:
1. Interprets the user's intent literally but intelligently.
2. Acts on the browser DOM. You must create elements inside document.getElementById('app').
3. For physics/gravity: Use Matter.js. Important: Always use Render.create({ element: document.getElementById('app'), engine, options: { width: window.innerWidth, height: window.innerHeight } }). Don't append to document.body.
4. For drawing/animations: Use p5.js. Important: Use instance mode \`new p5(s => { ... }, document.getElementById('app'))\`.
5. NEVER mix Matter.js and p5.js in the same code unless explicitly requested, as their renderers can conflict or hide each other. Pick the best ONE library for the job.
6. Provide brief, kid-friendly comments explaining the "magic" in Korean.

IMPORTANT RULES:
- Return ONLY valid, executable JavaScript code.
- NEVER wrap the code in Markdown formatting like \`\`\`javascript ... \`\`\`. Start directly with the raw JS.
- Do NOT include HTML tags. Only write the JavaScript logic.`;

        const chatResponse = await client.chat.complete({
            model: 'codestral-latest',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: prompt }
            ]
            // Codestral is optimized for code generation
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

        console.log(`[AI Backend] Codestral response success. Libs detected: ${injectedLibraries.join(', ')}`);

        return NextResponse.json({ code: generatedCode, injectedLibraries });
    } catch (error: any) {
        console.error("[AI Backend] Mistral API Error:", error.message || error);
        return NextResponse.json({ error: "Failed to generate code via Mistral" }, { status: 500 });
    }
}
