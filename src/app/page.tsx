"use client";

import React, { useState, useEffect } from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { Play, X, Sparkles, AlertCircle, Maximize2 } from "lucide-react";
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

const BlocklyWorkspace = dynamic(() => import('@/components/BlocklyWorkspace'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-medium">Loading Blockly...</div>
});

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  useEffect(() => {
    fetch('/api/config')
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
      const res = await fetch('/api/config', {
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
    } catch (e) {
      toast.error("Error saving API key.");
    }
  };

  const { code, setCode, codeRef, injectedLibs, isGenerating, handleCodeChange } = useAiGeneration(`// Start dragging blocks!`);
  const { isHealing, healingMessage, lastError, handleHeal } = useSelfHealer(codeRef, setCode);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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
            <div className="h-12 w-0.5 bg-[var(--border)] group-hover:bg-[var(--neon-cyan)] rounded-full transition-colors" />
          </Separator>

          {/* Code Area */}
          <Panel defaultSize={58} minSize={30} className="flex flex-col">
            <div className="h-full flex flex-col">
              {/* Code Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[var(--neon-green)] animate-pulse" />
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Live Engine Code</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] text-[var(--background)] text-sm font-bold glow-cyan hover:opacity-90 transition-opacity active:scale-95"
                  >
                    <Play size={14} fill="currentColor" />
                    Run Magic
                  </button>
                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Code Body */}
              <div className="flex-1 relative overflow-hidden bg-[var(--background)]">
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
                  <SandpackLayout style={{ height: "100%", width: "100%", borderRadius: 0, border: 'none', flex: 1, display: 'flex' }}>
                    <SandpackCodeEditor
                      readOnly={true}
                      showTabs={false}
                      showLineNumbers={true}
                      style={{ flex: 1, minHeight: "100%", minWidth: "100%", border: 'none' }}
                    />
                  </SandpackLayout>

                  <SelfHealer isHealing={isHealing} lastError={lastError} handleHeal={handleHeal} />

                </SandpackProvider>
              </div>
            </div>
          </Panel>
        </Group>
      </div>

      {/* AI Status Bar (Bottom) */}
      <AIStatusBar isGenerating={isGenerating} isHealing={isHealing} healingMessage={healingMessage} />


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
          <div className="w-full max-w-6xl aspect-video bg-[var(--background)] border border-t-0 border-[var(--neon-cyan)]/30 rounded-b-2xl overflow-hidden relative glow-cyan">
            {isHealing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="text-[var(--neon-pink)] mb-4 animate-pulse" size={48} />
                <h4 className="text-2xl font-bold text-white mb-2">Self-Healing in Progress</h4>
                <p className="text-[var(--neon-pink)] text-lg italic animate-pulse">"{healingMessage}"</p>
              </div>
            )}

            <iframe
              className="w-full h-full border-none bg-[var(--background)]"
              title="Magic Preview"
              sandbox="allow-scripts allow-modals allow-same-origin"
              srcDoc={`
                <!DOCTYPE html>
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
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                    });
                  </script>
                  <script type="module">
                    window.addEventListener('error', (e) => {
                      console.error("Runtime Error:", e.message);
                      window.parent.postMessage({ type: 'error', message: e.message }, '*');
                    });
                    ${code}
                  </script>
                </body>
                </html>
              `}
            />
          </div>
        </div>
      )}
    </div>
  );
}
