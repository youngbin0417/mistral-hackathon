import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface Magic {
    prompt: string;
    code: string;
    timestamp: number;
}

export default function RecentMagics() {
    const [recent, setRecent] = useState<Magic[]>([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await fetch('/api/recent');
                const data = await res.json();
                if (data.recent) setRecent(data.recent);
            } catch (e) {
                console.error("Failed to fetch recent magics", e);
            }
        };

        fetchRecent();
        const interval = setInterval(fetchRecent, 20000); // 20s interval
        return () => clearInterval(interval);
    }, []);

    if (recent.length === 0) return null;

    return (
        <div className="mt-4 bg-gray-900/80 border border-gray-800 rounded-lg p-3 backdrop-blur-md">
            <h3 className="text-xs font-black text-pink-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                Recent Community Magics
            </h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {recent.map((m: Magic, i: number) => (
                    <div
                        key={i}
                        className="flex-shrink-0 bg-black/40 border border-gray-800 hover:border-pink-500/50 p-2 rounded-md transition-all cursor-help group"
                        title={m.prompt}
                        aria-label={`Code generation prompt: ${m.prompt}`}
                    >
                        <p className="text-[10px] text-cyan-400 font-mono mb-1 tracking-tighter opacity-70">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-white group-hover:text-pink-400 transition-colors">
                            ✨ {m.prompt.length > 25 ? m.prompt.substring(0, 25) + '...' : m.prompt}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
