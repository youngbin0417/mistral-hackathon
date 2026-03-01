/**
 * runtime.js
 *
 * Shared Blockstral runtime for both Sandpack environment and Fullscreen preview.
 * ALL functions referenced by customBlocks.ts generators must be defined here.
 */

export const RUNTIME_CODE = `
    window.entities = {};
    window.bgmAudio = null;
    window.score = 0;
    window.gravity = 0;
    window.gameStarted = false;

    // ── Audio ────────────────────────────────────────────────────────────
    window.playBGM = (mood) => {
        if (window.bgmAudio) { window.bgmAudio.pause(); }
        try {
            // Priority: Local file -> Placeholder or Synthetic tone fallback
            const src = '/audio/' + mood + '.mp3';
            window.bgmAudio = new Audio(src);
            window.bgmAudio.loop = true;
            window.bgmAudio.volume = 0.4;
            
            window.bgmAudio.play().catch(e => {
                console.warn('BGM file missing or blocked:', mood);
                // Fallback: Just play a subtle frequency to indicate BGM requested
                window.playFrequency(mood === 'tense' ? 110 : 220, 100);
            });
        } catch(e) { console.error('BGM error', e); }
    };

    window.playSFX = async (prompt) => {
        try {
            const res = await fetch('/api/main/sfx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt, duration_seconds: 1, isBGM: false })
            });
            if (res.ok) {
                const audio = new Audio(URL.createObjectURL(await res.blob()));
                audio.play();
            }
        } catch(e) { console.error('SFX error', e); }
    };

    window.playFrequency = (hz, ms) => {
        try {
            const ctx2 = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx2.createOscillator();
            osc.connect(ctx2.destination);
            osc.frequency.value = hz;
            osc.start();
            setTimeout(() => { osc.stop(); ctx2.close(); }, ms);
        } catch(e) { console.error('Frequency error', e); }
    };

    // ── Voice ────────────────────────────────────────────────────────────
    window.voiceStyles = {};
    window.setVoiceStyle = (character, style) => { window.voiceStyles[character] = style; };

    window.speakText = (text, character) => {
        return new Promise(async (resolve) => {
            const style = window.voiceStyles[character] || 'default';
            let voiceId = 'pNInz6obpgDQGcFmaJcg'; // default: Adam
            if (style === 'villain') voiceId = 'ErXwobaYiN019PkySvjV';
            if (style === 'robot') voiceId = 'tx3xgqwjuJCIPX6B28xE';
            if (style === 'alien') voiceId = 'yoZ06aMxZJJ28mfd3POQ';
            
            try {
                const res = await fetch('/api/main/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, voiceId })
                });
                if (res.ok) {
                    const audio = new Audio(URL.createObjectURL(await res.blob()));
                    
                    if (window.entities[character]) {
                        window.entities[character].speaking = text;
                        audio.onended = () => { 
                            window.entities[character].speaking = null; 
                            resolve(); 
                        };
                    } else {
                        audio.onended = resolve;
                    }
                    audio.play();
                } else {
                    resolve();
                }
            } catch(e) { console.error('Audio error', e); resolve(); }
        });
    };

    window.dialogueScene = async (s1, t1, s2, t2) => {
        await window.speakText(t1, s1);
        await window.speakText(t2, s2);
    };

    window.reactWithVoice = (prompt) => window.speakText(prompt, 'Hero');

    // ── Sprites & World ──────────────────────────────────────────────────
    window.createSprite = (name, x, y) => {
        if (!window.entities[name]) {
            window.entities[name] = { x, y, angle: 0, color: '#00e5ff', vx: 0, vy: 0, hp: 100, dead: false };
        }
    };

    window.damageEntity = (name, amount) => {
        const e = window.entities[name];
        if (!e || e.dead) return;
        e.hp -= amount;
        if (e.hp <= 0) {
            e.hp = 0;
            e.dead = true;
            document.dispatchEvent(new CustomEvent('game_defeat', { detail: { target: name } }));
            if (typeof window.explodeParticles === 'function') {
                window.explodeParticles(30, e.x, e.y);
            }
        }
    };

    window.moveForward = (target, amount) => {
        const move = (e) => {
            e.x += Math.cos(e.angle) * (amount || 1);
            e.y += Math.sin(e.angle) * (amount || 1);
        };
        if (!target || target === 'all') {
            Object.values(window.entities).forEach(move);
        } else if (window.entities[target]) {
            move(window.entities[target]);
        }
    };

    window.turnRight = (target, deg) => {
        const rad = (deg * Math.PI) / 180;
        const turn = (e) => e.angle += rad;
        if (!target || target === 'all') {
            Object.values(window.entities).forEach(turn);
        } else if (window.entities[target]) {
            turn(window.entities[target]);
        }
    };

    window.setGravity = (value) => { window.gravity = value; };

    window.applyForce = (name, dirDeg, power) => {
        const e = window.entities[name];
        if (!e) return;
        const rad = (dirDeg * Math.PI) / 180;
        e.vx = (e.vx || 0) + Math.cos(rad) * power;
        e.vy = (e.vy || 0) + Math.sin(rad) * power;
    };

    // ── Visuals ──────────────────────────────────────────────────────────
    window._shapes = [];   // { shape, x, y, life }
    window._particles = [];

    window.drawShape = (shape, x, y) => {
        window._shapes.push({ shape, x, y, life: 60 });
    };

    window.explodeParticles = (count, x, y) => {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            window._particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 60,
                color: 'hsl(' + (Math.random() * 360) + ', 100%, 60%)'
            });
        }
    };

    // ── Game ─────────────────────────────────────────────────────────────
    window.addScore = (amount) => {
        window.score = (window.score || 0) + amount;
    };

    // ── Canvas setup ─────────────────────────────────────────────────────
    const app = document.getElementById('app');
    // Clean up existing canvases to prevent duplication on reload
    if (app) {
        const existingCanvases = app.querySelectorAll('canvas');
        existingCanvases.forEach(c => c.remove());
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (app) app.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // ── Style Helper (for Magic Styles) ──────────────────────────────────
    window.applyStyle = (config) => {
        const app = document.getElementById('app');
        if (!app) return;
        if (typeof config === 'string') {
            app.style.filter = config; // e.g. "hue-rotate(90deg) contrast(1.2)"
        } else if (typeof config === 'object') {
            Object.assign(app.style, config);
        }
    };

    // always_loop block support
    window.onFrameHandlers = [];
    window.onFrame = (fn) => { if (typeof fn === 'function') window.onFrameHandlers.push(fn); };

    function draw() {
        // ... (existing canvas logic)
        // Run the main draw loop
        canvas.style.display = 'block';
        
        // Clear background
        ctx.fillStyle = '#0d0d14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw shapes (temporary)
            window._shapes = (window._shapes || []).filter(s => s.life-- > 0);
            window._shapes.forEach(s => {
                ctx.fillStyle = '#00e5ff';
                ctx.beginPath();
                if (s.shape === 'circle') {
                    ctx.arc(s.x, s.y, 30, 0, Math.PI * 2);
                } else if (s.shape === 'rect') {
                    ctx.rect(s.x - 25, s.y - 25, 50, 50);
                } else if (s.shape === 'star') {
                    for (let i = 0; i < 5; i++) {
                        const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                        ctx[i === 0 ? 'moveTo' : 'lineTo'](s.x + 30 * Math.cos(a), s.y + 30 * Math.sin(a));
                    }
                    ctx.closePath();
                }
                ctx.fill();
            });

            // Draw particles
            window._particles = (window._particles || []).filter(p => p.life-- > 0);
            window._particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                ctx.globalAlpha = p.life / 60;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
            });
            ctx.globalAlpha = 1;

            // Handle Entities: Physics, Collision, Drawing
            const entitiesArr = Object.entries(window.entities);
            for (let i = 0; i < entitiesArr.length; i++) {
                const [name, e] = entitiesArr[i];
                if (e.dead) continue; // Skip dead entities
                
                // Physics update
                e.vy = (e.vy || 0) + (window.gravity || 0) * 0.1;
                e.x += (e.vx || 0);
                e.y += (e.vy || 0);

                for (let j = i + 1; j < entitiesArr.length; j++) {
                    const [name2, e2] = entitiesArr[j];
                    if (e2.dead) continue; // Skip dead target entities
                    const dx = e.x - e2.x;
                    const dy = e.y - e2.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if (dist < 30) { 
                        const now = Date.now();
                        const pairId = [name, name2].sort().join('_');
                        if (!window._collisionCooldowns) window._collisionCooldowns = {};
                        
                        if (!window._collisionCooldowns[pairId] || now - window._collisionCooldowns[pairId] > 1000) {
                            window._collisionCooldowns[pairId] = now;
                            document.dispatchEvent(new CustomEvent('game_damage', { detail: { target: name, source: name2 } }));
                            
                            // Apply damage on collision
                            window.damageEntity(name, 25);
                            window.damageEntity(name2, 25);
                            
                            window.explodeParticles(15, (e.x + e2.x)/2, (e.y + e2.y)/2);
                        }
                    }
                }

                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.rotate(e.angle);
                ctx.fillStyle = e.color || '#00e5ff';
                ctx.beginPath();
                ctx.moveTo(15, 0);
                ctx.lineTo(-10, 10);
                ctx.lineTo(-10, -10);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                if (e.speaking) {
                    ctx.font = 'bold 12px sans-serif';
                    const tw = ctx.measureText(e.speaking).width;
                    ctx.fillStyle = 'rgba(255,255,255,0.9)';
                    ctx.beginPath();
                    ctx.roundRect(e.x - tw/2 - 10, e.y - 45, tw + 20, 25, 10);
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.fillText(e.speaking, e.x - tw/2, e.y - 28);
                }
            }

            if (window.score) {
                ctx.fillStyle = '#00e5ff';
                ctx.font = 'bold 20px monospace';
                ctx.fillText('Score: ' + window.score, 16, 36);
            }
        }

        // Run all registered frame handlers
        window.onFrameHandlers.forEach(handler => {
            try { handler(); } catch(e) { console.error('Frame handler error', e); }
        });

        requestAnimationFrame(draw);
    }
    draw();

    // Export a helper to check start status
    window.onGameStart = (callback) => {
        if (window.gameStarted) {
            callback();
        } else {
            document.addEventListener('game_start', callback);
        }
    };

    // Auto-trigger game_start event
    setTimeout(() => {
        window.gameStarted = true;
        document.dispatchEvent(new CustomEvent('game_start'));
    }, 500);
`;
