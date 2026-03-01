/**
 * runtime.js
 *
 * Shared Snap & Build runtime for both Sandpack environment and Fullscreen preview.
 * ALL functions referenced by customBlocks.ts generators must be defined here.
 */

export const RUNTIME_CODE = `
    window.entities = {};
    window.bgmAudio = null;
    window.score = 0;
    window.gravity = 0;

    // ── Audio ────────────────────────────────────────────────────────────
    window.playBGM = async (prompt) => {
        if (window.bgmAudio) { window.bgmAudio.pause(); }
        try {
            const res = await fetch('/api/sfx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt, duration_seconds: 5, isBGM: true })
            });
            if (res.ok) {
                const blob = await res.blob();
                window.bgmAudio = new Audio(URL.createObjectURL(blob));
                window.bgmAudio.loop = true;
                window.bgmAudio.play();
            }
        } catch(e) { console.error('BGM error', e); }
    };

    window.playSFX = async (prompt) => {
        try {
            const res = await fetch('/api/sfx', {
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

    window.speakText = async (text, character) => {
        const style = window.voiceStyles[character] || 'default';
        let voiceId = '21m00Tcm4TlvDq8ikWAM';
        if (style === 'cute') voiceId = 'EXAVITQu4vr4xnSDxMaL';
        if (style === 'scary') voiceId = 'bVMeCyTHy58xNoL34h3p';
        if (style === 'robot') voiceId = 'VR6AewLTigWG4xSOukaG';
        try {
            const res = await fetch('/api/speak', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceId })
            });
            if (res.ok) {
                const audio = new Audio(URL.createObjectURL(await res.blob()));
                audio.play();
                if (window.entities[character]) {
                    window.entities[character].speaking = text;
                    audio.onended = () => { window.entities[character].speaking = null; };
                }
            }
        } catch(e) { console.error('Audio error', e); }
    };

    window.reactWithVoice = (prompt) => window.speakText(prompt, 'Hero');

    // ── Sprites & World ──────────────────────────────────────────────────
    window.createSprite = (name, x, y) => {
        if (!window.entities[name]) {
            window.entities[name] = { x, y, angle: 0, color: '#00e5ff', vx: 0, vy: 0 };
        }
    };

    window.moveForward = (amount) => {
        Object.values(window.entities).forEach(e => {
            e.x += Math.cos(e.angle) * (amount || 1);
            e.y += Math.sin(e.angle) * (amount || 1);
        });
    };

    window.turnRight = (deg) => {
        const rad = (deg * Math.PI) / 180;
        Object.values(window.entities).forEach(e => e.angle += rad);
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
                color: \`hsl(\${Math.random() * 360}, 100%, 60%)\`
            });
        }
    };

    // ── Game ─────────────────────────────────────────────────────────────
    window.addScore = (amount) => {
        window.score = (window.score || 0) + amount;
    };

    // ── Canvas setup ─────────────────────────────────────────────────────
    const app = document.getElementById('app');
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    app.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    // always_loop block support
    window.onFrameHandlers = [];
    window.onFrame = (fn) => { if (typeof fn === 'function') window.onFrameHandlers.push(fn); };

    function draw() {
        // ... (existing canvas logic)
        const extraCanvas = document.querySelectorAll('canvas').length > 1;
        if (extraCanvas) {
            canvas.style.display = 'none';
        } else {
            canvas.style.display = 'block';
            ctx.fillStyle = '#0d0d14';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            Object.values(window.entities).forEach(e => {
                e.vy = (e.vy || 0) + (window.gravity || 0) * 0.1;
                e.x += (e.vx || 0);
                e.y += (e.vy || 0);
            });

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

            window._particles = (window._particles || []).filter(p => p.life-- > 0);
            window._particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                ctx.globalAlpha = p.life / 60;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
            });
            ctx.globalAlpha = 1;

            Object.entries(window.entities).forEach(([name, e]) => {
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
            });

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
`;
