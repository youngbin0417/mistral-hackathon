# Software Requirements Specification (SRS)

## Project: Mistral Snap & Build
**Version:** 2.0 - AI Native Edition  
**Date:** 2024-02-28  
**Duration:** 48 Hours  
**Team:** 4 People  

---

## 1. Vision Statement

> **"Kids snap blocks. AI understands imagination. Real code emerges."**

Mistral Snap & Build is not a visual compiler—it's an **AI-native creative partner**. While traditional block coding limits children to pre-defined commands, our "Magic Block" allows natural language imagination to transform into executable code. This is only possible with LLMs.

**The Pitch:** *"Existing block coding gives you 'Move 10 steps'. We give you 'Make the monster dance'—and the AI creates the animation."*

---

## 2. Functional Requirements

### 2.1 Block Editor System (FR-BLOCK)

| ID | Requirement | Priority | Vibe Prompt |
|---|---|---|---|
| FR-BLOCK-001 | Integrate Google Blockly with React | P0 | "Set up Blockly in Next.js with React hooks" |
| FR-BLOCK-002 | Define standard blocks: Character, Movement, Physics, Event | P0 | "Create 4 standard Blockly blocks with JSON" |
| **FR-BLOCK-003** | **Implement "Magic Block" (✨): Free-text input block for natural language** | **P0** | **"Create a block with text input field that accepts natural language descriptions"** |
| FR-BLOCK-004 | Real-time workspace serialization to JSON | P0 | "Export workspace to JSON on change, debounced" |
| FR-BLOCK-005 | Visual feedback: snap animation, neon glow effects | P1 | "Add CSS animations and neon glow to blocks" |

**Magic Block Specification:**

```json
{
  "type": "magic_block",
  "message0": "✨ Do Magic: %1",
  "args0": [
    {
      "type": "field_input",
      "name": "PROMPT",
      "text": "make it sparkle and explode"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 290,
  "tooltip": "Describe what you want in natural language",
  "helpUrl": ""
}
```

**Example Magic Block Inputs:**
- "Make the ball leave a rainbow trail"
- "Add gravity that feels like the moon"
- "Make the monster dance when clicked"
- "Create particle explosion on collision"

---

### 2.2 AI Agent Pipeline (FR-AI)

| ID            | Requirement                                                                                              | Priority | Vibe Prompt                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| FR-AI-001     | Codestral API integration with streaming                                                                 | P0       | "Create API route for Codestral streaming"                                                                               |
| FR-AI-002     | Standard block-to-code translation                                                                       | P0       | "Convert standard blocks to p5.js code"                                                                                  |
| **FR-AI-003** | **Magic Block interpretation: Natural language → Context-aware code**                                    | **P0**   | **"If block type is 'magic_block', interpret user's text and generate appropriate p5.js code using existing variables"** |
| FR-AI-004     | Agent chain: Generator → Refiner                                                                         | P0       | "Chain two Mistral calls for generation and optimization"                                                                |
| **FR-AI-005** | **Self-Healing: Auto-fix invalid block combinations**                                                    | **P1**   | **"Detect logical errors in block combinations, suggest fixes via AI, execute corrected version"**                       |
| **FR-AI-006** | **Context-aware library injection: Auto-import complex libraries (Matter.js, p5.sound) based on intent** | **P1**   | **"Analyze magic block intent, inject required libraries (physics, sound, particles) automatically"**                    |
| FR-AI-007     | Code validation: Syntax check before execution                                                           | P0       | "Validate JS using Acorn parser"                                                                                         |

**Magic Block Prompt Architecture:**

```typescript
const MAGIC_BLOCK_SYSTEM = `You are Codestral, an expert creative coder.
The user has placed a "Magic Block" with natural language in their block program.

Context:
- Current variables: \${context.variables}
- Existing sprites: \${context.sprites}
- Previous blocks: \${context.blockHistory}

Magic Request: "\${magicBlockInput}"

Generate p5.js code that:
1. Interprets the user's intent literally but intelligently
2. Uses existing variables when possible
3. Imports necessary libraries automatically (Matter.js for physics, p5.sound for audio)
4. Includes comments explaining the "magic"

Example:
Input: "make it sparkle"
Output: Particle system with sparkle effect attached to the sprite

Return ONLY the code implementing this feature.`;

// Example generation:
// Input: "make the ball bounce like a basketball"
// Output: Code importing Matter.js, setting restitution to 0.82, adding spin physics
```

