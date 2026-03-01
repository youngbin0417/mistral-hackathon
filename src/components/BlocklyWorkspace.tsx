"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator, Order } from 'blockly/javascript';
import DarkTheme from '@blockly/theme-dark';
import { initializeCustomBlocks } from '@/lib/customBlocks';
import { Sparkles, Palette, Globe, Volume2, Gamepad2, Brain, Calculator, Mic } from 'lucide-react';

Blockly.setLocale(En as any);

const CyberpunkTheme = Blockly.Theme.defineTheme('cyberpunk', {
  name: 'cyberpunk',
  base: DarkTheme,
  blockStyles: {
    'logic_blocks': { colourPrimary: '#5b80a5', colourSecondary: '#496d8c', colourTertiary: '#3a5771' },
    'loop_blocks': { colourPrimary: '#FFBF00', colourSecondary: '#cc9900', colourTertiary: '#997300' },
    'math_blocks': { colourPrimary: '#a55b80', colourSecondary: '#8c4968', colourTertiary: '#733a54' },
    'text_blocks': { colourPrimary: '#a55b80', colourSecondary: '#8c4968', colourTertiary: '#733a54' },
    'list_blocks': { colourPrimary: '#00e5ff', colourSecondary: '#00b8cc', colourTertiary: '#008c99' },
    'colour_blocks': { colourPrimary: '#ff0066', colourSecondary: '#cc0052', colourTertiary: '#99003d' },
    'variable_blocks': { colourPrimary: '#00ff88', colourSecondary: '#00cc6d', colourTertiary: '#009952' },
    'procedure_blocks': { colourPrimary: '#ff8800', colourSecondary: '#cc6d00', colourTertiary: '#995200' },
  },
  categoryStyles: {},
  componentStyles: {
    workspaceBackgroundColour: '#0d0d14',
    toolboxBackgroundColour: '#0d0d14',
    toolboxForegroundColour: '#b0b8cc',
    flyoutBackgroundColour: '#12121e',
    flyoutForegroundColour: '#00e5ff',
    flyoutOpacity: 0.97,
    insertionMarkerColour: '#00e5ff',
    insertionMarkerOpacity: 0.4,
    scrollbarColour: '#1e1e30',
    scrollbarOpacity: 0.3,
    cursorColour: '#ff00c8',
  },
  fontStyle: {
    family: 'Fredoka, sans-serif',
    weight: '500',
    size: 11,
  },
});

// Category definitions for our custom palette bar
const CATEGORIES = [
  { id: 'ai_magic', label: 'AI Magic', icon: Sparkles, color: '#ff00c8', borderColor: 'border-[#ff00c8]/30', bgColor: 'bg-[#ff00c8]/10', textColor: 'text-[#ff00c8]' },
  { id: 'voice', label: 'Voice', icon: Mic, color: '#ff0066', borderColor: 'border-[#ff0066]/30', bgColor: 'bg-[#ff0066]/10', textColor: 'text-[#ff0066]' },
  { id: 'visuals', label: 'Visuals', icon: Palette, color: '#ff0066', borderColor: 'border-[#ff0066]/30', bgColor: 'bg-[#ff0066]/10', textColor: 'text-[#ff0066]' },
  { id: 'world', label: 'World', icon: Globe, color: '#9000ff', borderColor: 'border-[#9000ff]/30', bgColor: 'bg-[#9000ff]/10', textColor: 'text-[#9000ff]' },
  { id: 'audio', label: 'Audio', icon: Volume2, color: '#FFBF00', borderColor: 'border-[#FFBF00]/30', bgColor: 'bg-[#FFBF00]/10', textColor: 'text-[#FFBF00]' },
  { id: 'game', label: 'Game', icon: Gamepad2, color: '#00e5ff', borderColor: 'border-[#00e5ff]/30', bgColor: 'bg-[#00e5ff]/10', textColor: 'text-[#00e5ff]' },
  { id: 'logic', label: 'Logic', icon: Brain, color: '#5b80a5', borderColor: 'border-[#5b80a5]/30', bgColor: 'bg-[#5b80a5]/10', textColor: 'text-[#5b80a5]' },
  { id: 'math', label: 'Math', icon: Calculator, color: '#a55b80', borderColor: 'border-[#a55b80]/30', bgColor: 'bg-[#a55b80]/10', textColor: 'text-[#a55b80]' },
];

const TOOLBOX_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="AI Magic" colour="#ff00c8">
    <block type="magic_block"></block>
    <block type="magic_condition"></block>
    <block type="magic_styles"></block>
  </category>
  <category name="Voice" colour="#ff0066">
    <block type="speak_block"></block>
    <block type="voice_style_block"></block>
    <block type="react_voice_block"></block>
  </category>
  <category name="Visuals" colour="#ff0066">
    <block type="draw_shape"></block>
    <block type="explode_particles"></block>
  </category>
  <category name="World" colour="#9000ff">
    <block type="create_sprite"></block>
    <block type="move_forward"></block>
    <block type="turn_right"></block>
    <block type="set_gravity"></block>
    <block type="apply_force"></block>
  </category>
  <category name="Audio" colour="#FFBF00">
    <block type="play_frequency"></block>
  </category>
  <category name="Game" colour="#00e5ff">
    <block type="add_score"></block>
    <block type="timer_every"></block>
    <block type="when_clicked"></block>
    <block type="always_loop"></block>
  </category>
  <category name="Logic" colour="#5b80a5">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
  </category>
  <category name="Math" colour="#a55b80">
    <block type="math_number"></block>
    <block type="text_print"></block>
    <block type="text"></block>
  </category>
