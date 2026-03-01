"use client";

import React, { useState, useEffect } from 'react';
import { Bot, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

interface AIStatusBarProps {
    isGenerating: boolean;
    isHealing: boolean;
    healingMessage: string | null;
}

const phases = [
    { label: "Idle", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-[var(--neon-green)]" },
    { label: "Interpreting Magic Block...", icon: <Sparkles className="w-3.5 h-3.5" />, color: "text-[var(--neon-pink)]" },
    { label: "Generating Code...", icon: <Bot className="w-3.5 h-3.5" />, color: "text-[var(--neon-cyan)]" },
    { label: "Refining & Optimizing...", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: "text-[var(--neon-purple)]" },
    { label: "Complete! ✨", icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: "text-[var(--neon-green)]" },
];

export default function AIStatusBar({ isGenerating, isHealing, healingMessage }: AIStatusBarProps) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        if (isGenerating) {
            setPhase(1);
            const t1 = setTimeout(() => setPhase(2), 1500);
            const t2 = setTimeout(() => setPhase(3), 4000);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        } else if (phase >= 1 && phase < 4) {
            setPhase(4);
            const t = setTimeout(() => setPhase(0), 3000);
            return () => clearTimeout(t);
        }
    }, [isGenerating]);

    const current = isHealing
        ? { label: healingMessage || "Self-Healing...", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, color: "text-[var(--neon-orange)]" }
        : phases[phase];

    return (
        <div className="flex items-center justify-between px-5 py-2.5 bg-[var(--card)]/80 backdrop-blur-md relative z-10 shadow-lg shadow-black/30">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                    <span className={current.color}>{current.icon}</span>
                    <span className={`text-xs font-semibold ${current.color}`}>
                        {current.label}
                    </span>
                </div>

                {/* Progress dots */}
                {isGenerating && (
                    <div className="flex items-center gap-1 ml-2">
                        {phases.slice(1, 5).map((_, i) => (
                            <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i + 1 <= phase ? "bg-[var(--neon-cyan)]" : "bg-gray-700"
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
                    <span className="text-[10px] text-gray-500 font-medium">Codestral Connected</span>
                </div>
            </div>
        </div>
    );
}