**Self-Healing Prompt:**

```typescript
const SELF_HEALING_SYSTEM = `You are a debugging assistant for children's block code.
The current block combination has a logical error: \${errorDescription}

Current blocks: \${blockJSON}

Fix the logic while preserving the child's intent.
Explain the fix in simple terms: "\${simpleExplanation}"
Generate corrected code that actually runs.`;
```

---

### 2.3 Real-time Execution Environment (FR-RUN)

| ID | Requirement | Priority | Vibe Prompt |
|---|---|---|---|
| FR-RUN-001 | Sandpack React integration | P0 | "Integrate Sandpack for vanilla HTML/JS" |
| FR-RUN-002 | Hot module replacement | P0 | "Instant reload on code change" |
| FR-RUN-003 | Error boundary with overlay | P0 | "Catch runtime errors, display overlay" |
| **FR-RUN-004** | **Library auto-loader: Dynamically inject CDN libraries based on AI detection** | **P1** | **"Scan generated code for imports, inject required CDNs before execution"** |

---

### 2.4 UI/UX Polish (FR-UI)

| ID | Requirement | Priority | Vibe Prompt |
|---|---|---|---|
| FR-UI-001 | "Show Code" modal with syntax highlighting | P0 | "Modal with Prism.js highlighting" |
| FR-UI-002 | AI status indicator | P0 | "Animated status bar for AI activity" |
| **FR-UI-003** | **Cyberpunk Dark Theme: Custom Blockly renderer with neon glow** | **P0** | **"Override Blockly CSS with dark theme, neon borders, glassmorphism effects"** |
| FR-UI-004 | Split-pane layout (40/60) | P0 | "Resizable panels with react-resizable-panels" |
| **FR-UI-005** | **Magic Block highlighting: Pulsing animation when AI is interpreting** | **P1** | **"Add pulsing glow effect to Magic Block during generation"** |

**Visual Design System:**

```css
/* Cyberpunk Blockly Theme */
--block-bg: #0a0a0f;
--block-border: #00f0ff;
--block-glow: 0 0 10px #00f0ff, 0 0 20px #00f0ff40;
--magic-block-gradient: linear-gradient(135deg, #ff00ff, #00f0ff);
--text-primary: #e0e0e0;
--accent-ai: #ff00ff;

/* Magic Block Specific */
.magic-block {
  background: var(--magic-block-gradient);
  border: 2px solid #fff;
  box-shadow: 0 0 15px #ff00ff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 15px #ff00ff; }
  50% { box-shadow: 0 0 30px #ff00ff, 0 0 50px #00f0ff; }
}
```

---

## 3. The "AI Native" Differentiators

### 3.1 Feature Comparison Matrix

| Capability | Scratch | Traditional Block Coding | **Mistral Snap & Build** |
|---|---|---|---|
| Pre-defined commands | ✅ | ✅ | ✅ |
| Visual programming | ✅ | ✅ | ✅ |
| **Natural language creativity** | ❌ | ❌ | **✅ (Magic Block)** |
| **Auto-complex library integration** | ❌ | ❌ | **✅ (AI injects Matter.js, etc.)** |
| **Self-healing errors** | ❌ | ❌ | **✅ (Auto-fix invalid logic)** |
| **Context-aware generation** | ❌ | ❌ | **✅ (Understands sprite state)** |

### 3.2 Key User Stories

**Story 1: The Imagination Gap**
> Sarah (8) wants her game character to "leave a fire trail". In Scratch, this requires 10+ blocks with particle knowledge. In Snap & Build, she types "leave a fire trail" in a Magic Block. Codestral generates a particle system with orange gradients and fade effects.

**Story 2: The Physics Leap**
> Mike (10) wants "moon gravity". Traditional tools require understanding gravity constants. Here, he types "gravity like the moon". AI injects Matter.js, sets gravity to 1.62 m/s², and adjusts sprite density for realistic bouncing.

**Story 3: The Broken Logic**
> Alex connects "If key pressed" to "Set gravity to up". This breaks physics. Instead of crashing, the AI says: *"I think you want anti-gravity! Let me fix that"* and generates inverted gravity code with jetpack particle effects.

---

## 4. Technical Architecture

