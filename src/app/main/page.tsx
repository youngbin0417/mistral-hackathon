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
import MistralCat from '@/components/MistralCat';
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
        <div className="flex flex-col h-[100dvh] bg-[var(--background)] text-[var(--foreground)] overflow-hidden app-fixed-height">
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
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-bounce font-mono">
                    <div className="bg-[#FD5A1E] text-black px-6 py-3 rounded-none shadow-xl flex items-center gap-3 border border-[#F3ECE5]/20">
                        <Sparkles className="animate-spin" size={20} />
                        <span className="font-bold tracking-tight">&gt;&gt; {healingMessage}</span>
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
                            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-[#F3ECE5]/10 font-mono">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 animate-pulse" />
                                    <p className="text-xs text-[#F3ECE5]/50 font-bold uppercase tracking-widest">Live_Engine_Code</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openPreview()}
                                        className="flex items-center gap-2 px-4 py-2 bg-[#FD5A1E] text-black text-sm font-bold tracking-wide hover:bg-[#FF733D] transition-colors active:scale-95"
                                    >
                                        <Play size={14} fill="currentColor" />
                                        EXECUTE
                                    </button>
                                    {/* Explain button */}
                                    <button
                                        onClick={handleExplain}
                                        title="Explain This Code"
                                        className="p-2 border border-[#F3ECE5]/10 hover:border-[#FD5A1E] text-[#F3ECE5]/70 hover:text-[#FD5A1E] transition-colors"
                                    >
                                        <MessageCircleQuestion className="w-4 h-4" />
                                    </button>
                                    {/* Copy button */}
                                    <button
                                        onClick={handleCopy}
                                        title="Copy code"
                                        className="p-2 border border-[#F3ECE5]/10 hover:border-[#F3ECE5]/50 text-[#F3ECE5]/70 hover:text-[#F3ECE5] transition-colors"
                                    >
                                        {isCopied
                                            ? <Check className="w-4 h-4 text-green-500" />
                                            : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Code Body */}
                            <div className="flex-1 min-h-0 relative overflow-hidden bg-[var(--background)] flex flex-col">
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
    body, html { margin: 0; padding: 0; background: #000000; color: #F3ECE5; width: 100%; height: 100%; overflow: hidden; font-family: monospace; }
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
                                        <SandpackLayout style={{ height: "100%", width: "100%", borderRadius: 0, border: 'none', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                            <SandpackCodeEditor
                                                readOnly={true}
                                                showTabs={false}
                                                showLineNumbers={true}
                                                style={{ flex: 1, border: 'none', minHeight: 0, overflow: 'auto' }}
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
                <div className="fixed inset-0 z-[300] flex justify-center items-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-[#0A0A0A] w-full max-w-lg border border-[#F3ECE5]/20 shadow-2xl flex flex-col font-mono">
                        <div className="flex justify-between items-center p-4 border-b border-[#F3ECE5]/10 bg-[#111111]">
                            <h2 className="text-sm font-bold flex items-center gap-2 text-[#FD5A1E]">
                                <MessageCircleQuestion className="w-4 h-4" />
                                system_explain
                            </h2>
                            <button onClick={() => setIsExplainModalOpen(false)} className="hover:text-[#FD5A1E] text-[#F3ECE5]/40 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="bg-black p-4 border border-[#F3ECE5]/10 text-xs text-[#F3ECE5]/60 overflow-y-auto max-h-32 mb-6">
                                <pre>{code.split('\n').slice(0, 10).join('\n')}{code.split('\n').length > 10 ? '\n...' : ''}</pre>
                            </div>
                            <div className="min-h-[80px] flex items-center justify-center">
                                {isExplaining ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <MistralCat size="small" className="text-[#FD5A1E] mb-2" />
                                        <p className="text-sm text-[#F3ECE5]/40 animate-pulse">Analyzing instructions...</p>
                                    </div>
                                ) : (
                                    <p className="text-sm leading-relaxed text-[#F3ECE5]/80 font-sans">{explanation}</p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-[#F3ECE5]/10 flex justify-end bg-[#111111]">
                            <button
                                onClick={() => setIsExplainModalOpen(false)}
                                className="px-6 py-2 border border-[#F3ECE5]/20 hover:border-[#F3ECE5]/50 text-[#F3ECE5] font-bold text-sm transition-colors"
                            >
                                &gt; ack
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Massive Preview Modal */}
            {isPreviewModalOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-6 backdrop-blur-md">
                    {/* Modal Header */}
                    <div className="w-full max-w-6xl flex justify-between items-center px-4 py-3 bg-[#111111] border border-b-0 border-[#F3ECE5]/20 font-mono">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-[#FD5A1E]">
                            <Play size={14} fill="currentColor" />
                            live_magic_preview
                        </h3>
                        <button
                            onClick={() => setIsPreviewModalOpen(false)}
                            className="text-[#F3ECE5]/50 hover:text-[#FD5A1E] transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                    {/* Modal Body */}
                    <div className="w-full max-w-6xl aspect-video bg-black border border-t-0 border-[#F3ECE5]/20 overflow-hidden relative">

                        {/* Empty state — no blocks dragged yet */}
                        {!hasCode && !isPreviewLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border border-dashed border-[#F3ECE5]/10 m-8">
                                <Blocks className="w-12 h-12 text-[#F3ECE5]/20" />
                                <div className="text-center font-mono">
                                    <p className="text-[#F3ECE5]/50 font-bold">No blocks detected</p>
                                    <p className="text-[#F3ECE5]/30 text-xs mt-2">&gt; drag components to initiate sequence</p>
                                </div>
                            </div>
                        )}

                        {/* Loading overlay */}
                        {isPreviewLoading && (
                            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black font-mono">
                                <div className="text-[#FD5A1E] flex flex-col items-center">
                                    <MistralCat size="large" className="mb-8" />
                                    <p className="text-sm font-bold tracking-widest uppercase animate-pulse">Initializing_Magic_Sequence</p>
                                    <p className="text-[#F3ECE5]/40 text-xs mt-2">Compiling instructions...</p>
                                </div>
                            </div>
                        )}

                        {isHealing && (
                            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center font-mono border-4 border-[#FD5A1E]/20">
                                <AlertCircle className="text-[#FD5A1E] mb-4 animate-pulse" size={48} />
                                <h4 className="text-xl font-bold text-[#F3ECE5] mb-2 uppercase tracking-wide">Self-Healing Protocol Engaged</h4>
                                <p className="text-[#FD5A1E] text-sm">&gt; {healingMessage}</p>
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
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/addons/p5.sound.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
  <style>
    body, html { margin: 0; padding: 0; background: #1a1a1e; color: #F3ECE5; width: 100%; height: 100%; overflow: hidden; font-family: Fredoka, sans-serif; }
    #app { width: 100%; height: 100%; position: relative; }
    canvas { display: block; }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    ${RUNTIME_CODE}
  </script>
  <script>
    // Error handling to communicate back to parent frame for self-healing
    window.addEventListener('error', (e) => {
      console.error('Runtime Error:', e.message);
      window.parent.postMessage({ type: 'error', message: e.message }, '*');
    });

    // Strip out all ESM imports from the code as we are loading via script tags
    const cleanCode = \`${code.replace(/import\s+[\s\S]+?from\s+['"].+?['"];?\n?/g, '')}\`;

    // Execute the code. Since we want setup() and draw() to be global for p5,
    // we use a regular script tag/eval approach or just wrap in an async function.
    try {
        const script = document.createElement('script');
        script.text = cleanCode;
        document.body.appendChild(script);
    } catch (err) {
        console.error('Execution Error:', err);
    }
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
