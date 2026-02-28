"use client";

import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator, Order } from 'blockly/javascript';
import DarkTheme from '@blockly/theme-dark';

Blockly.setLocale(En as any);

// Define the Magic Block structure
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

// Event: When Clicked
Blockly.Blocks['when_clicked'] = {
    init: function () {
        this.jsonInit({
            "message0": "When Clicked",
            "nextStatement": null,
            "colour": "#FFBF00"
        });
    }
};

// Define code generation for the Magic Block
javascriptGenerator.forBlock['magic_block'] = function (block: any) {
    const prompt = block.getFieldValue('PROMPT');
    // At this phase, we just emit a comment/log.
    // The server-side / execution code will eventually use this prompt.
    const code = `\n/* ✨ AI Request: "${prompt}" */\nconsole.log('✨ Magic Triggered for: "${prompt}"');\n`;
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

javascriptGenerator.forBlock['when_clicked'] = function (block: any) {
    const branch = javascriptGenerator.statementToCode(block, 'STACK');
    return `document.getElementById('app').onclick = function() {\n${branch}};\n`;
};

// Override default print block to use console.log instead of window.alert
javascriptGenerator.forBlock['text_print'] = function (block: any) {
    const msg = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    return 'console.log(' + msg + ');\n';
};

export default function BlocklyWorkspace({ onCodeChange }: { onCodeChange: (code: string) => void }) {
    const blocklyDiv = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

    // Store the latest callback in a ref to avoid recreating the effect
    const onCodeChangeRef = useRef(onCodeChange);
    useEffect(() => {
        onCodeChangeRef.current = onCodeChange;
    }, [onCodeChange]);

    useEffect(() => {
        if (!blocklyDiv.current) return;
        if (workspaceRef.current) return;

        workspaceRef.current = Blockly.inject(blocklyDiv.current, {
            toolbox: `
        <xml xmlns="https://developers.google.com/blockly/xml">
          <category name="✨ AI Magic" colour="290">
            <block type="magic_block"></block>
          </category>
          <category name="Movement" colour="#4C97FF">
            <block type="move_forward"></block>
            <block type="turn_right"></block>
          </category>
          <category name="Events" colour="#FFBF00">
            <block type="when_clicked"></block>
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
            theme: DarkTheme,
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

    return <div ref={blocklyDiv} className="absolute inset-0 w-full h-full" />;
}
