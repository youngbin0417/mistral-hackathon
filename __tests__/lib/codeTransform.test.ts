import { extractAiMarkers, prependImports, stripMarkdownFences } from '@/lib/codeTransform';

describe('Code Transform Utilities', () => {
    describe('extractAiMarkers', () => {
        it('extracts statement-style AI markers', () => {
            const code = `
                console.log('start');
                /* ✨ AI Request: "make it rain" */
                { console.log('AI_MAGIC_TRIGGER: make it rain'); }
                console.log('end');
            `;
            const markers = extractAiMarkers(code);
            expect(markers).toHaveLength(1);
            expect(markers[0].prompt).toBe('make it rain');
        });

        it('extracts expression-style AI markers (conditions)', () => {
            const code = `
                if (/* ✨ AI Request: "player is near" */ (true)) {
                    console.log('hit');
                }
            `;
            const markers = extractAiMarkers(code);
            expect(markers).toHaveLength(1);
            expect(markers[0].prompt).toBe('player is near');
        });

        it('extracts multiple markers of different types', () => {
            const code = `
                /* ✨ AI Request: "rainbow background" */
                { console.log('AI_MAGIC_STYLE: rainbow background'); }
                
                if (/* ✨ AI Request: "score is high" */ (true)) {
                    /* ✨ AI Request: "explode" */
                    { console.log('AI_MAGIC_TRIGGER: explode'); }
                }
            `;
            const markers = extractAiMarkers(code);
            expect(markers).toHaveLength(3);
            expect(markers[0].prompt).toBe('rainbow background');
            expect(markers[1].prompt).toBe('score is high');
            expect(markers[2].prompt).toBe('explode');
        });

        it('handles escaped quotes in prompts correctly', () => {
            const code = `
                /* ✨ AI Request: "say \\"hello\\"" */
                { console.log('AI_MAGIC_TRIGGER: say \\"hello\\"'); }
            `;
            const markers = extractAiMarkers(code);
            expect(markers).toHaveLength(1);
            expect(markers[0].prompt).toBe('say \\"hello\\"');
        });
    });

    describe('prependImports', () => {
        it('adds p5 and p5.sound imports', () => {
            const libs = ['p5', 'p5.sound'];
            const result = prependImports('console.log(1)', libs);
            expect(result).toContain("import p5 from 'https://esm.sh/p5@1.9.0'");
            expect(result).toContain("import 'https://esm.sh/p5@1.9.0/lib/addons/p5.sound.js'");
        });

        it('adds gsap, three, and paper imports', () => {
            const libs = ['gsap', 'three', 'paper'];
            const result = prependImports('console.log(1)', libs);
            expect(result).toContain("import { gsap } from 'https://esm.sh/gsap@3.12.5'");
            expect(result).toContain("import * as THREE from 'https://esm.sh/three@0.161.0'");
            expect(result).toContain("import paper from 'https://esm.sh/paper@0.12.17'");
        });

        it('does not duplicate existing imports', () => {
            const libs = ['p5'];
            const existing = "import p5 from 'https://esm.sh/p5@1.9.0';\nconsole.log(p5)";
            const result = prependImports(existing, libs);
            expect(result.match(/import p5/g)).toHaveLength(1);
        });
    });

    describe('stripMarkdownFences', () => {
        it('removes js code fences', () => {
            const fenced = "```js\nconst x = 1;\n```";
            expect(stripMarkdownFences(fenced)).toBe("const x = 1;");
        });

        it('handles fences without language tag', () => {
            const fenced = "```\nconst x = 1;\n```";
            expect(stripMarkdownFences(fenced)).toBe("const x = 1;");
        });
    });
});
