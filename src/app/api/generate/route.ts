import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
    try {
        const { prompt, context } = await req.json();

        logger.info({ prompt }, `[AI Backend] Requesting Mistral API for prompt: "${prompt}"`);

        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            logger.error("MISTRAL_API_KEY is missing from environment variables.");
            return NextResponse.json({ error: "API key is not configured" }, { status: 500 });
        }

        const client = new Mistral({ apiKey });

        const SYSTEM_PROMPT = `You are Codestral, an expert creative coder. 
The user placed a "Magic Block" with natural language in their block program.

CONTEXT (SURROUNDING CODE):
${context?.fullCode || "// No existing code"}

MAGIC REQUEST: "${prompt}"

GENERATE JavaScript code that:
1. Wrap EVERYTHING in a block scope \`{ ... }\` to avoid naming conflicts with other blocks.
2. Use 'var' instead of 'const/let' for variables if they need to be global, or just use the block scope.
3. APPROACH (Choose ONE):
   - VISUALS: Use 'p5.js' for particles, visuals. Use instance mode \`new p5(s => { s.setup = () => { s.createCanvas(window.innerWidth, window.innerHeight).parent('app'); s.clear(); }; s.draw = () => { ... } }, document.getElementById('app'))\`.
   - PHYSICS: Use 'Matter.js' for bouncing/gravity.
   - DOM: Use vanilla JS to animate.
4. CONTINUITY: If the context code includes \`createSprite("Hero", ...)\`, the sprite is stored in \`window.entities["Hero"]\`.
   - You can move ALL sprites using \`window.moveForward(10)\` or \`window.turnRight(90)\`.
   - You can modify a specific sprite: \`if(window.entities["Hero"]) window.entities["Hero"].x += 5;\`.
5. Provide brief, kid-friendly comments in Korean explaining the "magic".

IMPORTANT RULES:
- Return ONLY valid, executable JavaScript code inside the \`{ ... }\` scope.
- Start directly with raw JS. DO NOT use markdown code blocks (\`\`\`js).
- DO NOT overwrite \`window.entities\` or \`window.createSprite\`.
- Keep it simple and creative!`;

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

        logger.info({ injectedLibraries }, `[AI Backend] Codestral response success. Libs detected: ${injectedLibraries.join(', ')}`);

        return NextResponse.json({ code: generatedCode, injectedLibraries });
    } catch (error: any) {
        logger.error({ err: error.message || error }, "[AI Backend] Mistral API Error");
        return NextResponse.json({ error: "Failed to generate code via Mistral" }, { status: 500 });
    }
}
