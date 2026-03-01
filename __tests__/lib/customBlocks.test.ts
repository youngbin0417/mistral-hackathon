import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';
import { initializeCustomBlocks } from '@/lib/customBlocks';

describe('Custom Blocks Integration', () => {
    beforeAll(() => {
        // Mock DOM for Blockly if necessary, or just run headless
        initializeCustomBlocks();
    });

    it('registers all expected custom blocks', () => {
        const expectedBlocks = [
            'magic_block', 'magic_condition', 'magic_styles',
            'remix_code_block', 'add_feature_block',
            'draw_shape', 'explode_particles',
            'move_forward', 'turn_right', 'set_gravity', 'apply_force', 'create_sprite',
            'speak_block', 'voice_style_block', 'react_voice_block',
            'magic_bgm_block', 'play_sfx_block', 'play_frequency',
            'add_score', 'timer_every', 'when_clicked', 'always_loop',
            'text_print'
        ];

        expectedBlocks.forEach(blockType => {
            expect(Blockly.Blocks[blockType]).toBeDefined();
        });
    });

    describe('Generators', () => {
        let workspace: Blockly.Workspace;

        beforeEach(() => {
            workspace = new Blockly.Workspace();
        });

        afterEach(() => {
            workspace.dispose();
        });

        it('generates correct JS for magic_condition', () => {
            const block = workspace.newBlock('magic_condition');
            block.setFieldValue('test prompt', 'PROMPT');
            const code = javascriptGenerator.blockToCode(block) as [string, number];
            expect(code[0]).toContain('/* ✨ AI CONDITION: "test prompt" */ true');
        });

        it('generates correct JS for magic_styles', () => {
            const block = workspace.newBlock('magic_styles');
            block.setFieldValue('bg', 'TARGET');
            block.setFieldValue('red', 'PROMPT');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain("AI_MAGIC_STYLE: bg -> red");
        });

        it('generates correct JS for draw_shape', () => {
            const block = workspace.newBlock('draw_shape');
            block.setFieldValue('circle', 'SHAPE');
            block.setFieldValue(150, 'X');
            block.setFieldValue(200, 'Y');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('drawShape("circle", 150, 200)');
        });

        it('generates correct JS for apply_force', () => {
            const block = workspace.newBlock('apply_force');
            block.setFieldValue('Player', 'TARGET');
            block.setFieldValue(45, 'DIR');
            block.setFieldValue(10, 'POWER');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('applyForce("Player", 45, 10)');
        });

        it('generates correct JS for timer_every', () => {
            const block = workspace.newBlock('timer_every');
            block.setFieldValue(5, 'SECONDS');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('setInterval(function() {');
            expect(code).toContain('}, 5000)');
        });

        it('generates correct JS for speak_block', () => {
            const block = workspace.newBlock('speak_block');
            block.setFieldValue('Hello', 'TEXT');
            block.setFieldValue('Hero', 'CHARACTER');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('speakText("Hello", "Hero")');
        });

        it('generates correct JS for voice_style_block', () => {
            const block = workspace.newBlock('voice_style_block');
            block.setFieldValue('Hero', 'CHARACTER');
            block.setFieldValue('cute', 'STYLE');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('setVoiceStyle("Hero", "cute")');
        });

        it('generates correct JS for react_voice_block', () => {
            const block = workspace.newBlock('react_voice_block');
            block.setFieldValue('damage', 'EVENT');
            block.setFieldValue('Ouch!', 'PROMPT');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('document.addEventListener("game_damage"');
            expect(code).toContain('reactWithVoice("Ouch!")');
        });

        it('generates correct JS for magic_bgm_block', () => {
            const block = workspace.newBlock('magic_bgm_block');
            block.setFieldValue('tense battle', 'PROMPT');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('playBGM("tense battle")');
        });

        it('generates correct JS for play_sfx_block', () => {
            const block = workspace.newBlock('play_sfx_block');
            block.setFieldValue('laser', 'PROMPT');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('playSFX("laser")');
        });

        it('generates correct JS for remix_code_block', () => {
            const block = workspace.newBlock('remix_code_block');
            block.setFieldValue('make it faster', 'PROMPT');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('AI_MAGIC_REMIX: make it faster');
        });

        it('generates correct JS for add_feature_block', () => {
            const block = workspace.newBlock('add_feature_block');
            block.setFieldValue('add a power-up', 'PROMPT');
            const code = javascriptGenerator.blockToCode(block) as string;
            expect(code).toContain('AI_MAGIC_ADD: add a power-up');
        });
    });
});
