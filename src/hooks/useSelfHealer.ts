import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { ApiErrorResponse, HealResponse } from '@/types/api';

export function useSelfHealer(codeRef: React.MutableRefObject<string>, setCode: (code: string) => void) {
    const [isHealing, setIsHealing] = useState(false);
    const [healingMessage, setHealingMessage] = useState<string | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);
    const healingAttemptsRef = useRef<Record<string, number>>({});

    const handleHeal = async (errorMessage: string) => {
        // Track errors by both the message and the specific code state that produced it
        // This prevents stale counts when the code has changed but throws the same error
        const errorKey = `${errorMessage}_${codeRef.current}`;

        // Prevent memory leak for long sessions
        if (Object.keys(healingAttemptsRef.current).length > 50) {
            healingAttemptsRef.current = {};
        }

        const attempts = healingAttemptsRef.current[errorKey] || 0;

        if (attempts >= 3) {
            toast.error(
                "Self-healing limit reached! 🚨 Complex error detected. Please try breaking down your 'Magic Block' logic into smaller steps or manually fix standard blocks.",
                { duration: 8000 }
            );
            setLastError(errorMessage); // Stop trying
            return;
        }

        healingAttemptsRef.current[errorKey] = attempts + 1;
        setLastError(errorMessage);
        setIsHealing(true);
        setHealingMessage("AI is analyzing the bug... 🧐");

        try {
            const response = await fetch('/api/heal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: errorMessage, code: codeRef.current })
            });

            if (!response.ok) {
                const errData = (await response.json()) as ApiErrorResponse;
                throw new Error(errData.error || "Self-healing failed");
            }
            const data = (await response.json()) as HealResponse;
            if (data.fixedCode) {
                const expMsg = data.explanation || "Bug fixed! ✨";
                setHealingMessage(expMsg);

                // Play Explanation Audio via ElevenLabs immediately!
                try {
                    const res = await fetch('/api/speak', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: expMsg, voiceId: 'EXAVITQu4vr4xnSDxMaL' })
                    });
                    if (res.ok) {
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const audio = new Audio(url);

                        // Wait for metadata to get duration for better sync
                        audio.onloadedmetadata = () => {
                            const durationMs = (audio.duration * 1000) + 500; // Add small buffer
                            audio.play();

                            setTimeout(() => {
                                setCode(data.fixedCode);
                                setIsHealing(false);
                                setHealingMessage(null);
                                toast.success("Self-Healed successfully!");
                            }, Math.max(2000, durationMs));
                        };
                    } else {
                        // Fallback if audio fails
                        setTimeout(() => {
                            setCode(data.fixedCode);
                            setIsHealing(false);
                            setHealingMessage(null);
                        }, 2000);
                    }
                } catch (e) {
                    console.error("Self-Heal TTS error", e);
                    setCode(data.fixedCode);
                    setIsHealing(false);
                    setHealingMessage(null); // Ensure message is cleared even on TTS error
                }
            }
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : "Self-healing failed. Maybe check your prompts?";
            toast.error(errorMsg);
            setIsHealing(false);
            setHealingMessage(null);
        }
    };

    return {
        isHealing,
        healingMessage,
        lastError,
        handleHeal
    };
}
