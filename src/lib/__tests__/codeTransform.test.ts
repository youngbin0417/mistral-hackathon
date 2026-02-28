import {
    extractAiMarkers,
    applyCachedReplacements,
    prependImports,
    stripMarkdownFences,
    AI_MARKER_REGEX,
} from '../codeTransform';

// ─────────────────────────────────────────────
// Helper: generate the exact marker string that
// BlocklyWorkspace.tsx produces for forBlock['magic_block']
// ─────────────────────────────────────────────
function makeMagicMarker(prompt: string): string {
    const escapedPrompt = prompt.replace(/'/g, "\\'").replace(/"/g, '\\"');
    return `\n/* ✨ AI Request: "${prompt}" */\n{ console.log('AI_MAGIC_TRIGGER: ${escapedPrompt}'); }\n`;
}

// ─────────────────────────────────────────────
// 1. AI_MARKER_REGEX
// ─────────────────────────────────────────────
describe('AI_MARKER_REGEX', () => {
    it('should be a global regex', () => {
        expect(AI_MARKER_REGEX.flags).toContain('g');
    });
});

// ─────────────────────────────────────────────
// 2. extractAiMarkers
// ─────────────────────────────────────────────
describe('extractAiMarkers', () => {
    it('returns empty array for code with no markers', () => {
        const code = `console.log("hello");\nwindow.createSprite("Hero", 200, 200);\n`;
        expect(extractAiMarkers(code)).toEqual([]);
    });

    it('detects a single magic marker', () => {
        const marker = makeMagicMarker('make it sparkle');
        const code = `window.createSprite("Hero", 200, 200);\n${marker}`;
        const results = extractAiMarkers(code);
        expect(results).toHaveLength(1);
        expect(results[0].prompt).toBe('make it sparkle');
        expect(results[0].fullMatch).toBe(marker);
    });

    it('detects multiple magic markers', () => {
        const marker1 = makeMagicMarker('make it sparkle');
        const marker2 = makeMagicMarker('bounce like a basketball');
        const code = `${marker1}${marker2}`;
        const results = extractAiMarkers(code);
        expect(results).toHaveLength(2);
        expect(results[0].prompt).toBe('make it sparkle');
        expect(results[1].prompt).toBe('bounce like a basketball');
    });

    it('handles prompts with special characters', () => {
        const prompt = 'draw a star at 50% opacity';
        const marker = makeMagicMarker(prompt);
        const results = extractAiMarkers(marker);
        expect(results).toHaveLength(1);
        expect(results[0].prompt).toBe(prompt);
    });

    it('handles prompts with Korean characters', () => {
        const prompt = '반짝이는 별을 만들어라';
        const marker = makeMagicMarker(prompt);
        const results = extractAiMarkers(marker);
        expect(results).toHaveLength(1);
        expect(results[0].prompt).toBe(prompt);
    });

    it('does NOT match partial/malformed markers', () => {
        const partial = `/* ✨ AI Request: "sparkle" */\n`; // missing console.log line
        expect(extractAiMarkers(partial)).toHaveLength(0);
    });
});

