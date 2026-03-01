/**
 * codeTransform.ts
 *
 * Utility functions for transforming Blockly-generated code.
 * These are extracted from page.tsx so they can be properly unit-tested.
 */

export interface AiCacheEntry {
    code: string;
    libs: string[];
}

/**
 * The regex pattern that matches an AI Magic Block marker in generated JS code.
 *
 * Blockly generator produces:
 *   \n/* ✨ AI Request: "PROMPT" *\/\n{ console.log('AI_MAGIC_TRIGGER: ESCAPED_PROMPT'); }\n
 *
 * Note: Blockly may add indentation (spaces or tabs) when generating code inside other blocks.
 * This regex accounts for that by allowing optional whitespace before the comment and the console.log line.
 */
export const AI_MARKER_REGEX =
    /\n?[ \t]*\/\* ✨ AI Request: "([\s\S]+?)" \*\/\n?(?:[ \t]*\{ console\.log\('AI_MAGIC_[A-Z_]+: [\s\S]+?'\); \}\n?|[ \t]*\([\s\S]+?\))/g;

/**
 * Extract all AI Magic Block prompts from raw Blockly-generated code.
 * Returns an array of { prompt, fullMatch } objects.
 */
export function extractAiMarkers(rawCode: string): Array<{ prompt: string; fullMatch: string }> {
    const results: Array<{ prompt: string; fullMatch: string }> = [];
    const regex = new RegExp(AI_MARKER_REGEX.source, 'g');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(rawCode)) !== null) {
        results.push({ prompt: match[1], fullMatch: match[0] });
    }
    return results;
}

/**
 * Apply cached AI replacements to raw code.
 *
 * For each AI marker found in rawCode:
 *   - If the prompt exists in cache → replace the marker with cached code
 *   - If not → leave the marker in place and mark as "needs generation"
 *
 * Returns:
 *   - processedCode: code with all cached markers replaced
 *   - uncachedPrompts: prompts that still need AI generation
 */
export function applyCachedReplacements(
    rawCode: string,
    aiCache: Record<string, AiCacheEntry>
): { processedCode: string; uncachedPrompts: string[] } {
    let processedCode = rawCode;
    const uncachedPrompts: string[] = [];

    const markers = extractAiMarkers(rawCode);

    for (const { prompt, fullMatch } of markers) {
        if (aiCache[prompt]) {
            // Replace the full marker (including leading \n if present) with cached code
            processedCode = processedCode.replace(fullMatch, '\n' + aiCache[prompt].code + '\n');
        } else {
            uncachedPrompts.push(prompt);
        }
    }

    return { processedCode, uncachedPrompts };
}

/**
 * Prepend ESM import statements for detected libraries.
 * Only adds imports that aren't already present in the source.
 */
export function prependImports(sourceCode: string, libs: string[]): string {
    let imports = '';
    const libsToImport = new Set(libs);

    if (libsToImport.has('p5') && !sourceCode.includes("esm.sh/p5@")) {
        imports += `import p5 from 'https://esm.sh/p5@1.9.0';\n`;
    }
    if (libsToImport.has('p5.sound') && !sourceCode.includes("p5.sound")) {
        imports += `import 'https://esm.sh/p5@1.9.0/lib/addons/p5.sound.js';\n`;
    }
    if (libsToImport.has('matter-js') && !sourceCode.includes("esm.sh/matter-js")) {
        imports += `import Matter from 'https://esm.sh/matter-js@0.19.0';\n`;
    }
    if (libsToImport.has('gsap') && !sourceCode.includes("esm.sh/gsap")) {
        imports += `import { gsap } from 'https://esm.sh/gsap@3.12.5';\n`;
    }
    if (libsToImport.has('three') && !sourceCode.includes("esm.sh/three")) {
        imports += `import * as THREE from 'https://esm.sh/three@0.161.0';\n`;
    }
    if (libsToImport.has('paper') && !sourceCode.includes("esm.sh/paper")) {
        imports += `import paper from 'https://esm.sh/paper@0.12.17';\n`;
    }

    return imports + sourceCode;
}

/**
 * Clean up markdown code fences that the LLM might accidentally include.
 * e.g. ```js\n...\n``` → ...
 */
export function stripMarkdownFences(code: string): string {
    return code
        .replace(/^```[a-z]*\n?/i, '')
        .replace(/\n?```$/i, '')
        .trim();
}
