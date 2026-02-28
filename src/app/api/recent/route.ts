import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rateLimit';

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

        return NextResponse.json({ recent: recentMagics });
    } catch (error: any) {
        logger.error({ err: error.message || error }, "[Recent API] Failed to fetch recent magics");
        return NextResponse.json({ error: "Failed to fetch recent magics" }, { status: 500 });
    }
}
