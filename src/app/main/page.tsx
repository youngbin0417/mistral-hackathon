"use client";

import React, { useState, useEffect, useRef } from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { Play, X, Sparkles, AlertCircle, Blocks, Copy, Check, MessageCircleQuestion } from "lucide-react";
import dynamic from 'next/dynamic';
import { Panel, Group, Separator } from 'react-resizable-panels';
import toast, { Toaster } from 'react-hot-toast';

import ApiSetupModal from '@/components/ApiSetupModal';
import TopNavigation from '@/components/TopNavigation';
import AIStatusBar from '@/components/AIStatusBar';
import SelfHealer from '@/components/SelfHealer';
import { useAiGeneration } from '@/hooks/useAiGeneration';
import { useSelfHealer } from '@/hooks/useSelfHealer';
import { SANDPACK_LIBRARIES } from '@/config/constants';
import { RUNTIME_CODE } from '@/lib/runtime';

class SandpackErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error: Error) {
        console.error("Sandpack crashed:", error);
    }
    render() {
        if (this.state.hasError) {
            return <div className="p-4 text-[var(--neon-pink)] bg-black/50 border border-[var(--neon-pink)] rounded-xl m-4">Sandpack preview crashed. Please reload the page or reset the app.</div>;
        }
        return this.props.children;
    }
}

const BlocklyWorkspace = dynamic(() => import('@/components/BlocklyWorkspace'), {
    ssr: false,
    loading: () => <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-medium">Loading Blockly...</div>
});

