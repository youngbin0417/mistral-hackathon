/**
 * runtime.js
 * 
 * Shared Snap & Build runtime for both Sandpack environment and Fullscreen preview.
 */

export const RUNTIME_CODE = `
    window.entities = {};
    window.bgmAudio = null;
    
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
                const url = URL.createObjectURL(blob);
                window.bgmAudio = new Audio(url);
                window.bgmAudio.loop = true;
                window.bgmAudio.play();
            }
        } catch(e) { console.error("BGM error", e); }
    };

    window.playSFX = async (prompt) => {
        try {
            const res = await fetch('/api/sfx', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: prompt, duration_seconds: 1, isBGM: false })
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.play();
            }
        } catch(e) { console.error("SFX error", e); }
    };

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
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const audio = new Audio(url);
                audio.play();
                if (window.entities[character]) {
                    window.entities[character].speaking = text;
                    audio.onended = () => { window.entities[character].speaking = null; };
                }
            }
        } catch(e) { console.error("Audio error", e); }
    };

    window.reactWithVoice = (prompt) => window.speakText(prompt, 'Hero');

    window.createSprite = (name, x, y) => {
        if (!window.entities[name]) {
            window.entities[name] = { x, y, angle: 0, color: '#00e5ff' };
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

    const app = document.getElementById('app');
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    app.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function draw() {
        // If a library (like p5) created its own canvas, hide our fallback one
        const extraCanvas = document.querySelectorAll('canvas').length > 1;
        if (extraCanvas) {
            canvas.style.display = 'none';
        } else {
            canvas.style.display = 'block';
            ctx.fillStyle = '#0d0d14'; // Cyberpunk dark background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw entities
            Object.entries(window.entities).forEach(([name, e]) => {
                ctx.save();
                ctx.translate(e.x, e.y);
                ctx.rotate(e.angle);
                
                // Draw Sprite (Triangle/Robot head style)
                ctx.fillStyle = e.color || '#00e5ff';
                ctx.beginPath();
                ctx.moveTo(15, 0);
                ctx.lineTo(-10, 10);
                ctx.lineTo(-10, -10);
                ctx.closePath();
                ctx.fill();
                
                ctx.restore();

                // Draw Speech Bubble if speaking
                if (e.speaking) {
                    ctx.font = 'bold 12px sans-serif';
                    const textWidth = ctx.measureText(e.speaking).width;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    ctx.beginPath();
                    ctx.roundRect(e.x - textWidth/2 - 10, e.y - 45, textWidth + 20, 25, 10);
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.fillText(e.speaking, e.x - textWidth/2, e.y - 28);
                }
            });
        }
        requestAnimationFrame(draw);
    }
    draw();
`;
