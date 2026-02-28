"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, useSandpack } from "@codesandbox/sandpack-react";
import { Play, Code, X, Sparkles, AlertCircle, MoveHorizontal } from "lucide-react";
import dynamic from 'next/dynamic';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  applyCachedReplacements,
  prependImports,
  stripMarkdownFences,
  type AiCacheEntry,
} from '@/lib/codeTransform';

// Helper for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BlocklyWorkspace = dynamic(() => import('@/components/BlocklyWorkspace'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading Blockly...</div>
});

// prependImports is now imported from @/lib/codeTransform

import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [code, setCode] = useState(`// Start dragging blocks!`);
  const codeRef = useRef(code);
  useEffect(() => { codeRef.current = code; }, [code]);

  const [injectedLibs, setInjectedLibs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isHealing, setIsHealing] = useState(false);
  const [healingMessage, setHealingMessage] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [aiCache, setAiCache] = useState<Record<string, AiCacheEntry>>({});
  const aiCacheRef = useRef<Record<string, AiCacheEntry>>({});
  const healingAttemptsRef = useRef<Record<string, number>>({});

  const handleCodeChange = (rawCode: string) => {
    // 1. 블록 삭제 시 캐시에서도 정리 (안쓰는 import 제거 효과)
    let cacheChanged = false;
    const newCache = { ...aiCacheRef.current };
    Object.keys(newCache).forEach(prompt => {
      if (!rawCode.includes(`// AI: ${prompt}`)) {
        delete newCache[prompt];
        cacheChanged = true;
      }
    });

    if (cacheChanged) {
      aiCacheRef.current = newCache;
      setAiCache(newCache);
    }

    const { processedCode, uncachedPrompts } = applyCachedReplacements(rawCode, aiCacheRef.current);
    const allLibs = Array.from(new Set(Object.values(aiCacheRef.current).flatMap(e => e.libs)));
    const finalCode = allLibs.length > 0 ? prependImports(processedCode, allLibs) : processedCode;

    setCode(finalCode);
    if (uncachedPrompts.length > 0 && !isGenerating) {
      triggerAiGeneration(uncachedPrompts[0], rawCode);
    }
  };

  const triggerAiGeneration = async (prompt: string, fullRawCode: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context: { fullCode: fullRawCode } })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "AI Generation failed");
      }
      const data = await response.json();
      if (data.code) {
        const cleanCode = stripMarkdownFences(data.code);
        const newLibs: string[] = data.injectedLibraries || [];
        const newEntry: AiCacheEntry = { code: cleanCode, libs: newLibs };

        aiCacheRef.current = { ...aiCacheRef.current, [prompt]: newEntry };
        setAiCache(aiCacheRef.current);
        if (newLibs.length > 0) setInjectedLibs(prev => Array.from(new Set([...prev, ...newLibs])));

        const { processedCode } = applyCachedReplacements(fullRawCode, aiCacheRef.current);
        const allLibs = Array.from(new Set(Object.values(aiCacheRef.current).flatMap(e => e.libs)));
        setCode(allLibs.length > 0 ? prependImports(processedCode, allLibs) : processedCode);
      }
    } catch (err: any) {
      toast.error(err.message || "AI Magic failed! Please try again.");
      console.error("AI Generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Self Healing Component ---
  const SelfHealer = () => {
    const { sandpack } = useSandpack();
    const runtimeError = sandpack.error;

    useEffect(() => {
      if (runtimeError && runtimeError.message !== lastError && !isHealing) {
        handleHeal(runtimeError.message);
      }
    }, [runtimeError, isHealing]);

    return null;
  };

  const handleHeal = async (errorMessage: string) => {
    const attempts = healingAttemptsRef.current[errorMessage] || 0;
    if (attempts >= 3) {
      toast.error("I tried my best, but couldn't fix this error. Please adjust the blocks manually.");
      setLastError(errorMessage); // Stop trying
      return;
    }

    healingAttemptsRef.current[errorMessage] = attempts + 1;
    setLastError(errorMessage);
    setIsHealing(true);
    setHealingMessage("AI is analyzing the bug... 🧐");

    try {
      const response = await fetch('/api/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: errorMessage, code: codeRef.current })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Self-healing failed");
      }
      const data = await response.json();
      if (data.fixedCode) {
        setHealingMessage(data.explanation || "Bug fixed! ✨");
        setTimeout(() => {
          setCode(data.fixedCode);
          setIsHealing(false);
          setHealingMessage(null);
          toast.success("Self-Healed successfully!");
        }, 3000);
      }
    } catch (err: any) {
      toast.error(err.message || "Self-healing failed. Maybe check your prompts?");
      setIsHealing(false);
      setHealingMessage(null);
    }
  };

  // --- Recent Magic Component ---
  const RecentMagics = () => {
    const [recent, setRecent] = useState<any[]>([]);

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
          {recent.map((m: any, i: number) => (
            <div
              key={i}
              className="flex-shrink-0 bg-black/40 border border-gray-800 hover:border-pink-500/50 p-2 rounded-md transition-all cursor-help group"
              title={m.prompt}
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
  };

  return (
    <div className="flex flex-col h-[100dvh] p-2 md:p-4 bg-gray-950 text-white font-sans overflow-hidden">
      <Toaster position="bottom-right" reverseOrder={false} />
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

      {/* Healing Notification Overlay */}
      {healingMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
          <div className="bg-pink-600 border-2 border-white text-white px-6 py-3 rounded-full shadow-[0_0_30px_rgba(236,72,153,0.6)] flex items-center gap-3">
            <Sparkles className="animate-spin" size={20} />
            <span className="font-bold">{healingMessage}</span>
          </div>
        </div>
      )}

      {/* Main Layout with Resizable Panels */}
      <div className="flex flex-1 gap-2 overflow-hidden px-1 pb-2">
        <Group orientation={isMobile ? "vertical" : "horizontal"}>
          {/* Blockly Area */}
          <Panel defaultSize={50} minSize={30} className="flex flex-col">
            <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-2 flex flex-col relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2 px-2">
                <h2 className="text-lg font-semibold text-cyan-400">Blockly Workspace</h2>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", isGenerating ? "bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899]" : "bg-gray-700")} />
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Workspace Status</span>
                </div>
              </div>

              <div className={cn(
                "flex-1 bg-black/40 rounded-md relative overflow-hidden transition-all duration-700",
                isGenerating ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-950 scale-[0.995] shadow-[0_0_30px_rgba(236,72,153,0.1)]' : 'ring-1 ring-gray-800/50'
              )}>
                <BlocklyWorkspace onCodeChange={handleCodeChange} isGenerating={isGenerating} />

                {/* AI Scanning Overlay */}
                {isGenerating && (
                  <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent animate-scanline"></div>
                    <div className="absolute inset-0 bg-pink-900/10 backdrop-blur-[1px]"></div>
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-pink-400 font-mono text-sm tracking-tighter bg-black/60 px-3 py-1 rounded">SCANNING LOGIC...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Separator className="w-1.5 hover:bg-cyan-500/30 transition-colors flex items-center justify-center group">
            <div className="h-12 w-0.5 bg-gray-800 group-hover:bg-cyan-400 rounded-full transition-colors flex items-center justify-center relative">
              <MoveHorizontal size={10} className="absolute text-cyan-400 bg-gray-900 rounded-full border border-gray-800 p-0.5 hidden group-hover:block translate-x-1" />
            </div>
          </Separator>

          {/* Code Area */}
          <Panel defaultSize={40} minSize={20} className="flex flex-col shadow-2xl">
            <div className="flex-1 flex flex-col bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden relative glass">
              <div className="p-3 border-b border-gray-800 bg-gray-950/80 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-cyan-950/50 border border-cyan-500/30">
                    <Code size={16} className="text-cyan-400" />
                  </div>
                  <h2 className="text-lg font-bold text-cyan-400 tracking-tight italic">Live Engine Code</h2>
                </div>
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-md transition-all duration-300 text-sm font-black border border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] active:scale-95"
                >
                  <Play size={16} fill="white" />
                  RUN MAGIC
                </button>
              </div>
              <div className="flex-1 w-full h-full relative pointer-events-auto bg-black/60 rounded-b-lg overflow-hidden flex flex-col custom-scrollbar">
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
    // --- SNAP & BUILD RUNTIME ---
    window.entities = {};
    window.createSprite = (name, x, y) => {
        if (!window.entities[name]) {
            console.log("Creating entity:", name);
            window.entities[name] = { x, y, angle: 0, color: '#00f0ff' };
        }
    };
    window.moveForward = (amount) => {
        Object.values(window.entities).forEach(e => {
            e.x += Math.cos(e.angle) * amount;
            e.y += Math.sin(e.angle) * amount;
        });
    };
    window.turnRight = (deg) => {
        const rad = (deg * Math.PI) / 180;
        Object.values(window.entities).forEach(e => e.angle += rad);
    };

    // Canvas Setup
    const app = document.getElementById('app');
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    app.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function draw() {
        const extraCanvas = document.querySelectorAll('canvas').length > 1;
        if (extraCanvas) {
            canvas.style.display = 'none';
        } else {
            canvas.style.display = 'block';
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            Object.entries(window.entities).forEach(([name, e]) => {
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.rotate(e.angle);
                ctx.shadowBlur = 10;
                ctx.shadowColor = e.color;
                ctx.fillStyle = e.color;
                // Triangle ship
                ctx.beginPath();
                ctx.moveTo(20, 0); ctx.lineTo(-10, 15); ctx.lineTo(-10, -15); ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = '10px monospace';
                ctx.fillText(name, -10, 25);
                ctx.restore();
            });
        }
        requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    console.log("Runtime initialized");
  </script>
  <script src="index.js"></script>
</body>
</html>`
                  }}
                  customSetup={{
                    dependencies: {
                      "p5": "^1.9.0",
                      "matter-js": "^0.19.0"
                    }
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

                  <SelfHealer />

                </SandpackProvider>
              </div>
            </div>
          </Panel>
        </Group>
      </div>

      <RecentMagics />


      {/* Massive Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black bg-opacity-80 p-6 backdrop-blur-md">
          {/* Modal Header */}
          <div className="w-full max-w-6xl flex justify-between items-center p-4 bg-gray-900 border border-b-0 border-pink-500 rounded-t-xl shadow-[0_0_30px_rgba(236,72,153,0.3)] z-10">
            <h3 className="text-xl font-bold flex items-center gap-2 text-pink-400">
              <Play size={20} fill="currentColor" />
              Live Magic Preview
            </h3>
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="text-gray-400 hover:text-white transition-colors bg-gray-800 hover:bg-gray-700 p-1.5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          {/* Modal Body */}
          <div className="w-full max-w-6xl aspect-video bg-black border border-t-0 border-pink-500 rounded-b-xl overflow-hidden relative shadow-[0_0_50px_rgba(236,72,153,0.2)]">
            {isHealing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="text-pink-500 mb-4 animate-pulse" size={48} />
                <h4 className="text-2xl font-bold text-white mb-2 underline decoration-pink-500">Self-Healing in Progress</h4>
                <p className="text-pink-300 text-lg italic animate-pulse">"{healingMessage}"</p>
              </div>
            )}

            {/* Robust Local Iframe Preview */}
            <iframe
              className="w-full h-full border-none bg-[#0a0a0f]"
              title="Magic Preview"
              sandbox="allow-scripts allow-modals"
              srcDoc={`
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <meta charset="UTF-8">
                            <style>
                              body, html { margin: 0; padding: 0; background: #0a0a0f; color: #fff; width: 100%; height: 100%; overflow: hidden; }
                              #app { width: 100%; height: 100%; position: relative; }
                              canvas { display: block; }
                            </style>
                          </head>
                          <body>
                            <div id="app"></div>
                            <script>
                              // --- SNAP & BUILD RUNTIME ---
                              window.entities = {};
                              window.createSprite = (name, x, y) => {
                                  if (!window.entities[name]) {
                                      window.entities[name] = { x, y, angle: 0, color: '#00f0ff' };
                                  }
                              };
                              window.moveForward = (amount) => {
                                  Object.values(window.entities).forEach(e => {
                                      e.x += Math.cos(e.angle) * (amount || 1);
                                      e.y += Math.sin(e.angle) * (amount || 1);
                                  });
                              };
                              window.turnRight = (deg) => {
                                  const rad = (deg * Math.PI) / 180;
                                  Object.values(window.entities).forEach(e => e.angle += rad);
                              };

                              // Canvas Setup
                              const app = document.getElementById('app');
                              const canvas = document.createElement('canvas');
                              canvas.width = window.innerWidth;
                              canvas.height = window.innerHeight;
                              app.appendChild(canvas);
                              const ctx = canvas.getContext('2d');

                              function draw() {
                                  // Call Always loop if it exists
                                  if (typeof window.onFrame === "function") {
                                      try { window.onFrame(); } catch(e) { console.error(e); }
                                  }

                                  const extraCanvas = document.querySelectorAll('canvas').length > 1;
                                  if (extraCanvas) {
                                      canvas.style.display = 'none';
                                  } else {
                                      canvas.style.display = 'block';
                                      ctx.fillStyle = '#0a0a0f';
                                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                                      
                                      Object.entries(window.entities).forEach(([name, e]) => {
                                          ctx.save();
                                          ctx.translate(e.x, e.y);
                                          ctx.rotate(e.angle);
                                          ctx.shadowBlur = 15;
                                          ctx.shadowColor = e.color || '#00f0ff';
                                          ctx.fillStyle = e.color || '#00f0ff';
                                          ctx.beginPath();
                                          ctx.moveTo(25, 0); ctx.lineTo(-15, 20); ctx.lineTo(-15, -20); ctx.closePath();
                                          ctx.fill();
                                          ctx.fillStyle = '#fff';
                                          ctx.font = 'bold 12px monospace';
                                          ctx.textAlign = 'center';
                                          ctx.fillText(name, 0, 40);
                                          ctx.restore();
                                      });
                                  }
                                  requestAnimationFrame(draw);
                              }
                              draw();
                              window.addEventListener('resize', () => {
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
