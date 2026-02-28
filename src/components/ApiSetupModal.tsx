import React from 'react';
import { Sparkles } from 'lucide-react';

interface ApiSetupModalProps {
    needsApiKey: boolean;
    apiKeyInput: string;
    setApiKeyInput: (val: string) => void;
    handleSaveApiKey: () => void;
}

export default function ApiSetupModal({ needsApiKey, apiKeyInput, setApiKeyInput, handleSaveApiKey }: ApiSetupModalProps) {
    if (!needsApiKey) return null;

    return (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border-2 border-[var(--neon-pink)]/50 rounded-2xl max-w-md w-full p-8 flex flex-col items-center magic-pulse">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--neon-pink)] to-[var(--neon-purple)] flex items-center justify-center mb-5 glow-pink">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1 text-center">
                    Welcome to <span className="text-[var(--neon-cyan)] text-glow-cyan">Snap</span> & <span className="text-[var(--neon-pink)] text-glow-pink">Build</span>
                </h2>
                <p className="text-gray-400 mb-6 text-sm text-center leading-relaxed">
                    To start generating code with AI, please provide your{' '}
                    <a href="https://console.mistral.ai/" target="_blank" rel="noreferrer" className="text-[var(--neon-cyan)] font-bold hover:underline">
                        Mistral API Key
                    </a>.
                    <br /><br />
                    <span className="text-gray-600 text-[10px] uppercase tracking-wider">(Your key will be saved locally to your .env file)</span>
                </p>
                <input
                    type="password"
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 text-[var(--foreground)] mb-4 focus:border-[var(--neon-cyan)] focus:ring-1 focus:ring-[var(--neon-cyan)] outline-none transition-all font-mono text-sm placeholder:text-gray-600"
                    placeholder="Enter MISTRAL_API_KEY..."
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveApiKey()}
                />
                <button
                    onClick={handleSaveApiKey}
                    className="w-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-[var(--background)] font-bold py-3 px-4 rounded-xl transition-all glow-cyan hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!apiKeyInput.trim()}
                >
                    Save & Start Coding
                </button>
            </div>
        </div>
    );
}
