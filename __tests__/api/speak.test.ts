/**
 * @jest-environment node
 */
import { POST } from '@/app/api/speak/route';

// Mock the global fetch
global.fetch = jest.fn();

describe('/api/speak API Route', () => {
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
        expect(data.error).toBe('Text is required');
    });

    it('returns 200 with mock buffer if API key is missing', async () => {
        delete process.env.ELEVENLABS_API_KEY;
        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ text: 'Hello' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
        const data = await response.arrayBuffer();
        expect(data.byteLength).toBe(1);
    });

    it('returns audio buffer successfully', async () => {
        const mockAudioBuffer = new ArrayBuffer(8);
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            arrayBuffer: async () => mockAudioBuffer,
        });

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ text: 'Hello World', voiceId: 'voice123' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe('audio/mpeg');

        // Convert the NextResponse stream to ArrayBuffer for testing
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        expect(buffer.byteLength).toBe(mockAudioBuffer.byteLength);

        // Verify fetch was called correctly
        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.elevenlabs.io/v1/text-to-speech/voice123',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'xi-api-key': 'test-key',
                }),
            })
        );
    });

    it('handles ElevenLabs API errors gracefully', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
            text: async () => 'Unauthorized',
        });

        const req = new Request('http://localhost', {
            method: 'POST',
            body: JSON.stringify({ text: 'Hello World' }),
        });

        const response = await POST(req);
        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data.error).toBe('Failed to generate speech');
    });
});