export default function Home() {
    const [isMobile, setIsMobile] = useState(false);
    const [needsApiKey, setNeedsApiKey] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState("");

    useEffect(() => {
        fetch('/api/main/config')
            .then(res => res.json())
            .then(data => {
                if (data.hasApiKey === false) {
                    setNeedsApiKey(true);
                }
            })
            .catch(err => console.error("Failed to check API Key", err));

        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSaveApiKey = async () => {
        try {
            const res = await fetch('/api/main/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: apiKeyInput })
            });
            if (res.ok) {
                setNeedsApiKey(false);
                toast.success("API Key saved! Ready to use.");
            } else {
                toast.error("Failed to save API key.");
            }
        } catch {
            toast.error("Error saving API key.");
        }
    };

    const { code, setCode, codeRef, injectedLibs, isGenerating, handleCodeChange } = useAiGeneration(`// Start dragging blocks!`);
    const { isHealing, healingMessage, lastError, handleHeal } = useSelfHealer(codeRef, setCode);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'error' && event.data.message && !isHealing && event.data.message !== lastError) {
                handleHeal(event.data.message);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [handleHeal, isHealing, lastError]);

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const previewLoadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openPreview = () => {
        setIsPreviewLoading(true);
        setIsPreviewModalOpen(true);
        // Always show loader for at least 800ms, then hide it
        if (previewLoadTimerRef.current) clearTimeout(previewLoadTimerRef.current);
        previewLoadTimerRef.current = setTimeout(() => {
            setIsPreviewLoading(false);
            previewLoadTimerRef.current = null;
        }, 800);
    };

    const handleIframeLoad = () => {
        // If the 800ms timer already expired, nothing to do (loader already hidden)
        // If it's still pending, clear it and hide immediately — iframe is ready
        if (previewLoadTimerRef.current) {
            clearTimeout(previewLoadTimerRef.current);
            previewLoadTimerRef.current = null;
            setIsPreviewLoading(false);
        }
    };

    const hasCode = code.trim().length > 0;

    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setIsCopied(true);
            toast.success('Code copied!');
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
    const [isExplaining, setIsExplaining] = useState(false);
    const [explanation, setExplanation] = useState("");

    const handleExplain = async () => {
        if (!code.trim()) return;
        setIsExplainModalOpen(true);
        setIsExplaining(true);
        setExplanation("");
        try {
            const res = await fetch('/api/main/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (res.ok) {
                setExplanation(data.explanation);
            } else {
                setExplanation(data.error || "Failed to explain.");
            }
        } catch {
            setExplanation("Network error occurred.");
        } finally {
            setIsExplaining(false);
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
            <Toaster position="bottom-right" reverseOrder={false} toastOptions={{
                style: { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'Fredoka, sans-serif' }
            }} />

            <ApiSetupModal
                needsApiKey={needsApiKey}
                apiKeyInput={apiKeyInput}
                setApiKeyInput={setApiKeyInput}
                handleSaveApiKey={handleSaveApiKey}
            />

            <TopNavigation injectedLibs={injectedLibs} isGenerating={isGenerating} />

            {/* Healing Notification Overlay */}
            {healingMessage && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
                    <div className="bg-gradient-to-r from-[var(--neon-pink)] to-[var(--neon-purple)] text-white px-6 py-3 rounded-2xl glow-pink flex items-center gap-3">
                        <Sparkles className="animate-spin" size={20} />
                        <span className="font-bold">{healingMessage}</span>
                    </div>
                </div>
            )}

            {/* Main Layout with Resizable Panels */}
            <div className="flex-1 min-h-0">
                <Group orientation={isMobile ? "vertical" : "horizontal"}>
                    {/* Blockly Area */}
                    <Panel defaultSize={42} minSize={30} className="flex flex-col">
                        <BlocklyWorkspace onCodeChange={handleCodeChange} isGenerating={isGenerating} />
                    </Panel>

                    <Separator className="w-1.5 hover:bg-[var(--neon-cyan)]/20 transition-colors flex items-center justify-center group">
                        <div className="h-12 w-0.5 bg-gray-800/30 group-hover:bg-[var(--neon-cyan)] rounded-full transition-colors" />
                    </Separator>

                    {/* Code Area */}
                    <Panel defaultSize={58} minSize={30} className="flex flex-col">
                        <div className="h-full flex flex-col">
                            {/* Code Header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-[var(--card)]/50 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
                                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Live Engine Code</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openPreview()}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-[var(--background)] text-sm font-bold glow-cyan hover:opacity-90 transition-opacity active:scale-95"
                                    >
                                        <Play size={14} fill="currentColor" />
                                        Run Magic
                                    </button>
                                    {/* Explain button */}
                                    <button
                                        onClick={handleExplain}
                                        title="Explain This Code"
                                        className="p-1.5 rounded-lg hover:bg-[var(--neon-pink)]/10 text-[var(--neon-pink)] transition-colors hover:shadow-[0_0_10px_rgba(255,0,200,0.2)]"
                                    >
                                        <MessageCircleQuestion className="w-4 h-4" />
                                    </button>
                                    {/* Copy button */}
                                    <button
                                        onClick={handleCopy}
                                        title="Copy code"
                                        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        {isCopied
                                            ? <Check className="w-3.5 h-3.5 text-[var(--neon-green)]" />
                                            : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                                    </button>
                                </div>
                            </div>

                            {/* Code Body */}
                            <div className="flex-1 relative overflow-hidden bg-[var(--background)]">
                                <SandpackErrorBoundary>
                                    <SandpackProvider
                                        template="vanilla"
                                        theme="dark"
                                        files={{
                                            "/index.js": `console.log("index.js started");\n` + code,
                                            "/index.html": `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body, html { margin: 0; padding: 0; background: #0a0a0f; color: #fff; width: 100%; height: 100%; overflow: hidden; }
    #app { width: 100%; height: 100%; position: relative; }
    canvas { pointer-events: none; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    ${RUNTIME_CODE}
  </script>
  <script src="index.js"></script>
</body>
</html>`
                                        }}
                                        customSetup={{
                                            dependencies: SANDPACK_LIBRARIES
                                        }}
                                    >
                                        <SandpackLayout style={{ height: "100%", width: "100%", borderRadius: 0, border: 'none', display: 'flex', flexDirection: 'column' }}>
                                            <SandpackCodeEditor
                                                readOnly={true}
                                                showTabs={false}
                                                showLineNumbers={true}
                                                style={{ flex: 1, height: "100%", border: 'none', overflow: 'auto' }}
                                            />
                                        </SandpackLayout>

                                        <SelfHealer isHealing={isHealing} lastError={lastError} handleHeal={handleHeal} />

                                    </SandpackProvider>
                                </SandpackErrorBoundary>
                            </div>
                        </div>
                    </Panel>
                </Group>
            </div>

            {/* AI Status Bar (Bottom) */}
            <AIStatusBar isGenerating={isGenerating} isHealing={isHealing} healingMessage={healingMessage} />

            {/* Explain Code Modal */}
            {isExplainModalOpen && (
                <div className="fixed inset-0 z-[300] flex justify-center items-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-[var(--card)] w-full max-w-lg rounded-2xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-[var(--border)]">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--neon-pink)]">
                                <MessageCircleQuestion className="w-5 h-5" />
                                Explain This Code
                            </h2>
                            <button onClick={() => setIsExplainModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-black/50 p-4 rounded-xl border border-[var(--border)] text-sm font-mono text-gray-300 overflow-y-auto max-h-32 mb-4">
                                <pre>{code.split('\n').slice(0, 10).join('\n')}{code.split('\n').length > 10 ? '\n...' : ''}</pre>
                            </div>
                            <div className="min-h-[80px] flex items-center justify-center">
                                {isExplaining ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Sparkles className="w-6 h-6 text-[var(--neon-pink)] animate-spin" />
                                        <p className="text-sm text-gray-400">Analyzing code...</p>
                                    </div>
                                ) : (
                                    <p className="text-base leading-relaxed text-gray-200">{explanation}</p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-[var(--border)] flex justify-end">
                            <button
                                onClick={() => setIsExplainModalOpen(false)}
                                className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Massive Preview Modal */}
            {isPreviewModalOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 p-6 backdrop-blur-md">
                    {/* Modal Header */}
                    <div className="w-full max-w-6xl flex justify-between items-center p-4 bg-[var(--card)] border border-b-0 border-[var(--neon-cyan)]/30 rounded-t-2xl backdrop-blur-md">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-[var(--neon-cyan)] text-glow-cyan">
                            <Play size={18} fill="currentColor" />
                            Live Magic Preview
                        </h3>
                        <button
                            onClick={() => setIsPreviewModalOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-xl"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    {/* Modal Body */}
                    <div className="w-full max-w-6xl aspect-video bg-[#0d0d14] border border-t-0 border-[var(--neon-cyan)]/30 rounded-b-2xl overflow-hidden relative glow-cyan">

                        {/* Empty state — no blocks dragged yet */}
                        {!hasCode && !isPreviewLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[var(--neon-cyan)]/10 border border-[var(--neon-cyan)]/20 flex items-center justify-center">
                                    <Blocks className="w-8 h-8 text-[var(--neon-cyan)]/50" />
                                </div>
                                <div className="text-center">
                                    <p className="text-gray-400 font-semibold">No blocks yet</p>
                                    <p className="text-gray-600 text-sm mt-1">Drag some blocks onto the workspace first</p>
                                </div>
                            </div>
                        )}

                        {/* Loading overlay */}
                        {isPreviewLoading && (
                            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0d0d14]">
                                <div className="relative flex items-center justify-center mb-6">
                                    {/* Outer spinning ring */}
                                    <div className="w-20 h-20 rounded-full border-4 border-[var(--neon-cyan)]/20 border-t-[var(--neon-cyan)] animate-spin" />
                                    {/* Inner pulsing dot */}
                                    <div className="absolute w-8 h-8 rounded-full bg-[var(--neon-cyan)]/20 flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-[var(--neon-cyan)] animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-[var(--neon-cyan)] text-sm font-semibold tracking-widest uppercase animate-pulse">Initializing Magic...</p>
                                <p className="text-gray-600 text-xs mt-1">Running your blocks</p>
                            </div>
                        )}

                        {isHealing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center">
                                <AlertCircle className="text-[var(--neon-pink)] mb-4 animate-pulse" size={48} />
                                <h4 className="text-2xl font-bold text-white mb-2">Self-Healing in Progress</h4>
                                <p className="text-[var(--neon-pink)] text-lg italic animate-pulse">&quot;{healingMessage}&quot;</p>
                            </div>
                        )}

                        <iframe
                            className="w-full h-full border-none"
                            title="Magic Preview"
                            sandbox="allow-scripts allow-modals allow-same-origin"
                            onLoad={handleIframeLoad}
                            srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body, html { margin: 0; padding: 0; background: #0d0d14; color: #fff; width: 100%; height: 100%; overflow: hidden; }
    #app { width: 100%; height: 100%; position: relative; }
    canvas { display: block; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    ${RUNTIME_CODE}
  </script>
  <script type="module">
    window.addEventListener('error', (e) => {
      console.error('Runtime Error:', e.message);
      window.parent.postMessage({ type: 'error', message: e.message }, '*');
    });
    ${code}
  </script>
</body>
</html>`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
