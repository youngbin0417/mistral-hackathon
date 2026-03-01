import Link from 'next/link';
import { Terminal } from 'lucide-react';

interface TopNavigationProps {
    injectedLibs: string[];
    isGenerating: boolean;
}

export default function TopNavigation({ injectedLibs, isGenerating }: TopNavigationProps) {
    return (
        <header className="flex items-center justify-between px-5 py-3 bg-[#0A0A0A] border-b border-[#F3ECE5]/10 shadow-sm relative z-10 font-mono">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 flex items-center justify-center text-[#FD5A1E]">
                    <Terminal className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-[#F3ECE5]">
                        blockstral
                    </h1>
                    <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">
                        system@mistral
                    </p>
                </div>
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
                {injectedLibs.length > 0 && (
                    <div className="flex gap-1.5 mr-2">
                        {injectedLibs.map(lib => (
                            <span key={lib} className="text-[10px] font-semibold bg-[#F3ECE5]/5 border border-[#F3ECE5]/20 text-[#F3ECE5]/80 px-2.5 py-1">
                                {lib}
                            </span>
                        ))}
                    </div>
                )}
                {isGenerating && (
                    <div className="flex items-center gap-2 px-4 py-1.5 border border-[#FD5A1E]/30 bg-[#FD5A1E]/10">
                        <span className="text-xs font-semibold text-[#FD5A1E] tracking-wider uppercase flex items-center gap-2">
                            <span className="animate-pulse">&gt;</span> AI_PROCESSING...
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/30">
                    <div className="w-1.5 h-1.5 bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-medium">Codestral_Active</span>
                </div>
            </div>
        </header>
    );
}
