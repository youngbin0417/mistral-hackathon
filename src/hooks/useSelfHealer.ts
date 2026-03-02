import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ApiErrorResponse, HealResponse } from '@/types/api';

// Errors that are permanent / unrecoverable by AI – skip healing to avoid spam
const UNRECOVERABLE_PATTERNS = [
    /origin/i,
    /crossorigin/i,
    /blocked by cors/i,
    /out of memory/i,
    /script error/i,         // opaque cross-origin errors
];

// Errors we know are transient (race conditions, audio policy, etc.) — just retry manually
const TRANSIENT_PATTERNS = [
    /play\(\) request was interrupted/i,
    /user aborted/i,
    /network error/i,
];

function categorizeError(msg: string): 'unrecoverable' | 'transient' | 'fixable' {
    if (UNRECOVERABLE_PATTERNS.some(p => p.test(msg))) return 'unrecoverable';
    if (TRANSIENT_PATTERNS.some(p => p.test(msg))) return 'transient';
    return 'fixable';
}

export function useSelfHealer(
    codeRef: React.MutableRefObject<string>,
    setCode: (code: string) => void,
    onHealComplete?: (fixedCode: string) => void   // ← NEW: called after code is applied
) {
    const [isHealing, setIsHealing] = useState(false);
    const [healingMessage, setHealingMessage] = useState<string | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);

    // Key = errorMessage + codeSnapshot — resets naturally when code changes
    const healingAttemptsRef = useRef<Record<string, number>>({});
    // Guard against concurrent heal calls
    const isHealingRef = useRef(false);

    const handleHeal = useCallback(async (errorMessage: string) => {
        // ── 1. Guards ────────────────────────────────────────────────────
        if (isHealingRef.current) return;   // already healing

        const category = categorizeError(errorMessage);
        if (category === 'unrecoverable') {
            console.warn('[SelfHealer] Skipping unrecoverable error:', errorMessage);
            return;
        }
        if (category === 'transient') {
            console.info('[SelfHealer] Transient error, ignoring:', errorMessage);
            return;
        }

        // Prevent memory leak for very long sessions
        if (Object.keys(healingAttemptsRef.current).length > 100) {
            healingAttemptsRef.current = {};
        }

        const errorKey = `${errorMessage}__${codeRef.current.slice(0, 200)}`; // use 200-char snapshot
        const attempts = healingAttemptsRef.current[errorKey] ?? 0;

        if (attempts >= 3) {
            toast.error(
                '🚨 Self-healing limit reached! Try breaking the "Magic Block" into smaller steps or fix manually.',
                { duration: 8000 }
            );
            setLastError(errorMessage);
            return;
        }

        // ── 2. Start healing ─────────────────────────────────────────────
        healingAttemptsRef.current[errorKey] = attempts + 1;
        isHealingRef.current = true;
        setLastError(errorMessage);
        setIsHealing(true);
        setHealingMessage(`🧐 Analyzing error (attempt ${attempts + 1}/3)...`);

        try {
            const response = await fetch('/api/main/heal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: errorMessage, code: codeRef.current })
            });

            if (!response.ok) {
                const errData = (await response.json()) as ApiErrorResponse;
                throw new Error(errData.error || 'Self-healing API failed');
            }

            const data = (await response.json()) as HealResponse;

            if (!data.fixedCode) {
                throw new Error('AI returned no fixed code');
            }

            const expMsg = data.explanation || 'Bug fixed! ✨';
            setHealingMessage(`✅ ${expMsg}`);

            // ── 3. Apply fix with optional TTS narration ────────────────
            const applyFix = () => {
                setCode(data.fixedCode);
                setIsHealing(false);
                isHealingRef.current = false;
                setHealingMessage(null);
                // Notify parent to restart the preview iframe with the new code
                onHealComplete?.(data.fixedCode);
                toast.success('Self-Healed! Preview restarted. ✨');
            };

            // Try TTS narration first, then apply fix after audio ends
            try {
                const res = await fetch('/api/main/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: expMsg, voiceId: 'EXAVITQu4vr4xnSDxMaL' })
                });

                if (res.ok) {
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const audio = new Audio(url);

                    audio.onloadedmetadata = () => {
                        // Apply fix after audio finishes (+ 300ms buffer)
                        const delay = Math.max(1500, audio.duration * 1000 + 300);
                        audio.play().catch(() => { /* autoplay blocked – fall through */ });
                        setTimeout(() => { URL.revokeObjectURL(url); applyFix(); }, delay);
                    };

                    // Safety net: if metadata never fires (e.g. bad blob)
                    audio.onerror = () => { URL.revokeObjectURL(url); setTimeout(applyFix, 1500); };
                } else {
                    setTimeout(applyFix, 1800);
                }
            } catch {
                // TTS unavailable — apply fix after a short dramatic pause
                setTimeout(applyFix, 1800);
            }

        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Self-healing failed. Check your prompts.';
            toast.error(msg);
            setIsHealing(false);
            isHealingRef.current = false;
            setHealingMessage(null);
        }
    }, [codeRef, setCode, onHealComplete]);

    return {
        isHealing,
        healingMessage,
        lastError,
        handleHeal,
    };
}
