import React from 'react';

interface TopNavigationProps {
    injectedLibs: string[];
    isGenerating: boolean;
}

export default function TopNavigation({ injectedLibs, isGenerating }: TopNavigationProps) {
    return (
        <header className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                Mistral Snap & Build
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
                {injectedLibs.length > 0 && (
                    <div className="flex gap-1 mr-2">
                        {injectedLibs.map(lib => (
                            <span key={lib} className="text-xs bg-cyan-900 border border-cyan-500 text-cyan-300 px-2 py-0.5 rounded animate-pulse">
                                {lib} loaded
                            </span>
                        ))}
                    </div>
                )}
                {isGenerating && (
                    <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/50 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                        <div className="relative flex items-center justify-center w-5 h-5">
                            <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative bg-pink-600 w-3 h-3 rounded-full shadow-[0_0_10px_#ec4899]"></div>
                            <div className="absolute w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <span className="text-xs font-bold tracking-widest text-pink-400 uppercase">
                            AI Neural Processing...
                        </span>
                    </div>
                )}
                <div className="text-sm text-gray-400 border border-gray-800 px-3 py-1 rounded-full flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>
                    Phase 5 Self-Healing
                </div>
            </div>
        </header>
    );
}
