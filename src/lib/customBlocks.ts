import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

export function initializeCustomBlocks() {
    // === 1. AI & "Magic" Expansion ===
    Blockly.Blocks['magic_block'] = {
        init: function () {
            this.jsonInit({
                "type": "magic_block",
                "message0": "✨ Do Magic: %1",
                "args0": [{ "type": "field_input", "name": "PROMPT", "text": "make it sparkle" }],
                "previousStatement": null,
                "nextStatement": null,
                "colour": 290,
                "tooltip": "Describe what you want in natural language"
            });
        }
    };

    Blockly.Blocks['magic_condition'] = {
        init: function () {
            this.jsonInit({
                "type": "magic_condition",
                "message0": "✨ If: %1",
                "args0": [{ "type": "field_input", "name": "PROMPT", "text": "player is near enemy" }],
                "output": "Boolean",
                "colour": 290,
                "tooltip": "AI evaluates this condition"
            });
        }
    };

    Blockly.Blocks['magic_styles'] = {
        init: function () {
            this.jsonInit({
                "message0": "✨ Style %1 like %2",
                "args0": [
                    { "type": "field_input", "name": "TARGET", "text": "background" },
                    { "type": "field_input", "name": "PROMPT", "text": "cyberpunk neon grid" }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": 290
            });
        }
    };

    // === 1.1 Meta-Programming ===
    Blockly.Blocks['remix_code_block'] = {
        init: function () {
            this.jsonInit({
                "message0": "🧠 Remix Code: %1",
                "args0": [{ "type": "field_input", "name": "PROMPT", "text": "make it faster" }],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#ff00c8",
                "tooltip": "Refactor/optimize code using Codestral"
            });
        }
    };

    Blockly.Blocks['add_feature_block'] = {
        init: function () {
            this.jsonInit({
                "message0": "🧠 Add Feature: %1",
                "args0": [{ "type": "field_input", "name": "PROMPT", "text": "add a power-up" }],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#ff00c8",
                "tooltip": "Integrate a new logic logic into the game"
            });
        }
    };

    // === 2. Visuals & Art ===
    Blockly.Blocks['draw_shape'] = {
        init: function () {
            this.jsonInit({
                "message0": "Draw %1 at X:%2 Y:%3",
                "args0": [
                    {
                        "type": "field_dropdown",
                        "name": "SHAPE",
                        "options": [["Circle", "circle"], ["Square", "rect"], ["Star", "star"]]
                    },
                    { "type": "field_number", "name": "X", "value": 100 },
                    { "type": "field_number", "name": "Y", "value": 100 }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#4C97FF"
            });
        }
    };

    Blockly.Blocks['explode_particles'] = {
        init: function () {
            this.jsonInit({
                "message0": "Explode %1 Particles at X:%2 Y:%3",
                "args0": [
                    { "type": "field_number", "name": "COUNT", "value": 20 },
                    { "type": "field_number", "name": "X", "value": 200 },
                    { "type": "field_number", "name": "Y", "value": 200 }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#ff0066"
            });
        }
    };

    // === 3. World Building & Physics ===
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

    Blockly.Blocks['apply_force'] = {
        init: function () {
            this.jsonInit({
                "message0": "Push %1 in Direction %2 with Power %3",
                "args0": [
                    { "type": "field_input", "name": "TARGET", "text": "Hero" },
                    { "type": "field_number", "name": "DIR", "value": 90 },
                    { "type": "field_number", "name": "POWER", "value": 5 }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#7000ff"
            });
        }
    };

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

    // === 6. ElevenLabs Voice ===
    Blockly.Blocks['speak_block'] = {
        init: function () {
            this.jsonInit({
                "message0": "🎙️ Speak %1 as %2",
                "args0": [
                    { "type": "field_input", "name": "TEXT", "text": "Hello World!" },
                    { "type": "field_input", "name": "CHARACTER", "text": "Hero" }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#ff0066",
                "tooltip": "ElevenLabs TTS"
            });
        }
    };

    Blockly.Blocks['voice_style_block'] = {
        init: function () {
            this.jsonInit({
                "message0": "🎙️ Set Voice Style of %1 to %2",
                "args0": [
                    { "type": "field_input", "name": "CHARACTER", "text": "Hero" },
                    {
                        "type": "field_dropdown",
                        "name": "STYLE",
                        "options": [
                            ["Cute", "cute"],
                            ["Scary", "scary"],
                            ["Robot", "robot"],
                            ["Default", "default"]
                        ]
                    }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#ff0066"
            });
        }
    };

    Blockly.Blocks['react_voice_block'] = {
        init: function () {
            this.jsonInit({
                "message0": "🎙️ When %1 : React with Voice %2",
                "args0": [
                    {
                        "type": "field_dropdown",
                        "name": "EVENT",
                        "options": [
                            ["Player takes damage", "damage"],
                            ["Enemy is defeated", "defeat"],
                            ["Game starts", "start"]
                        ]
                    },
                    { "type": "field_input", "name": "PROMPT", "text": "Ouch! That hurts!" }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#ff0066"
            });
        }
    };

    // === 4. Audio & Sensors ===
    Blockly.Blocks['play_frequency'] = {
        init: function () {
            this.jsonInit({
                "message0": "Play Frequency %1 Hz for %2 ms",
                "args0": [
                    { "type": "field_number", "name": "HZ", "value": 440 },
                    { "type": "field_number", "name": "MS", "value": 500 }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#FFBF00"
            });
        }
    };

    // === 5. Game Engine Essentials ===
    Blockly.Blocks['add_score'] = {
        init: function () {
            this.jsonInit({
                "message0": "Add %1 to Score",
                "args0": [{ "type": "field_number", "name": "AMOUNT", "value": 10 }],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#00ccff"
            });
        }
    };

    Blockly.Blocks['timer_every'] = {
        init: function () {
            this.jsonInit({
                "message0": "Every %1 Seconds %2",
                "args0": [
                    { "type": "field_number", "name": "SECONDS", "value": 1 },
                    { "type": "input_statement", "name": "STACK" }
                ],
                "colour": "#FFBF00"
            });
        }
    };

    Blockly.Blocks['when_clicked'] = {
        init: function () {
            this.jsonInit({
                "message0": "When Clicked %1",
                "args0": [{ "type": "input_statement", "name": "STACK" }],
                "colour": "#FFBF00"
            });
        }
    };

    Blockly.Blocks['always_loop'] = {
        init: function () {
            this.jsonInit({
                "message0": "Always (Every Frame) %1",
                "args0": [{ "type": "input_statement", "name": "STACK" }],
                "colour": "#FFBF00"
            });
        }
    };

    // === 7. ElevenLabs Audio Engine (BGM & SFX) ===
    Blockly.Blocks['magic_bgm_block'] = {
        init: function () {
            this.jsonInit({
                "message0": "🎵 Magic BGM %1",
                "args0": [
                    { "type": "field_input", "name": "PROMPT", "text": "tense 8-bit space battle" }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#FFBF00"
            });
        }
    };

    Blockly.Blocks['play_sfx_block'] = {
        init: function () {
            this.jsonInit({
                "message0": "🔊 Play SFX %1",
                "args0": [
                    { "type": "field_input", "name": "PROMPT", "text": "laser gun pew" }
                ],
                "previousStatement": null,
                "nextStatement": null,
                "colour": "#FFBF00"
            });
        }
    };

    // Overrides
    Blockly.Blocks['text_print'] = { // We redefine to ensure standard block exists locally if needed or let system handle it, but we only override generator below.
        init: function () {
            this.jsonInit({
                "message0": "print %1",
                "args0": [{ "type": "input_value", "name": "TEXT" }],
                "previousStatement": null,
                "nextStatement": null,
                "colour": 160
            })
        }
    }


    registerGenerators();
}

function registerGenerators() {
    javascriptGenerator.forBlock['magic_block'] = function (block: Blockly.Block) {
        const prompt = block.getFieldValue('PROMPT');
        const escapedPrompt = prompt.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const code = `\n/* ✨ AI Request: "${prompt}" */\n{ console.log('AI_MAGIC_TRIGGER: ${escapedPrompt}'); }\n`;
        const svgBlock = block as Blockly.BlockSvg;
        if (typeof svgBlock.getSvgRoot === 'function' && svgBlock.getSvgRoot()) {
            svgBlock.getSvgRoot().classList.add('magic-block-glow');
        }
        return code;
    };

    javascriptGenerator.forBlock['magic_condition'] = function (block: Blockly.Block) {
        const prompt = block.getFieldValue('PROMPT').replace(/'/g, "\\'").replace(/"/g, '\\"');
        return [`/* ✨ AI CONDITION: "${prompt}" */ true`, Order.ATOMIC];
    };

    javascriptGenerator.forBlock['magic_styles'] = function (block: Blockly.Block) {
        const target = block.getFieldValue('TARGET');
        const prompt = block.getFieldValue('PROMPT');
        const escapedPrompt = prompt.replace(/'/g, "\\'").replace(/"/g, '\\"');
        return `\n/* ✨ AI Request: Style ${target} like ${prompt} */\n{ console.log('AI_MAGIC_STYLE: ${target} -> ${escapedPrompt}'); }\n`;
    };

    javascriptGenerator.forBlock['remix_code_block'] = function (block: Blockly.Block) {
        const prompt = block.getFieldValue('PROMPT');
        const escapedPrompt = prompt.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const code = `\n/* ✨ AI Request: REMIX CODE - "${escapedPrompt}" */\n{ console.log('AI_MAGIC_REMIX: ${escapedPrompt}'); }\n`;
        const svgBlock = block as Blockly.BlockSvg;
        if (typeof svgBlock.getSvgRoot === 'function' && svgBlock.getSvgRoot()) {
            svgBlock.getSvgRoot().classList.add('magic-block-glow');
        }
        return code;
    };

    javascriptGenerator.forBlock['add_feature_block'] = function (block: Blockly.Block) {
        const prompt = block.getFieldValue('PROMPT');
        const escapedPrompt = prompt.replace(/'/g, "\\'").replace(/"/g, '\\"');
        const code = `\n/* ✨ AI Request: ADD FEATURE - "${escapedPrompt}" */\n{ console.log('AI_MAGIC_ADD: ${escapedPrompt}'); }\n`;
        const svgBlock = block as Blockly.BlockSvg;
        if (typeof svgBlock.getSvgRoot === 'function' && svgBlock.getSvgRoot()) {
            svgBlock.getSvgRoot().classList.add('magic-block-glow');
        }
        return code;
    };

    javascriptGenerator.forBlock['move_forward'] = function (block: Blockly.Block) {
        const amount = block.getFieldValue('AMOUNT');
        return `if(typeof moveForward === "function") moveForward(${amount});\n`;
    };

    javascriptGenerator.forBlock['turn_right'] = function (block: Blockly.Block) {
        const degrees = block.getFieldValue('DEGREES');
        return `if(typeof turnRight === "function") turnRight(${degrees});\n`;
    };

    javascriptGenerator.forBlock['set_gravity'] = function (block: Blockly.Block) {
        const value = block.getFieldValue('VALUE');
        return `if(typeof setGravity === "function") setGravity(${value});\n`;
    };

    javascriptGenerator.forBlock['apply_force'] = function (block: Blockly.Block) {
        const target = block.getFieldValue('TARGET');
        const dir = block.getFieldValue('DIR');
        const power = block.getFieldValue('POWER');
        return `if(typeof applyForce === "function") applyForce("${target}", ${dir}, ${power});\n`;
    };

    javascriptGenerator.forBlock['draw_shape'] = function (block: Blockly.Block) {
        const shape = block.getFieldValue('SHAPE');
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        return `if(typeof drawShape === "function") drawShape("${shape}", ${x}, ${y});\n`;
    };

    javascriptGenerator.forBlock['explode_particles'] = function (block: Blockly.Block) {
        const count = block.getFieldValue('COUNT');
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        return `if(typeof explodeParticles === "function") explodeParticles(${count}, ${x}, ${y});\n`;
    };

    javascriptGenerator.forBlock['create_sprite'] = function (block: Blockly.Block) {
        const name = block.getFieldValue('NAME');
        const x = block.getFieldValue('X');
        const y = block.getFieldValue('Y');
        return `if(typeof createSprite === "function") createSprite("${name}", ${x}, ${y});\n`;
    };

    javascriptGenerator.forBlock['play_frequency'] = function (block: Blockly.Block) {
        const hz = block.getFieldValue('HZ');
        const ms = block.getFieldValue('MS');
        return `if(typeof playFrequency === "function") playFrequency(${hz}, ${ms});\n`;
    };

    javascriptGenerator.forBlock['speak_block'] = function (block: Blockly.Block) {
        const text = block.getFieldValue('TEXT');
        const character = block.getFieldValue('CHARACTER');
        return `if(typeof speakText === "function") speakText("${text}", "${character}");\n`;
    };

    javascriptGenerator.forBlock['voice_style_block'] = function (block: Blockly.Block) {
        const character = block.getFieldValue('CHARACTER');
        const style = block.getFieldValue('STYLE');
        return `if(typeof setVoiceStyle === "function") setVoiceStyle("${character}", "${style}");\n`;
    };

    javascriptGenerator.forBlock['react_voice_block'] = function (block: Blockly.Block) {
        const event = block.getFieldValue('EVENT');
        const prompt = block.getFieldValue('PROMPT');
        return `document.addEventListener("game_${event}", () => { if(typeof reactWithVoice === "function") reactWithVoice("${prompt}"); });\n`;
    };

    javascriptGenerator.forBlock['magic_bgm_block'] = function (block: Blockly.Block) {
        const prompt = block.getFieldValue('PROMPT');
        return `if(typeof playBGM === "function") playBGM("${prompt}");\n`;
    };

    javascriptGenerator.forBlock['play_sfx_block'] = function (block: Blockly.Block) {
        const prompt = block.getFieldValue('PROMPT');
        return `if(typeof playSFX === "function") playSFX("${prompt}");\n`;
    };

    javascriptGenerator.forBlock['add_score'] = function (block: Blockly.Block) {
        const amount = block.getFieldValue('AMOUNT');
        return `if(typeof addScore === "function") addScore(${amount});\n`;
    };

    javascriptGenerator.forBlock['timer_every'] = function (block: Blockly.Block) {
        const seconds = block.getFieldValue('SECONDS');
        const branch = javascriptGenerator.statementToCode(block, 'STACK') || "";
        return `setInterval(function() {\n${branch}}, ${seconds * 1000});\n`;
    };

    javascriptGenerator.forBlock['when_clicked'] = function (block: Blockly.Block) {
        const branch = javascriptGenerator.statementToCode(block, 'STACK') || "";
        return `document.getElementById('app').addEventListener('click', function() {\n${branch}});\n`;
    };

    javascriptGenerator.forBlock['always_loop'] = function (block: Blockly.Block) {
        const branch = javascriptGenerator.statementToCode(block, 'STACK') || "";
        return `window.onFrame = function() {\n${branch}};\n`;
    };

    javascriptGenerator.forBlock['text_print'] = function (block: Blockly.Block) {
        const msg = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
        return 'console.log(' + msg + ');\n';
    };
}
