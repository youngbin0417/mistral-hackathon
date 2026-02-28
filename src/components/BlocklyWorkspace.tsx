"use client";

import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';
import { javascriptGenerator } from 'blockly/javascript';
import DarkTheme from '@blockly/theme-dark';

Blockly.setLocale(En);

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
          <category name="Logic" colour="#5b80a5">
            <block type="controls_if"></block>
            <block type="logic_compare"></block>
          </category>
          <category name="Actions" colour="#a55b80">
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

        // Add default block
        Blockly.Xml.domToWorkspace(
            Blockly.utils.xml.textToDom(
                '<xml><block type="text_print" x="50" y="50"><value name="TEXT"><block type="text"><field name="TEXT">Hello, Mistral!</field></block></value></block></xml>'
            ),
            workspaceRef.current
        );

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
