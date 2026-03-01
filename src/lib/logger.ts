import pino from 'pino';

// Basic logger setup for stdout/pino-pretty only to avoid permission issues.
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        targets: [
            {
                target: 'pino-pretty', // default for hackathon/dev
                options: {
                    colorize: true,
                },
            },
        ],
    },
});
