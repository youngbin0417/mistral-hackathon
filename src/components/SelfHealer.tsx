import React, { useEffect } from 'react';
import { useSandpack } from "@codesandbox/sandpack-react";

interface SelfHealerProps {
    lastError: string | null;
    isHealing: boolean;
    handleHeal: (errorMessage: string) => void;
}

export default function SelfHealer({ lastError, isHealing, handleHeal }: SelfHealerProps) {
    const { sandpack } = useSandpack();
    const runtimeError = sandpack.error;

    useEffect(() => {
        if (runtimeError && runtimeError.message !== lastError && !isHealing) {
            handleHeal(runtimeError.message);
        }
    }, [runtimeError, isHealing, lastError, handleHeal]);

    return null;
}
