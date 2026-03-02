import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const ratelimit = await rateLimit(`sfx:${ip}`, 1000, 60);

        if (!ratelimit.success) {
            return NextResponse.json(
                { error: "Too many requests. Please wait a minute." },
                { status: 429 }
            );
        }

        const { text, duration_seconds = 2, isBGM = false } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            console.warn('ELEVENLABS_API_KEY is not set. Using fallback/mock audio.');
            const mockBuffer = new ArrayBuffer(1);
            return new NextResponse(mockBuffer, {
                status: 200,
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': '1',
                },
            });
        }

        // We use ElevenLabs Text to Sound Effects API
        const baseUrl = process.env.ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1';
        const response = await fetch(`${baseUrl}/sound-generation`, {
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
