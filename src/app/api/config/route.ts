import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    return NextResponse.json({ hasApiKey: !!process.env.MISTRAL_API_KEY });
}

export async function POST(req: Request) {
    try {
        const { apiKey } = await req.json();
        if (!apiKey) {
            return NextResponse.json({ error: "No API key provided" }, { status: 400 });
        }

        // Update process.env so it works immediately without restart
        process.env.MISTRAL_API_KEY = apiKey;

        // Save to .env file for persistence
        const envPath = path.join(process.cwd(), '.env');
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }

        if (envContent.includes('MISTRAL_API_KEY=')) {
            envContent = envContent.replace(/MISTRAL_API_KEY=.*/, `MISTRAL_API_KEY=${apiKey}`);
        } else {
            envContent += `\nMISTRAL_API_KEY=${apiKey}\n`;
        }

        fs.writeFileSync(envPath, envContent.trim() + '\n');

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Failed to save API key" }, { status: 500 });
    }
}
