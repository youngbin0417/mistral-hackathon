import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

export const logger = pino({
    level: process.env.LOG_LEVEL || 'debug',
    transport: {
        targets: [
            {
                target: 'pino/file',
                options: {
                    destination: path.join(logDir, 'app.log'),
                },
            },
            {
                target: 'pino-pretty', // also output to console nicely during dev
                options: {
                    colorize: true,
                },
            },
        ],
    },
});