</xml>`;

export default function BlocklyWorkspace({ onCodeChange, isGenerating = false }: { onCodeChange: (code: string) => void, isGenerating?: boolean }) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const onCodeChangeRef = useRef(onCodeChange);
  useEffect(() => {
    onCodeChangeRef.current = onCodeChange;
  }, [onCodeChange]);

  const handleCategoryClick = (categoryId: string, index: number) => {
    if (!workspaceRef.current) return;
    const toolbox = workspaceRef.current.getToolbox();
    if (!toolbox) return;

    if (activeCategory === categoryId) {
      // Toggle off: close flyout
      workspaceRef.current.getFlyout()?.hide();
      setActiveCategory(null);
    } else {
      // Select the category by index to open its flyout
      toolbox.selectItemByPosition(index);
      setActiveCategory(categoryId);
    }
  };

  useEffect(() => {
    initializeCustomBlocks();

    if (!blocklyDiv.current) return;
    if (workspaceRef.current) return;

    workspaceRef.current = Blockly.inject(blocklyDiv.current, {
      toolbox: TOOLBOX_XML,
      theme: CyberpunkTheme,
      renderer: 'zelos',
      grid: {
        spacing: 30,
        length: 2,
        colour: '#1a1a2e',
        snap: true,
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.9,
        maxScale: 2,
        minScale: 0.4,
        scaleSpeed: 1.1,
        pinch: true,
      },
      trashcan: true,
      move: {
        scrollbars: { horizontal: true, vertical: true },
        drag: true,
        wheel: true,
      },
    });

    const handleResize = () => {
      Blockly.svgResize(workspaceRef.current!);
    };
    window.addEventListener('resize', handleResize);

    // Watch for panel resizes
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (blocklyDiv.current) {
      resizeObserver.observe(blocklyDiv.current);
    }

    // CSS alone is not enough because Blockly calculates SVG positioning based on the toolbox.
    // We MUST force the toolbox width to 0 via JS and trigger a resize so the workspace takes up the full width.
    let isHiding = false;
    const hideToolbox = () => {
      if (isHiding) return;
      isHiding = true;

      const toolbox = workspaceRef.current?.getToolbox();
      if (toolbox) {
        const htmlElement = (toolbox as any).HtmlDiv || (toolbox as any).htmlDiv_;
        if (htmlElement) {
          htmlElement.style.display = 'none';
          htmlElement.style.width = '0px';
        }
      }

      document.querySelectorAll('.blocklyToolboxDiv').forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.setProperty('display', 'none', 'important');
        htmlEl.style.setProperty('width', '0px', 'important');
      });

      handleResize();
      isHiding = false;
    };

    requestAnimationFrame(hideToolbox);
    setTimeout(hideToolbox, 100);
    setTimeout(hideToolbox, 300);

    const observer = new MutationObserver(() => {
      requestAnimationFrame(hideToolbox);
    });
    observer.observe(document.body, { childList: true, subtree: false });

    const onWorkspaceChange = (event: any) => {
      if (event.type === Blockly.Events.UI) return;
      if (!workspaceRef.current) return;
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      onCodeChangeRef.current(code);
    };

    workspaceRef.current.addChangeListener(onWorkspaceChange);
    const initialCode = javascriptGenerator.workspaceToCode(workspaceRef.current);
    onCodeChangeRef.current(initialCode);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      observer.disconnect();
      workspaceRef.current?.dispose();
      workspaceRef.current = null;
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Custom Top Palette Bar */}
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2 flex-wrap">
        {CATEGORIES.map((cat, index) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id, index)}
              className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer
                                border transition-all duration-200 active:scale-95
                                ${isActive
                  ? `${cat.bgColor} ${cat.borderColor} ${cat.textColor} shadow-[0_0_12px_rgba(0,0,0,0.3)]`
                  : `bg-transparent border-[var(--border)] text-gray-400 hover:text-gray-200 hover:border-gray-600`
                }
                            `}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Blockly Container (toolbox hidden via CSS) */}
      <div className={`flex-1 relative overflow-hidden ${isGenerating ? 'blockly-generating' : ''}`}>
        <div ref={blocklyDiv} className="absolute inset-0 w-full h-full blockly-workspace-container" />

        {/* AI Scanning Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--neon-pink)] to-transparent animate-scanline"></div>
            <div className="absolute inset-0 bg-[var(--neon-pink)]/5 backdrop-blur-[1px]"></div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-[var(--neon-pink)] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[var(--neon-pink)] font-mono text-sm tracking-tighter bg-black/60 px-4 py-1.5 rounded-xl">SCANNING LOGIC...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
