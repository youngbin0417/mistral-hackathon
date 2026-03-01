/**
 * @jest-environment node
 */
import { POST } from '@/app/api/sfx/route';

global.fetch = jest.fn();

describe('/api/sfx API Route', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetAllMocks();
        process.env = { ...originalEnv, ELEVENLABS_API_KEY: 'test-key' };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('returns 400 if text is missing', async () => {
        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await POST(req);
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe('Text prompt is required');
    });

    it('returns 200 with mock buffer if API key is missing', async () => {
        delete process.env.ELEVENLABS_API_KEY;
        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ text: 'laser' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
        const data = await response.arrayBuffer();
        expect(data.byteLength).toBe(1);
    });

    it('appends BGM context to prompt if isBGM is true', async () => {
        const mockAudioBuffer = new ArrayBuffer(8);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            arrayBuffer: async () => mockAudioBuffer,
        });

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ text: 'tense battle', isBGM: true, duration_seconds: 5 }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);

        // Verify fetch was called with correct mutated text
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.elevenlabs.io/v1/sound-generation',
            expect.objectContaining({
                method: 'POST',
                body: expect.stringMatching(/Video game background music loop, tense battle/)
            })
        );
    });

    it('does not append BGM context if isBGM is false', async () => {
        const mockAudioBuffer = new ArrayBuffer(8);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            arrayBuffer: async () => mockAudioBuffer,
        });

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ text: 'laser gun', isBGM: false }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.elevenlabs.io/v1/sound-generation',
            expect.objectContaining({
                method: 'POST',
                body: expect.stringMatching(/"text":"laser gun"/)
            })
        );
    });

    it('handles ElevenLabs API errors gracefully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 403,
            text: async () => 'Forbidden',
        });

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ text: 'explosion' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(403);
        const data = await response.json();
        expect(data.error).toBe('Failed to generate sound effect');
    });
});
