import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ApiErrorResponse, ConfigGetResponse, ConfigPostRequest, ConfigPostResponse } from '@/types/api';

export async function GET() {
    const resp: ConfigGetResponse = { hasApiKey: !!process.env.MISTRAL_API_KEY };
    return NextResponse.json(resp);
}

export async function POST(req: Request) {
    try {
        const { apiKey } = (await req.json()) as ConfigPostRequest;
        if (!apiKey) {
            const errResp: ApiErrorResponse = { error: "No API key provided" };
            return NextResponse.json(errResp, { status: 400 });
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

        const resp: ConfigPostResponse = { success: true };
        return NextResponse.json(resp);
    } catch {
        const errResp: ApiErrorResponse = { error: "Failed to save API key" };
        return NextResponse.json(errResp, { status: 500 });
    }
}
