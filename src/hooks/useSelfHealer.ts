import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

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
                const errData = await response.json();
                throw new Error(errData.error || "Self-healing failed");
            }
            const data = await response.json();
            if (data.fixedCode) {
                setHealingMessage(data.explanation || "Bug fixed! ✨");
                setTimeout(() => {
                    setCode(data.fixedCode);
                    setIsHealing(false);
                    setHealingMessage(null);
                    toast.success("Self-Healed successfully!");
                }, 3000);
            }
        } catch (err: any) {
            toast.error(err.message || "Self-healing failed. Maybe check your prompts?");
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
