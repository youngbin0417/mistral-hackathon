"use client";

import React, { useState } from 'react';
import { SandpackProvider, SandpackLayout, SandpackPreview } from "@codesandbox/sandpack-react";
import { Code, X } from "lucide-react";
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
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);

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

        {/* Sandpack Area - Preview Only */}
        <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-lg overflow-hidden relative">
          <div className="p-2 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-pink-500 ml-2">Live Preview</h2>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-md transition-colors text-sm font-medium border border-gray-700"
            >
              <Code size={16} />
              View Code
            </button>
          </div>
          <div className="flex-1 overflow-hidden pointer-events-auto bg-black rounded-b-lg">
            <SandpackProvider
              template="vanilla"
              theme="dark"
              files={{
                "/index.js": code,
                "/index.html": `<!DOCTYPE html><html><head><style>body { margin: 0; padding: 0; background: #000; color: #fff; }</style></head><body><main id="app"></main><script src="index.js"></script></body></html>`
              }}
              customSetup={{
                dependencies: {
                  "p5": "^1.9.0",
                  "matter-js": "^0.19.0"
                }
              }}
            >
              <SandpackLayout style={{ height: "100%", borderRadius: 0, border: 'none' }}>
                <SandpackPreview
                  showNavigator={false}
                  showOpenInCodeSandbox={false}
                  showRefreshButton={true}
                  style={{ height: "100%", flex: 1 }}
                />
              </SandpackLayout>
            </SandpackProvider>
          </div>
        </div>
      </div>

      {/* Code Modal */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-pink-500 rounded-xl w-full max-w-3xl flex flex-col shadow-[0_0_30px_rgba(236,72,153,0.3)]">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                <Code size={20} />
                Generated JavaScript
              </h3>
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] h-[60vh] overflow-y-auto">
              <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap p-4 bg-black bg-opacity-50 border border-gray-700 rounded-lg shadow-inner">
                <code>{code}</code>
              </pre>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setIsCodeModalOpen(false)}
                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-bold rounded hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
