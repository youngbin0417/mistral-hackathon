"use client";

import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator, Order } from 'blockly/javascript';
import DarkTheme from '@blockly/theme-dark';
import { initializeCustomBlocks } from '@/lib/customBlocks';

Blockly.setLocale(En as any);

// --- Custom Theme ---
const CyberpunkTheme = Blockly.Theme.defineTheme('cyberpunk', {
    name: 'cyberpunk',
    base: DarkTheme,
    blockStyles: {
        'logic_blocks': { colourPrimary: '#00f0ff' },
        'loop_blocks': { colourPrimary: '#ff00ff' },
        'math_blocks': { colourPrimary: '#7000ff' },
        'text_blocks': { colourPrimary: '#00ccff' },
        'list_blocks': { colourPrimary: '#ffcc00' },
        'colour_blocks': { colourPrimary: '#ff0066' },
        'variable_blocks': { colourPrimary: '#66ff00' },
        'procedure_blocks': { colourPrimary: '#ff6600' },
    },
    categoryStyles: {
        'logic_category': { colour: '#00f0ff' },
        'loop_category': { colour: '#ff00ff' },
        'math_category': { colour: '#7000ff' },
        'text_category': { colour: '#00ccff' },
    },
    componentStyles: {
        workspaceBackgroundColour: '#0a0a0f',
        toolboxBackgroundColour: '#0d0d14',
        toolboxForegroundColour: '#00f0ff',
        flyoutBackgroundColour: '#0d0d14',
        flyoutForegroundColour: '#00f0ff',
        insertionMarkerColour: '#fff',
        insertionMarkerOpacity: 0.3,
        scrollbarColour: '#1a1a2e',
        scrollbarOpacity: 0.4,
        cursorColour: '#ff00ff',
    },
});

