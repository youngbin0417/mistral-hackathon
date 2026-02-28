"use client";

import React, { useState } from 'react';
import { Sandpack } from "@codesandbox/sandpack-react";
import dynamic from 'next/dynamic';

const BlocklyWorkspace = dynamic(() => import('@/components/BlocklyWorkspace'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 flex items-center justify-center text-gray-500">Loading Blockly...</div>
});

export default function Home() {
  const [code, setCode] = useState(`// Start dragging blocks!`);

  return (
    <div className="flex flex-col h-screen min-h-screen p-4 bg-gray-950 text-white font-sans">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
          Mistral Snap & Build
        </h1>
        <div className="text-sm text-gray-400 border border-gray-800 px-3 py-1 rounded-full">Phase 1 MVP</div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Blockly Area */}
        <div className="flex-[1.5] bg-gray-900 border border-gray-800 rounded-lg p-2 flex flex-col relative">
          <h2 className="text-lg font-semibold text-cyan-400 ml-2 mb-2">Blockly Workspace</h2>
          <div className="flex-1 bg-gray-950 rounded relative overflow-hidden">
            <BlocklyWorkspace onCodeChange={(newCode) => setCode(newCode)} />
          </div>
        </div>

        {/* Sandpack Area */}
        <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-lg overflow-hidden relative">
          <div className="p-2 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-pink-500 ml-2">Live Preview</h2>
          </div>
          <div className="flex-1 overflow-hidden pointer-events-auto">
            <Sandpack
              template="vanilla"
              theme="dark"
              files={{
                "/index.js": code,
              }}
              options={{
                showNavigator: false,
                showTabs: true,
                editorHeight: "100%",
                editorWidthPercentage: 40,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
