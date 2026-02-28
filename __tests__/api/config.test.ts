/**
 * @jest-environment node
 */
import { GET, POST } from '@/app/api/config/route';

jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(false),
    readFileSync: jest.fn(),
    writeFileSync: jest.fn(),
}));

describe('/api/config', () => {
    const originalEnv = process.env;
    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });
    afterAll(() => {
        process.env = originalEnv;
    });

    describe('GET', () => {
        it('returns true if MISTRAL_API_KEY exists', async () => {
            process.env.MISTRAL_API_KEY = "dummy-key";
            const response = await GET();
            const json = await response.json();
            expect(json.hasApiKey).toBe(true);
        });
        it('returns false if MISTRAL_API_KEY does not exist', async () => {
            delete process.env.MISTRAL_API_KEY;
            const response = await GET();
            const json = await response.json();
            expect(json.hasApiKey).toBe(false);
        });
    });

    describe('POST', () => {
        it('fails if no api key provided', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            const response = await POST(req);
            expect(response.status).toBe(400);
            const json = await response.json();
            expect(json.error).toBe("No API key provided");
        });

        it('saves the api key successfully', async () => {
            const req = new Request('http://localhost/', {
                method: 'POST',
                body: JSON.stringify({ apiKey: "test-save-key" }),
            });
            const response = await POST(req);
            expect(response.status).toBe(200);
            const json = await response.json();
            expect(json.success).toBe(true);
            expect(process.env.MISTRAL_API_KEY).toBe("test-save-key");
        });
    });
});