// ─────────────────────────────────────────────
// 3. applyCachedReplacements
// ─────────────────────────────────────────────
describe('applyCachedReplacements', () => {
    const cachedCode = `{ // 반짝이는 별 ✨\n  var star = document.createElement('div');\n  document.getElementById('app').appendChild(star);\n}`;
    const cache = {
        'make it sparkle': { code: cachedCode, libs: [] },
    };

    it('returns raw code unchanged when no markers present', () => {
        const code = `console.log("hi");\n`;
        const { processedCode, uncachedPrompts } = applyCachedReplacements(code, {});
        expect(processedCode).toBe(code);
        expect(uncachedPrompts).toHaveLength(0);
    });

    it('replaces a cached marker with its generated code', () => {
        const marker = makeMagicMarker('make it sparkle');
        const prefix = `window.createSprite("Hero", 200, 200);\n`;
        const rawCode = prefix + marker;

        const { processedCode, uncachedPrompts } = applyCachedReplacements(rawCode, cache);

        // The marker should be replaced
        expect(processedCode).not.toContain('AI_MAGIC_TRIGGER');
        expect(processedCode).not.toContain('AI Request');
        // The cached code should be present
        expect(processedCode).toContain(cachedCode);
        // No uncached prompts
        expect(uncachedPrompts).toHaveLength(0);
    });

    it('adds uncached prompt to uncachedPrompts list', () => {
        const marker = makeMagicMarker('bounce like a basketball');
        const { processedCode, uncachedPrompts } = applyCachedReplacements(marker, cache);

        // The marker must remain in the code (not replaced)
        expect(processedCode).toContain('AI_MAGIC_TRIGGER');
        expect(uncachedPrompts).toContain('bounce like a basketball');
    });

    it('handles mixed cached and uncached markers correctly', () => {
        const marker1 = makeMagicMarker('make it sparkle');   // cached
        const marker2 = makeMagicMarker('bounce like a basketball'); // not cached
        const rawCode = marker1 + marker2;

        const { processedCode, uncachedPrompts } = applyCachedReplacements(rawCode, cache);

        expect(processedCode).not.toContain('AI_MAGIC_TRIGGER: make it sparkle');
        expect(processedCode).toContain('AI_MAGIC_TRIGGER: bounce like a basketball');
        expect(uncachedPrompts).toEqual(['bounce like a basketball']);
    });

    it('replaces ALL occurrences of the same cached prompt', () => {
        // Same prompt used twice by the user
        const marker = makeMagicMarker('make it sparkle');
        const rawCode = marker + marker;

        const { processedCode, uncachedPrompts } = applyCachedReplacements(rawCode, cache);

        expect(processedCode).not.toContain('AI_MAGIC_TRIGGER');
        expect(processedCode.split(cachedCode).length - 1).toBe(2); // appears twice
        expect(uncachedPrompts).toHaveLength(0);
    });

    it('does not mutate the original cache object', () => {
        const snapshot = JSON.stringify(cache);
        const marker = makeMagicMarker('make it sparkle');
        applyCachedReplacements(marker, cache);
        expect(JSON.stringify(cache)).toBe(snapshot);
    });
});

