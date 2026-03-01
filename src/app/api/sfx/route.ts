import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { text, duration_seconds = 2, isBGM = false } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            console.warn('ELEVENLABS_API_KEY is not set. Using fallback/mock audio or returning error.');
            return NextResponse.json({ error: 'ElevenLabs API key is missing' }, { status: 500 });
        }

        // We use ElevenLabs Text to Sound Effects API
        const response = await fetch(`https://api.elevenlabs.io/v1/sound-generation`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: isBGM ? `Video game background music loop, ${text}` : text,
                duration_seconds: duration_seconds,
                prompt_influence: 0.3
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs SFX API Error:', errorText);
            return NextResponse.json({ error: 'Failed to generate sound effect' }, { status: response.status });
        }

        const audioBuffer = await response.arrayBuffer();

        return new NextResponse(audioBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        });
    } catch (error) {
        console.error('SFX Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