// --- Custom Blocks ---
Blockly.Blocks['magic_block'] = {
    init: function () {
        this.jsonInit({
            "type": "magic_block",
            "message0": "✨ Do Magic: %1",
            "args0": [
                {
                    "type": "field_input",
                    "name": "PROMPT",
                    "text": "make it sparkle"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": 290,
            "tooltip": "Describe what you want in natural language",
            "helpUrl": ""
        });
    }
};

// Movement: Move Forward
Blockly.Blocks['move_forward'] = {
    init: function () {
        this.jsonInit({
            "message0": "Move Forward %1 units",
            "args0": [{ "type": "field_number", "name": "AMOUNT", "value": 10 }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#4C97FF"
        });
    }
};

// Movement: Turn
Blockly.Blocks['turn_right'] = {
    init: function () {
        this.jsonInit({
            "message0": "Turn Right %1 degrees",
            "args0": [{ "type": "field_number", "name": "DEGREES", "value": 90 }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#4C97FF"
        });
    }
};

// Physics: Set Gravity
Blockly.Blocks['set_gravity'] = {
    init: function () {
        this.jsonInit({
            "message0": "Set Gravity to %1",
            "args0": [{ "type": "field_number", "name": "VALUE", "value": 1 }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#7000ff"
        });
    }
};

// Character: Create Sprite
Blockly.Blocks['create_sprite'] = {
    init: function () {
        this.jsonInit({
            "message0": "Create %1 Sprite at X: %2 Y: %3",
            "args0": [
                { "type": "field_input", "name": "NAME", "text": "Hero" },
                { "type": "field_number", "name": "X", "value": 200 },
                { "type": "field_number", "name": "Y", "value": 200 }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#00f0ff"
        });
    }
};

// Event: When Clicked
Blockly.Blocks['when_clicked'] = {
    init: function () {
        this.jsonInit({
            "message0": "When Clicked %1",
            "args0": [{ "type": "input_statement", "name": "STACK" }],
            "colour": "#FFBF00",
            "tooltip": "Code inside will run once when screen is clicked"
        });
    }
};

// Event: Always (Every Frame)
Blockly.Blocks['always_loop'] = {
    init: function () {
        this.jsonInit({
            "message0": "Always (Every Frame) %1",
            "args0": [{ "type": "input_statement", "name": "STACK" }],
            "colour": "#FFBF00",
            "tooltip": "Code inside will run 60 times per second"
        });
    }
};

// Define code generation for the Magic Block
javascriptGenerator.forBlock['magic_block'] = function (block: any) {
    const prompt = block.getFieldValue('PROMPT');
    // Escape prompt for JS strings
    const escapedPrompt = prompt.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const code = `\n/* ✨ AI Request: "${prompt}" */\n{ console.log('AI_MAGIC_TRIGGER: ${escapedPrompt}'); }\n`;
    if (block.getSvgRoot()) {
        block.getSvgRoot().classList.add('magic-block-glow');
    }
    return code;
};

// Movement Generators
javascriptGenerator.forBlock['move_forward'] = function (block: any) {
    const amount = block.getFieldValue('AMOUNT');
    return `if(typeof moveForward === "function") moveForward(${amount});\n`;
};

javascriptGenerator.forBlock['turn_right'] = function (block: any) {
    const degrees = block.getFieldValue('DEGREES');
    return `if(typeof turnRight === "function") turnRight(${degrees});\n`;
};

javascriptGenerator.forBlock['set_gravity'] = function (block: any) {
    const value = block.getFieldValue('VALUE');
    return `if(typeof setGravity === "function") setGravity(${value});\n`;
};

javascriptGenerator.forBlock['create_sprite'] = function (block: any) {
    const name = block.getFieldValue('NAME');
    const x = block.getFieldValue('X');
    const y = block.getFieldValue('Y');
    return `if(typeof createSprite === "function") createSprite("${name}", ${x}, ${y});\n`;
};

javascriptGenerator.forBlock['when_clicked'] = function (block: any) {
    const branch = javascriptGenerator.statementToCode(block, 'STACK') || "";
    return `document.getElementById('app').onclick = function() {\n${branch}};\n`;
};

javascriptGenerator.forBlock['always_loop'] = function (block: any) {
    const branch = javascriptGenerator.statementToCode(block, 'STACK') || "";
    return `window.onFrame = function() {\n${branch}};\n`;
};

// Override default print block to use console.log instead of window.alert
javascriptGenerator.forBlock['text_print'] = function (block: any) {
    const msg = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    return 'console.log(' + msg + ');\n';
};

export default function BlocklyWorkspace({ onCodeChange, isGenerating = false }: { onCodeChange: (code: string) => void, isGenerating?: boolean }) {
    const blocklyDiv = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

    // Store the latest callback in a ref to avoid recreating the effect
    const onCodeChangeRef = useRef(onCodeChange);
    useEffect(() => {
        onCodeChangeRef.current = onCodeChange;
    }, [onCodeChange]);

    useEffect(() => {
        // Initialize all our custom extensions
        initializeCustomBlocks();

        if (!blocklyDiv.current) return;
        if (workspaceRef.current) return;

        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
            toolbox: `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <category name="✨ AI Magic" colour="#ff00ff">
            <block type="magic_block"></block>
            <block type="magic_condition"></block>
            <block type="magic_styles"></block>
          </category>
          <category name="🎨 Visuals & Art" colour="#ff0066">
            <block type="draw_shape"></block>
            <block type="explode_particles"></block>
          </category>
          <category name="🏗️ World & Physics" colour="#7000ff">
            <block type="create_sprite"></block>
            <block type="move_forward"></block>
            <block type="turn_right"></block>
            <block type="set_gravity"></block>
            <block type="apply_force"></block>
          </category>
          <category name="🔊 Audio & Sensors" colour="#FFBF00">
            <block type="play_frequency"></block>
          </category>
          <category name="🎮 Game Essentials" colour="#00ccff">
            <block type="add_score"></block>
            <block type="timer_every"></block>
            <block type="when_clicked"></block>
            <block type="always_loop"></block>
          </category>
          <category name="Logic" colour="#5b80a5">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
          </category>
          <category name="Math/Text" colour="#a55b80">
            <block type="math_number"></block>
            <block type="text_print"></block>
            <block type="text"></block>
          </category>
        </xml>
      `,
            theme: CyberpunkTheme,
        });

        const handleResize = () => {
            Blockly.svgResize(workspaceRef.current!);
        };
        window.addEventListener('resize', handleResize);

        // Workspace initially empty to allow user to start fresh
        /*
        Blockly.Xml.domToWorkspace(
            Blockly.utils.xml.textToDom(
                '<xml><block type="text_print" x="50" y="50"><value name="TEXT"><block type="text"><field name="TEXT">Hello, Mistral!</field></block></value><next><block type="magic_block"><field name="PROMPT">make it explode with sparkles</field></block></next></block></xml>'
            ),
            workspaceRef.current
        );
        */

        const onWorkspaceChange = (event: any) => {
            // Don't run code generation on every minor UI event to boost performance
            if (event.type === Blockly.Events.UI) return;

            if (!workspaceRef.current) return;
            const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
            onCodeChangeRef.current(code);
        };

        workspaceRef.current.addChangeListener(onWorkspaceChange);
        // target initial render
        const initialCode = javascriptGenerator.workspaceToCode(workspaceRef.current);
        onCodeChangeRef.current(initialCode);

        return () => {
            window.removeEventListener('resize', handleResize);
            workspaceRef.current?.dispose();
            workspaceRef.current = null;
        };
    }, []);

    return <div ref={blocklyDiv} className={`absolute inset-0 w-full h-full ${isGenerating ? 'blockly-generating' : ''}`} />;
}
