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
            <div className="bg-gray-900 border border-pink-500 rounded-xl max-w-md w-full p-8 shadow-[0_0_50px_rgba(236,72,153,0.3)] flex flex-col items-center">
                <Sparkles className="text-pink-500 mb-4 animate-pulse" size={48} />
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 mb-2 text-center">Welcome to Mistral Snap</h2>
                <p className="text-gray-300 mb-6 text-sm text-center">
                    To start generating code with AI, please provide your <a href="https://console.mistral.ai/" target="_blank" rel="noreferrer" className="text-cyan-400 font-bold hover:underline">Mistral API Key</a>.
                    <br /><br />
                    <span className="text-gray-500 text-[10px] uppercase tracking-wider">(Your key will be saved locally to your .env file)</span>
                </p>
                <input
                    type="password"
                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white mb-4 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all font-mono text-sm"
                    placeholder="Enter MISTRAL_API_KEY..."
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveApiKey()}
                />
                <button
                    onClick={handleSaveApiKey}
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!apiKeyInput.trim()}
                >
                    Save & Start Coding
                </button>
            </div>
        </div>
    );
}
