# 🚀 Mistral Snap & Build: Block Expansion Proposal

This document outlines a roadmap for expanding the Blockly toolbox to empower users with more sophisticated creative coding capabilities and deeper AI integration.

---

## 🧠 1. AI & "Magic" Expansion (The Soul of the App)
Instead of just one generic Magic block, we can introduce specialized AI blocks that handle logic and targeting.

| Block Name | Message/UI | Expected AI Output |
| :--- | :--- | :--- |
| **Magic Condition (IF)** | `If: [Natural Language Prompt]` | Returns a boolean logic snippet (e.g., `dist(player.x, player.y, enemy.x, enemy.y) < 50`) |
| **Magic Styles** | `Style [Target] like [Prompt]` | Generates CSS-in-JS or p5 style properties (colors, strokes, shadows). |
| **Magic Transformation** | `Transform [Target] into [Prompt]` | Changes the shape, size, or rendering logic of a specific entity. |

---

## 🎨 2. Visuals & Art (p5.js focus)
Enhance the "Snap" part of the app with immediate visual feedback blocks.

| Block Name | Message/UI | Purpose |
| :--- | :--- | :--- |
| **Brush Mode** | `Set Drawing Brush to [Rainbow/Shadow/Neon]` | Switches between custom p5 drawing routines. |
| **Shape Library** | `Draw [Circle/Square/Star] at X:%1 Y:%2` | Standard p5 primitives for users who want manual control. |
| **Particle System** | `Explode %1 Particles at X:%2 Y:%3` | High-level abstraction for p5 particle arrays. |
| **Filter Layer** | `Apply [Invert/Blur/Threshold] Filter` | Interaction with the `filter()` function in p5. |

---

## 🏗️ 3. World Building & Physics (Matter.js focus)
Current physics is limited to gravity. Let's add interaction and collision.

| Block Name | Message/UI | Purpose |
| :--- | :--- | :--- |
| **Apply Force** | `Push %1 in Direction %2 with Power %3` | Wraps `Body.applyForce` for interactive games. |
| **Create Wall** | `Make Static Wall at X:%1 Y:%2 W:%3 H:%4` | Static bodies that entities can't pass through. |
| **Set Bounce** | `Make [Target] Bounciness %1` | Adjusts `restitution` on the fly. |
| **Collision Event** | `When %1 hits %2` | Event listener for Matter-js collision events. |

---

## 🔊 4. Audio & Sensors (Multimedia)
Leveraging the `p5.sound` integration we implemented.

| Block Name | Message/UI | Purpose |
| :--- | :--- | :--- |
| **Play Magic Sound** | `Play [Prompt] Sound` | Uses AI to find or generate a frequency/melody. |
| **Mic Level** | `Get Microphone Loudness` | Allows "shout to win" type interactions. |
| **Beep/Tone** | `Play Frequency %1 Hz for %2 ms` | Simple oscillatory feedback. |

---

## 🎮 5. Game Engine Essentials
Blocks that help bridge "creative coding" with "game making".

| Block Name | Message/UI | Purpose |
| :--- | :--- | :--- |
| **Score Manager** | `Add %1 to [Score Variable]` | Global score tracking with UI display. |
| **Camera Follow** | `Camera Follow Sprite [Name]` | Shifts coordinate space relative to a sprite. |
| **Timer** | `Every %1 Seconds [Stack]` | Periodic logic execution. |

---

## 🛠️ Implementation Plan: Meeting Agenda
1.  **Prioritization:** Which category provides the "WOW" factor for the next demo?
2.  **Runtime Support:** Do we need to add more helper functions to `Sandpack`'s `index.html` (e.g., `applyForce`, `playFrequency`)?
3.  **Prompt Engineering:** How do we refine the System Prompt to handle `Magic Condition` vs `Magic Action`?
4.  **UI/UX:** Add custom icons and distinct neon colors for each category to maintain the Cyberpunk aesthetic.