### 4.1 Enhanced Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Blockly    │  │   Magic      │  │    Live          │   │
│  │   Workspace  │──│   Block      │──│    Preview       │   │
│  │   (Blocks)   │  │   (Text)     │  │    (Sandpack)    │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘   │
└─────────┼─────────────────┼──────────────────────────────────┘
          │                 │
          ▼                 ▼
┌──────────────────────────────────────────────────────────────┐
│                      AI ORCHESTRATION                         │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Input Parser: Detect Magic Blocks vs Standard       │    │
│  │                                                      │    │
│  │  IF standard: Direct compilation                     │    │
│  │  IF magic:   → Codestral (Creative Interpretation)   │    │
│  │              → Context Injector (Add variables)      │    │
│  │              → Library Detector (Matter.js? p5.sound?)│   │
│  │              → Code Merger (Integrate with existing) │    │
│  └──────────────────────────────────────────────────────┘    │
│                              │                                │
│                              ▼                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Refiner Agent: Optimize + Add error handling        │    │
│  └──────────────────────────────────────────────────────┘    │
│                              │                                │
│                              ▼                                │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Self-Healing: Try → Catch → Fix with explanation    │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      EXECUTION                                │
│  Sandpack with auto-injected CDN libraries                   │
│  (Matter.js, p5.sound, etc. based on AI detection)           │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 State Management (Enhanced)

```typescript
interface AppState {
  // Block Editor
  workspaceJSON: object | null;
  hasMagicBlock: boolean;  // NEW
  
  // AI Pipeline
  generatedCode: string | null;
  isGenerating: boolean;
  generationPhase: 'idle' | 'interpreting' | 'coding' | 'optimizing' | 'healing';
  magicBlockContexts: MagicContext[];  // NEW
  
  // Libraries
  injectedLibraries: string[];  // NEW: ['matter-js', 'p5.sound']
  
  // Self-Healing
  lastError: string | null;
  appliedFix: string | null;  // Explanation of AI fix
  
  // UI
  isMagicBlockAnimating: boolean;  // NEW
}

interface MagicContext {
  blockId: string;
  userPrompt: string;
  generatedCode: string;
  usedVariables: string[];
  injectedLibraries: string[];
}
```

---

## 5. API Specifications

### 5.1 Enhanced Generation Endpoint

#### POST /api/generate
**Request:**
```json
{
  "blocks": {
    "workspace": { /* Blockly JSON */ },
    "magicBlocks": [
      {
        "id": "magic_1",
        "prompt": "make it explode with sparkles",
        "context": {
          "attachedTo": "sprite_ball",
          "trigger": "onClick"
        }
      }
    ],
    "context": {
      "variables": ["ball", "score"],
      "existingLibraries": ["p5"]
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "code": "<!DOCTYPE html>...",
  "metadata": {
    "generationTime": 1200,
    "magicBlockResults": [
      {
        "id": "magic_1",
        "interpretedAs": "particle explosion effect with sparkle sprites",
        "injectedLibraries": ["p5.sound"],
        "confidence": 0.94
      }
    ],
    "selfHealingApplied": false
  }
}
```

### 5.2 Self-Healing Endpoint

#### POST /api/heal
**Request:**
```json
{
  "error": "ReferenceError: ball is not defined",
  "currentCode": "...",
  "blocks": { /* Original blocks */ }
}
```

**Response:**
```json
{
  "healed": true,
  "fixedCode": "...",
  "explanation": "I noticed you tried to move 'ball' before creating it. I moved the creation to the top!",
  "explanationKorean": "공을 만들기 전에 움직이려고 해서, 공을 먼저 만들게 고쳤어요!"
}
```

---

## 6. Vibe Coding Prompts (Updated)

### Prompt 1: Magic Block Component
```
"Create a Blockly custom block called 'magic_block' with a text input field. 
The block should have a purple gradient, glowing animation, and accept any text. 
When the workspace changes, detect if this block exists and extract the text value."
```

### Prompt 2: Natural Language Interpreter
```
"Create a function that takes a magic block string (e.g., 'make it rain fire') 
and sends it to Codestral with context about existing sprites. 
The AI should return p5.js code implementing the effect, using existing variables."
```

### Prompt 3: Self-Healing Integration
```
"Add error handling to the Sandpack component. If runtime error occurs, 
send the error + current blocks to /api/heal. Display the AI's explanation 
in a toast notification, then reload with fixed code."
```

