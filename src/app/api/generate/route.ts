import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        // 🚀 [TODO] 여기에 실제 Mistral / Codestral API 연동 코드가 들어갈 자리입니다.
        console.log(`[AI Backend] Received prompt: ${prompt}`);

        // AI 생성 시간을 모방하기 위한 딜레이 (1.5초)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // 모의(Mock) 응답 데이터
        let generatedCode = `console.log("🤖 AI가 아직 [${prompt}] 마법을 배우는 중입니다.");`;

        if (prompt.toLowerCase().includes('sparkle') || prompt.toLowerCase().includes('explode')) {
            generatedCode = `// ✨ AI가 생성한 마법 코드: ${prompt}
const fx = document.createElement('div');
fx.innerHTML = '✨💥 반짝이는 폭발 생성 중! 💥✨';
fx.style.cssText = 'color: #ff00ff; font-weight: bold; padding: 10px; border: 1px solid cyan; border-radius: 8px; margin-top: 10px; text-align: center;';
document.body.appendChild(fx);

setTimeout(() => fx.remove(), 3000);
console.log('✨ Magic explosion effect triggered.');
`;
        }

        return NextResponse.json({ code: generatedCode });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to generate code" }, { status: 500 });
    }
}
