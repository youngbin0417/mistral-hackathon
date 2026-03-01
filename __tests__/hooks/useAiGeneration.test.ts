import { renderHook, act } from '@testing-library/react';
import { useAiGeneration } from '@/hooks/useAiGeneration';
import toast from 'react-hot-toast';

jest.mock('react-hot-toast', () => ({
    error: jest.fn(),
    success: jest.fn(),
}));

describe('useAiGeneration Hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it('initializes with provided code', () => {
        const { result } = renderHook(() => useAiGeneration('const x = 1;'));
        expect(result.current.code).toBe('const x = 1;');
    });

    it('triggers AI generation when an uncached prompt is detected', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ code: 'console.log("rainbow");', injectedLibraries: ['p5'] }),
        });

        const { result } = renderHook(() => useAiGeneration(''));

        const rawBlocklyCode = `/* ✨ AI Request: "make rainbow" */\n{ console.log('AI_MAGIC_TRIGGER: make rainbow'); }`;

        await act(async () => {
            result.current.handleCodeChange(rawBlocklyCode);
        });

        expect(global.fetch).toHaveBeenCalledWith('/api/generate', expect.any(Object));
        expect(result.current.code).toContain('import p5 from');
        expect(result.current.code).toContain('console.log("rainbow");');
    });

    it('uses cache and does not fetch for same prompt', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ code: 'cached', injectedLibraries: [] }),
        });

        const { result } = renderHook(() => useAiGeneration(''));
        const codeWithMarker = `/* ✨ AI Request: "test" */\n{ console.log('AI_MAGIC_TRIGGER: test'); }`;

        // First call - triggers fetch
        await act(async () => {
            result.current.handleCodeChange(codeWithMarker);
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);

        // Second call - should use cache
        await act(async () => {
            result.current.handleCodeChange(codeWithMarker);
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('shows toast error when AI generation fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ error: 'API Error' }),
        });

        const { result } = renderHook(() => useAiGeneration(''));
        const codeWithMarker = `/* ✨ AI Request: "fail" */\n{ console.log('AI_MAGIC_TRIGGER: fail'); }`;

        await act(async () => {
            result.current.handleCodeChange(codeWithMarker);
        });

        expect(toast.error).toHaveBeenCalledWith('API Error');
    });
});
