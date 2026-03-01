"use client";

import React, { useState } from 'react';
import { Bot, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface AIStatusBarProps {
    isGenerating: boolean;
    isHealing: boolean;
    healingMessage: string | null;
}

const phases = [
    { label: "system_idle", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-500" },
    { label: "analyzing_magic_block...", icon: <Sparkles className="w-3.5 h-3.5" />, color: "text-[#F3ECE5]" },
    { label: "codestral_generating...", icon: <Bot className="w-3.5 h-3.5" />, color: "text-[#FD5A1E]" },
    { label: "refining_and_optimizing...", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: "text-[#FF733D]" },
    { label: "execution_complete!", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-green-500" },
];

export default function AIStatusBar({ isGenerating, isHealing, healingMessage }: AIStatusBarProps) {
    const [phase, setPhase] = useState(0);

    // Use ref to track timers and avoid setState in effect
    const timersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

    React.useEffect(() => {
        if (isGenerating) {
            setPhase(1);
            const t1 = setTimeout(() => setPhase(2), 1500);
            const t2 = setTimeout(() => setPhase(3), 4000);
            timersRef.current = [t1, t2];
        }
        return () => {
            timersRef.current.forEach(clearTimeout);
            timersRef.current = [];
        };
    }, [isGenerating]);

    React.useEffect(() => {
        if (phase === 4) {
            const t = setTimeout(() => setPhase(0), 3000);
            return () => clearTimeout(t);
        }
    }, [phase]);

    const current = isHealing
        ? { label: healingMessage || "self_healing_initiated...", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: "text-[#FD5A1E]" }
        : phases[phase];

    return (
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#0A0A0A] border-t border-b border-[#F3ECE5]/10 relative z-10 font-mono shadow-sm">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className={current.color}>{current.icon}</span>
                    <span className={`text-xs font-semibold uppercase tracking-widest ${current.color}`}>
                        <span className="opacity-50">&gt; </span>{current.label}
                    </span>
                </div>

                {/* Progress dots */}
                {isGenerating && (
                    <div className="flex items-center gap-1.5 ml-4">
                        {phases.slice(1, 5).map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 transition-all duration-300 ${i + 1 <= phase ? "bg-[#FD5A1E]" : "bg-[#F3ECE5]/20"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}
