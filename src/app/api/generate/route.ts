import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';

export async function POST(req: Request) {
    try {
        const { prompt, context } = await req.json();

        console.log(`[AI Backend] Requesting Mistral API for prompt: "${prompt}"`);

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            console.error("MISTRAL_API_KEY is missing from environment variables.");
            return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
        }

        const client = new Mistral({ apiKey });

        const SYSTEM_PROMPT = `You are Codestral, an expert creative coder.
The user placed a "Magic Block" with natural language in their block program.

Context (Surrounding Code):
${context?.fullCode || "// No existing code"}

Magic Request: "${prompt}"

Generate vanilla JavaScript code that:
1. Interprets the user's intent literally but intelligently.
2. Acts on the browser DOM. Create elements or canvas inside \`document.getElementById('app')\`.
3. You MUST CHOOSE EXACTLY ONE approach from below. DO NOT mix them:
   - APPROACH A (Visuals/Drawing): Use ONLY 'p5.js' for particles, visuals, sparkles. Use instance mode \`new p5(s => { ... s.setup = () => { s.createCanvas(window.innerWidth, window.innerHeight).parent('app'); } }, document.getElementById('app'))\`.
   - APPROACH B (Rigid Physics): Use ONLY 'Matter.js' for gravity blocks, bouncing. \`Render.create({ element: document.getElementById('app'), engine, options: { width: window.innerWidth, height: window.innerHeight } })\`.
   - APPROACH C (DOM/Vanilla): Use vanilla JS to animate HTML elements.
4. CRITICAL: NEVER import or use both Matter.js and p5.js together.
5. CONTINUITY: If the context code already defines a Character or Sprite (via window.entities), use those variables/entities instead of creating new ones if appropriate.
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
