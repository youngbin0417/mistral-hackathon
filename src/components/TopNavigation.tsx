import React from 'react';
import { Rocket, Sparkles, Zap } from 'lucide-react';

interface TopNavigationProps {
    injectedLibs: string[];
    isGenerating: boolean;
}

export default function TopNavigation({ injectedLibs, isGenerating }: TopNavigationProps) {
    return (
        <header className="flex items-center justify-between px-5 py-3 bg-[var(--card)]/80 backdrop-blur-md mb-0 shadow-sm shadow-black/20 relative z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] flex items-center justify-center glow-cyan animate-float">
                    <Rocket className="w-5 h-5 text-[var(--background)]" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight">
                        <span className="text-[var(--neon-cyan)] text-glow-cyan">Snap</span>
                        <span className="text-[var(--foreground)]"> & </span>
                        <span className="text-[var(--neon-pink)] text-glow-pink">Build</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                        Powered by Mistral AI
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                {injectedLibs.length > 0 && (
                    <div className="flex gap-1.5 mr-2">
                        {injectedLibs.map(lib => (
                            <span key={lib} className="text-[10px] font-semibold bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/30 text-[var(--neon-cyan)] px-2.5 py-1 rounded-xl">
                                {lib}
                            </span>
                        ))}
                    </div>
                )}
                {isGenerating && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--neon-pink)]/10 to-[var(--neon-purple)]/10 border border-[var(--neon-pink)]/30 magic-pulse">
                        <Sparkles className="w-4 h-4 text-[var(--neon-pink)] animate-spin" />
                        <span className="text-xs font-semibold text-[var(--neon-pink)] tracking-wider uppercase">
                            AI Processing...
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
                    <span className="text-[10px] text-gray-400 font-medium">Codestral Connected</span>
                </div>
            </div>
        </header>
    );
}
