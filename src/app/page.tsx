"use client";

import React, { useState } from 'react';
import { SandpackProvider, SandpackLayout, SandpackPreview, SandpackCodeEditor } from "@codesandbox/sandpack-react";
import { Play, Code, X } from "lucide-react";
import dynamic from 'next/dynamic';

const BlocklyWorkspace = dynamic(() => import('@/components/BlocklyWorkspace'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading Blockly...</div>
});

// Prepend import statements dynamically based on AI detection
const prependImports = (sourceCode: string, libs: string[]) => {
  let imports = '';
  if (libs.includes('p5')) {
    imports += `import p5 from 'p5';\n`;
  }
  if (libs.includes('matter-js')) {
    imports += `import Matter from 'matter-js';\n`;
  }
  return imports + sourceCode;
};

export default function Home() {
  const [code, setCode] = useState(`// Start dragging blocks!`);
  const [injectedLibs, setInjectedLibs] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleCodeChange = async (newCode: string) => {
    // Check if the generated code contains an AI request
    const aiMarkerMatch = newCode.match(/\/\* ✨ AI Request: "([^"]+)" \*\//);

    if (aiMarkerMatch) {
      const prompt = aiMarkerMatch[1];
      setIsGenerating(true);

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });

        const data = await response.json();
        if (data.code) {
          if (data.injectedLibraries) {
            setInjectedLibs(data.injectedLibraries);
          }
          // Replace the template marker with the actual generated AI code
          let mergedCode = newCode.replace(
            /\/\* ✨ AI Request: "[^"]+" \*\/\nconsole\.log\('✨ Magic Triggered for: "[^"]+"'\);\n/,
            '\n' + data.code + '\n'
          );

          if (data.injectedLibraries && data.injectedLibraries.length > 0) {
            mergedCode = prependImports(mergedCode, data.injectedLibraries);
          }

          setCode(mergedCode);
        }
      } catch (err) {
        console.error("AI Generation failed:", err);
      } finally {
        setIsGenerating(false);
      }
    } else {
      setCode(newCode); // Standard blocks update normally
    }
  };

  return (
    <div className="flex flex-col h-screen min-h-screen p-4 bg-gray-950 text-white font-sans">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Mistral Snap & Build
        </h1>
        <div className="flex items-center gap-3">
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
            <span className="text-sm font-semibold text-pink-400 animate-pulse flex items-center gap-2">
              <span className="block w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
              Codestral is brewing magic...
            </span>
          )}
          <div className="text-sm text-gray-400 border border-gray-800 px-3 py-1 rounded-full">Phase 3 AI Libraries</div>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Blockly Area */}
        <div className="flex-[1.5] bg-gray-900 border border-gray-800 rounded-lg p-2 flex flex-col relative">
          <h2 className="text-lg font-semibold text-cyan-400 ml-2 mb-2">Blockly Workspace</h2>
          <div className={`flex-1 bg-gray-950 rounded relative overflow-hidden transition-all duration-500 ${isGenerating ? 'ring-2 ring-pink-500 ring-opacity-50' : ''}`}>
            <BlocklyWorkspace onCodeChange={handleCodeChange} />
          </div>
        </div>

        {/* Code Area */}
        <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-lg overflow-hidden relative">
          <div className="p-2 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-cyan-400 ml-2">Generated Code</h2>
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-md transition-colors text-sm font-bold border border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
            >
              <Play size={16} fill="currentColor" />
              Run Magic
            </button>
          </div>
          <div className="flex-1 w-full h-full relative pointer-events-auto bg-black rounded-b-lg overflow-hidden flex flex-col">
            <SandpackProvider
              template="vanilla"
              theme="dark"
              files={{
                "/index.js": code,
                "/index.html": `<!DOCTYPE html><html><head><style>body, html { margin: 0; padding: 0; background: transparent; color: #fff; width: 100%; height: 100%; overflow: hidden; } #app { width: 100%; height: 100%; overflow: hidden; display: flex; align-items: center; justify-content: center; } canvas { display: block; max-width: 100%; max-height: 100%; }</style></head><body><main id="app"></main><script src="index.js"></script></body></html>`
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
                    <SandpackPreview
                      showNavigator={false}
                      showOpenInCodeSandbox={false}
                      showRefreshButton={true}
                      style={{ width: "100%", height: "100%", minHeight: "100%", border: 'none' }}
                    />
                  </div>
                </div>
              )}
            </SandpackProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
