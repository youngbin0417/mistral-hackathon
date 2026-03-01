import { useState, useRef, useEffect } from 'react';
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
                        // Use the default or 'cute' voice ID if you prefer
                        body: JSON.stringify({ text: expMsg, voiceId: 'EXAVITQu4vr4xnSDxMaL' })
                    });
                    if (res.ok) {
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const audio = new Audio(url);
                        audio.play();
                    }
                } catch (e) { console.error("Self-Heal TTS error", e); }

                // Wait 4 seconds for audio to play then replace the code completely
                setTimeout(() => {
                    setCode(data.fixedCode);
                    setIsHealing(false);
                    setHealingMessage(null);
                    toast.success("Self-Healed successfully!");
                }, 4000);
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
