import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimit';
import { ApiErrorResponse, RecentResponse } from '@/types/api';

export async function GET(req: Request) {
    try {
        const ip = req.headers.get('x-forwarded-for') || 'anonymous';
        const ratelimit = await rateLimit(`recent:${ip}`, 30, 60);

        if (!ratelimit.success) {
            return NextResponse.json(
                { error: "Too many requests" },
                { status: 429 }
            );
        }
        // Fetch last 10-20 recent magic blocks
        const recentRaw = await redis.lrange('recent:magics', 0, 19);

        const recentMagics = recentRaw.map(item => {
            try {
                return JSON.parse(item);
            } catch (e) {
                return null;
            }
        }).filter(item => item !== null);

        const resp: RecentResponse = { recent: recentMagics };
        return NextResponse.json(resp);
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        logger.error({ err: errorMsg }, "[Recent API] Failed to fetch recent magics");
        const errResp: ApiErrorResponse = { error: "Failed to fetch recent magics" };
        return NextResponse.json(errResp, { status: 500 });
    }
}