// ─────────────────────────────────────────────
// 4. prependImports
// ─────────────────────────────────────────────
describe('prependImports', () => {
    const baseCode = `console.log("hi");\n`;

    it('returns unchanged code when libs array is empty', () => {
        expect(prependImports(baseCode, [])).toBe(baseCode);
    });

    it('prepends p5 import when p5 is in libs', () => {
        const result = prependImports(baseCode, ['p5']);
        expect(result).toMatch(/^import p5 from 'https:\/\/esm\.sh\/p5/);
        expect(result).toContain(baseCode);
    });

    it('prepends matter-js import when matter-js is in libs', () => {
        const result = prependImports(baseCode, ['matter-js']);
        expect(result).toMatch(/^import Matter from 'https:\/\/esm\.sh\/matter-js/);
    });

    it('prepends both imports when both libs are specified', () => {
        const result = prependImports(baseCode, ['p5', 'matter-js']);
        expect(result).toContain("import p5 from");
        expect(result).toContain("import Matter from");
    });

    it('does NOT add duplicate p5 import if already present', () => {
        const codeWithImport = `import p5 from 'https://esm.sh/p5@1.9.0';\n${baseCode}`;
        const result = prependImports(codeWithImport, ['p5']);
        const count = (result.match(/import p5/g) || []).length;
        expect(count).toBe(1);
    });

    it('does NOT add duplicate matter-js import if already present', () => {
        const codeWithImport = `import Matter from 'https://esm.sh/matter-js@0.19.0';\n${baseCode}`;
        const result = prependImports(codeWithImport, ['matter-js']);
        const count = (result.match(/import Matter/g) || []).length;
        expect(count).toBe(1);
    });
});

// ─────────────────────────────────────────────
// 5. stripMarkdownFences
// ─────────────────────────────────────────────
describe('stripMarkdownFences', () => {
    it('strips ```js fences', () => {
        const input = '```js\nconsole.log("hi");\n```';
        expect(stripMarkdownFences(input)).toBe('console.log("hi");');
    });

    it('strips ``` fences (no language)', () => {
        const input = '```\nconsole.log("hi");\n```';
        expect(stripMarkdownFences(input)).toBe('console.log("hi");');
    });

    it('strips ```javascript fences', () => {
        const input = '```javascript\nconst x = 1;\n```';
        expect(stripMarkdownFences(input)).toBe('const x = 1;');
    });

    it('returns plain code unchanged', () => {
        const input = 'const x = 1;';
        expect(stripMarkdownFences(input)).toBe('const x = 1;');
    });

    it('handles code with internal triple backtick-like strings gracefully', () => {
        // Should only strip outer fences, not internal content
        const inner = 'const s = "hello";';
        const input = '```js\n' + inner + '\n```';
        expect(stripMarkdownFences(input)).toBe(inner);
    });
});

// ─────────────────────────────────────────────
// 6. Integration: full pipeline simulation
// ─────────────────────────────────────────────
describe('Full pipeline: Blockly → extractMakers → applyCached → prependImports', () => {
    it('fully processes code with a cached p5 magic block', () => {
        const aiCode = `{
  // p5 파티클 생성
  new p5(s => {
    s.setup = () => { s.createCanvas(window.innerWidth, window.innerHeight).parent('app'); };
    s.draw = () => { s.fill(255,0,0); s.ellipse(s.random(s.width), s.random(s.height), 10); };
  });
}`;

        const cache = {
            'leave a rainbow trail': { code: aiCode, libs: ['p5'] },
        };

        const marker = makeMagicMarker('leave a rainbow trail');
        const blocklyCode = `window.createSprite("Hero", 200, 200);\n${marker}`;

        // step 1: apply cache
        const { processedCode, uncachedPrompts } = applyCachedReplacements(blocklyCode, cache);
        expect(uncachedPrompts).toHaveLength(0);
        expect(processedCode).toContain(aiCode);
        expect(processedCode).not.toContain('AI_MAGIC_TRIGGER');

        // step 2: prepend imports (based on all needed libs)
        const allLibs = Object.values(cache).flatMap(v => v.libs);
        const finalCode = prependImports(processedCode, allLibs);
        expect(finalCode).toMatch(/^import p5/);
    });

    it('correctly processes a complex combination of multiple blocks and AI magic', () => {
        // 블록 조합 시뮬레이션: 
        // 1. Create Sprite
        // 2. When Clicked -> Move Forward -> AI Magic (bounce)
        // 3. Always -> AI Magic (sparkle)

        const bounceAI = `{ // 통통 튀게 만들기 ✨\n  if(window.entities["Hero"]) window.entities["Hero"].y -= 10;\n}`;
        const sparkleAI = `{ // 파티클 뿌리기 ✨\n  // ... p5.js 코드가 들어간다고 가정\n}`;

        const cache = {
            'bounce like a basketball': { code: bounceAI, libs: ['matter-js'] },
            'make it sparkle': { code: sparkleAI, libs: ['p5'] }
        };

        const bounceMarker = makeMagicMarker('bounce like a basketball');
        const sparkleMarker = makeMagicMarker('make it sparkle');

        const combinedBlocklyCode = `
if(typeof createSprite === "function") createSprite("Hero", 200, 200);

document.getElementById('app').onclick = function() {
  if(typeof moveForward === "function") moveForward(10);
  ${bounceMarker}
};

window.onFrame = function() {
  ${sparkleMarker}
};
`;

        // step 1: apply cache
        const { processedCode, uncachedPrompts } = applyCachedReplacements(combinedBlocklyCode, cache);

        // 캐시에 모든 응답이 있으므로 uncached는 없어야 함
        expect(uncachedPrompts).toHaveLength(0);

        // AI 마커는 모두 사라져야 함
        expect(processedCode).not.toContain('AI_MAGIC_TRIGGER');

        // 일반 Javascript 코드와 AI 코드가 올바르게 결합되어 있어야 함
        expect(processedCode).toContain('createSprite("Hero"');
        expect(processedCode).toContain('moveForward(10);');
        expect(processedCode).toContain(bounceAI);
        expect(processedCode).toContain(sparkleAI);

        // step 2: prepend imports
        // 캐시에 존재하는 모든 라이브러리를 추출
        const allLibs = Array.from(new Set(Object.values(cache).flatMap(v => v.libs)));
        const finalCode = prependImports(processedCode, allLibs);

        // matter-js와 p5 import가 모두 맨 위에 추가되어야 함
        expect(finalCode).toMatch(/import Matter from 'https:\/\/esm\.sh\/matter-js@0\.19\.0';/);
        expect(finalCode).toMatch(/import p5 from 'https:\/\/esm\.sh\/p5@1\.9\.0';/);
    });
});
