"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';
import DarkTheme from '@blockly/theme-dark';
import { initializeCustomBlocks } from '@/lib/customBlocks';
import { Sparkles, Palette, Globe, Volume2, Gamepad2, Brain, Calculator, Mic } from 'lucide-react';

Blockly.setLocale(En as unknown as Record<string, string>);

const CyberpunkTheme = Blockly.Theme.defineTheme('cyberpunk', {
  name: 'cyberpunk',
  base: DarkTheme,
  blockStyles: {
    'logic_blocks': { colourPrimary: '#1E88E5', colourSecondary: '#1976D2', colourTertiary: '#1565C0' },
    'loop_blocks': { colourPrimary: '#BF360C', colourSecondary: '#A2300B', colourTertiary: '#8E2809' },
    'math_blocks': { colourPrimary: '#4527A0', colourSecondary: '#311B92', colourTertiary: '#1A237E' },
    'text_blocks': { colourPrimary: '#2E7D32', colourSecondary: '#286B2C', colourTertiary: '#215A25' },
    'list_blocks': { colourPrimary: '#00838F', colourSecondary: '#006064', colourTertiary: '#004D40' },
    'colour_blocks': { colourPrimary: '#C2185B', colourSecondary: '#AD1457', colourTertiary: '#880E4F' },
    'variable_blocks': { colourPrimary: '#F57C00', colourSecondary: '#E65100', colourTertiary: '#BF360C' },
    'procedure_blocks': { colourPrimary: '#D81B60', colourSecondary: '#C2185B', colourTertiary: '#AD1457' },
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

const CATEGORIES = [
  { id: 'ai_magic', label: 'AI Magic', icon: Sparkles, color: '#5E35B1', borderColor: 'border-[#5E35B1]/30', bgColor: 'bg-[#5E35B1]/10', textColor: 'text-[#5E35B1]' },
  { id: 'voice', label: 'Voice', icon: Mic, color: '#C2185B', borderColor: 'border-[#C2185B]/30', bgColor: 'bg-[#C2185B]/10', textColor: 'text-[#C2185B]' },
  { id: 'visuals', label: 'Visuals', icon: Palette, color: '#D81B60', borderColor: 'border-[#D81B60]/30', bgColor: 'bg-[#D81B60]/10', textColor: 'text-[#D81B60]' },
  { id: 'world', label: 'World', icon: Globe, color: '#6A1B9A', borderColor: 'border-[#6A1B9A]/30', bgColor: 'bg-[#6A1B9A]/10', textColor: 'text-[#6A1B9A]' },
  { id: 'audio', label: 'Audio', icon: Volume2, color: '#BF360C', borderColor: 'border-[#BF360C]/30', bgColor: 'bg-[#BF360C]/10', textColor: 'text-[#BF360C]' },
  { id: 'game', label: 'Game', icon: Gamepad2, color: '#00838F', borderColor: 'border-[#00838F]/30', bgColor: 'bg-[#00838F]/10', textColor: 'text-[#00838F]' },
  { id: 'logic', label: 'Logic', icon: Brain, color: '#1E88E5', borderColor: 'border-[#1E88E5]/30', bgColor: 'bg-[#1E88E5]/10', textColor: 'text-[#1E88E5]' },
  { id: 'math', label: 'Math', icon: Calculator, color: '#4527A0', borderColor: 'border-[#4527A0]/30', bgColor: 'bg-[#4527A0]/10', textColor: 'text-[#4527A0]' },
];

const TOOLBOX_XML = `
<xml xmlns="https://developers.google.com/blockly/xml">
  <category name="AI Magic" colour="#5E35B1">
    <block type="magic_block"></block>
    <block type="remix_code_block"></block>
    <block type="add_feature_block"></block>
    <block type="magic_condition"></block>
    <block type="magic_styles"></block>
  </category>
  <category name="Voice" colour="#C2185B">
    <block type="speak_block"></block>
    <block type="dialogue_2_block"></block>
    <block type="voice_style_block"></block>
    <block type="react_voice_block"></block>
  </category>
  <category name="Visuals" colour="#D81B60">
    <block type="draw_shape"></block>
    <block type="explode_particles"></block>
  </category>
  <category name="World" colour="#6A1B9A">
    <block type="create_sprite"></block>
    <block type="move_forward"></block>
    <block type="turn_right"></block>
    <block type="set_gravity"></block>
    <block type="apply_force"></block>
  </category>
  <category name="Audio" colour="#BF360C">
    <block type="magic_bgm_block"></block>
    <block type="play_sfx_block"></block>
    <block type="play_frequency"></block>
  </category>
  <category name="Game" colour="#00838F">
    <block type="add_score"></block>
    <block type="timer_every"></block>
    <block type="when_clicked"></block>
    <block type="always_loop"></block>
  </category>
  <category name="Logic" colour="#1E88E5">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
  </category>
  <category name="Math" colour="#4527A0">
    <block type="math_number"></block>
    <block type="text_print"></block>
    <block type="text"></block>
  </category>
</xml>`;

interface BlocklyWorkspaceProps {
  onCodeChange: (code: string) => void;
  isGenerating?: boolean;
}

export default function BlocklyWorkspace({ onCodeChange, isGenerating = false }: BlocklyWorkspaceProps) {
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
      workspaceRef.current.getFlyout()?.hide();
      setActiveCategory(null);
    } else {
      toolbox.selectItemByPosition(index);
      setActiveCategory(categoryId);
    }
  };

  useEffect(() => {
    initializeCustomBlocks();

    if (!blocklyDiv.current || workspaceRef.current) return;

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

    // --- Definitive hammer to hide the redundant vertical categorical legend ---
    const hideToolbox = () => {
      const toolbox = document.querySelector('.blocklyToolbox') as HTMLElement | null;
      if (toolbox) {
        toolbox.style.display = 'none';
        toolbox.style.visibility = 'hidden';
        toolbox.style.width = '0';
      }
    };
    setTimeout(hideToolbox, 100);
    setTimeout(hideToolbox, 500); // Just in case it's lazy-loaded

    const handleResize = () => {
      if (workspaceRef.current) {
        Blockly.svgResize(workspaceRef.current);
      }
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (blocklyDiv.current) {
      resizeObserver.observe(blocklyDiv.current);
    }

    const onWorkspaceChange = (event: Blockly.Events.Abstract) => {
      if (event.type === Blockly.Events.UI) {
        const uiEvent = event as Blockly.Events.Abstract & { element?: string; oldValue?: unknown; newValue?: unknown };
        // Flyout closed → deactivate top button
        if (uiEvent.element === 'flyout' && uiEvent.oldValue === true && uiEvent.newValue === false) {
          setActiveCategory(null);
        }
        return;
      }
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
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
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

      <div className={`flex-1 relative overflow-hidden ${isGenerating ? 'blockly-generating' : ''}`}>
        <div ref={blocklyDiv} className="absolute inset-0 w-full h-full blockly-workspace-container" />

        {isGenerating && (
          <div className="absolute inset-0 z-[50] flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] pointer-events-none">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/80 border border-[var(--neon-pink)]/30 shadow-[0_0_20px_rgba(255,0,200,0.2)]">
              <Sparkles className="w-5 h-5 text-[var(--neon-pink)] animate-spin" />
              <span className="text-[var(--neon-pink)] font-bold tracking-widest text-sm uppercase">AI Magic in Progress...</span>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`

        /* ── Block borders: remove white emboss / bright stroke ── */
        /* Blockly applies an emboss SVG filter (white specular light) and
           auto-calculates a bright tertiary stroke for custom-color blocks.
           Override both so blocks have no harsh outline. */
        .blocklyDraggable > .blocklyPath,
        .blocklyBlock > .blocklyPath {
          stroke: none !important;
          filter: none !important;
        }

        /* ── Workspace borders: remove any white/light outlines ── */
        .blockly-workspace-container,
        .blocklySvg,
        .blocklyMainBackground,
        .blocklyInjectionDiv {
          border: none !important;
          stroke: none !important;
          outline: none !important;
        }

        /* --- Toolbox: FULLY HIDDEN (replaced by custom React palette bar) --- */
        .blocklyToolboxDiv,
        .blocklyToolbox,
        .blocklyToolboxContents,
        .blocklyTreeRoot,
        .blocklyTreeRow,
        .blocklyToolboxCategory,
        .blocklyToolboxCategoryContainer {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            pointer-events: none !important;
        }

        /* Prevent auto-added border for generating state if it's annoying */
        .blockly-generating::after {
          display: none !important;
        }

        /* Remove focus rings on workspace/canvas */
        .blocklyWorkspace:focus,
        .blocklyWorkspace:focus-visible,
        svg.blocklySvg:focus-visible {
          outline: none !important;
        }

        /* Ensure the input fields are perfectly visible and high contrast */
        .blocklyFieldRect,
        .blocklyBlock .blocklyPathDark,
        .blocklyBlock .blocklyPathLight {
           fill: #0a0a0f !important;
           stroke: none !important;
           fill-opacity: 1 !important;
        }
        /* Text inside editable input boxes - now brighter and clearer */
        .blocklyEditableText > text,
        .blocklyEditableText text,
        .blocklyFieldRect > text {
           fill: #ffffff !important;
           font-weight: 600 !important;
           font-size: 13px !important;
        }
        /* Non-editable label text inside blocks */
        .blocklyText {
           fill: #e0e4ef !important;
        }
      `}</style>
    </div>
  );
}