### Prompt 4: Cyberpunk Theme
```
"Override Blockly's default CSS with a cyberpunk theme: dark background (#0a0a0f), 
neon cyan borders (#00f0ff), glowing effects on active blocks. 
Make the Magic Block pulse with pink/cyan gradient."
```

### Prompt 5: Library Auto-Injector
```
"Scan generated code for keywords like 'Matter' or 'loadSound'. 
If found, inject the corresponding CDN script tag into the Sandpack template 
before the user's code runs."
```

---

## 7. Demo Scenarios (AI Native Focus)

### Scenario A: The Magic Spaceship (Primary)
**Blocks:**
1. Character: 🚀 Spaceship
2. Event: When [Arrow Keys] pressed
3. Movement: Move [direction]
4. **✨ Magic Block:** "leave a rainbow trail that fades slowly"

**AI Actions:**
- Detects "rainbow trail" → Generates particle array with HSB color cycling
- Detects "fades slowly" → Implements alpha decay (opacity -= 2)
- Injects p5.js color mode switch to HSB

**Result:** Spaceship moves with beautiful fading rainbow exhaust

### Scenario B: Self-Healing Demo (Wow Factor)
**Setup:** User intentionally places "Jump" block before "Create Character"
**AI Response:**
- Runtime error caught
- Toast appears: *"Oops! You tried to jump before creating the character. I fixed it for you!"*
- Code auto-corrected: Character creation moved to setup()
**Result:** App works, user learns ordering concept

### Scenario C: Physics Magic (Complex Library)
**Blocks:**
1. Character: 🏀 Ball
2. **✨ Magic Block:** "bounce like a real basketball with spin"

**AI Actions:**
- Detects "real basketball" → Injects Matter.js from CDN
- Sets restitution: 0.82 (NBA standard)
- Adds angular velocity on bounce
- Implements air friction for realism

**Result:** 50 lines of complex physics code generated from one sentence

---

## 8. Success Criteria (Updated)

### MVP (Must Demo)
- [ ] Standard blocks work (move, event, physics)
- [ ] **Magic Block accepts text and generates creative code**
- [ ] **AI injects complex libraries automatically (show Matter.js in code view)**
- [ ] **Self-healing fixes at least one error type**
- [ ] Cyberpunk UI distinguishes from Scratch

### Differentiator Proof
When judge asks *"Why not just use Scratch?"*:
> "Scratch gives you 'Move 10 steps'. We give you **'Make it dance like a jellyfish'**—and the AI writes the sine-wave animation with tentacle physics. That's only possible with Codestral."

---

## 9. Risk Mitigation (AI Native Edition)

| Risk | Mitigation |
|---|---|
| Magic Block generates nonsense | Confidence threshold: <0.7 shows "Try describing differently" |
| Library injection fails | Fallback: Embed all common libraries (Matter.js, p5.sound) in template |
| Self-healing loop | Max 3 attempts, then show "Ask a mentor" |
| API latency ruins demo | Pre-generate 3 magic examples, swap if >5s |

---

## 10. Final Architecture Diagram

```
┌─────────────────────────────────────────┐
│  USER                                   │
│  ┌─────────┐    ┌─────────────────┐    │
│  │ Blocks  │    │  ✨ Magic Block │    │
│  │(Visual) │    │  (Natural Lang) │    │
│  └────┬────┘    └────────┬────────┘    │
│       │                    │            │
│       └────────┬───────────┘            │
│                ▼                        │
│  ┌─────────────────────────────────┐    │
│  │  MISTRAL CODESTRAL              │    │
│  │  ├─ Interpreter (Intent)        │    │
│  │  ├─ Generator (Code)            │    │
│  │  ├─ Library Injector            │    │
│  │  └─ Refiner (Optimize)          │    │
│  └─────────────────────────────────┘    │
│                │                        │
│       ┌────────┴────────┐               │
│       ▼                 ▼               │
│  ┌─────────┐      ┌──────────┐          │
│  │ Standard│      │  Magic   │          │
│  │  Code   │      │  Code    │          │
│  └────┬────┘      └────┬─────┘          │
│       └────────┬───────┘                │
│                ▼                        │
│  ┌─────────────────────────────────┐    │
│  │  Self-Healing (Error → Fix)     │    │
│  └─────────────────────────────────┘    │
│                │                        │
│                ▼                        │
│  ┌─────────────────────────────────┐    │
│  │  Sandpack + Auto Libraries      │    │
│  │  (Matter.js, p5.sound, etc.)    │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

