# Implementation Plan: Mistral Snap & Build

This plan outlines the 48-hour development roadmap for **Mistral Snap & Build**, focusing on building a functional MVP first and then layering in the "AI-Native" features.

## Phase 1: Foundation (Hours 0-12) - Core Editor & Runner
*Goal: Get a working Blockly editor that runs code in a preview window.*

1. **Project Setup**
   - Initialize Next.js project with TypeScript.
   - Install core dependencies: `blockly`, `@uiw/react-sandpack` (or standard Sandpack), `lucide-react`.
2. **Blockly Workspace (FR-BLOCK-001/002)**
   - Create a basic Blockly component in React.
   - Define standard blocks: Movement, Character (p5.js based).
   - Implement real-time serialization (JSON export).
3. **Execution Environment (FR-RUN-001/002)**
   - Setup Sandpack preview window.
   - Create a compiler that converts Blockly JSON to a executable p5.js script template.
   - Enable Hot Module Replacement (HMR) for instant feedback.

## Phase 2: The "Magic" (Hours 12-24) - AI Integration
*Goal: Connect the Magic Block to the AI and generate code.*

1. **Magic Block Definition (FR-BLOCK-003)**
   - Create the custom "Magic Block" with a text input field.
   - Style it with basic CSS (gradients).
2. **AI Pipeline Setup (FR-AI-001/003)**
   - Set up the API route for Codestral/Mistral.
   - Implement the "Magic Prompt" logic: Send user text + context to the AI.
3. **Code Merging (FR-AI-002)**
   - Logic to stitch together "Standard Block code" and "Magic Block AI-generated code".
   - Inject the merged code into Sandpack.

## Phase 3: Advanced Intelligence (Hours 24-36) - Self-Healing & Libraries
*Goal: Make the AI smarter and more resilient.*

1. **Library Auto-Loader (FR-AI-006 / FR-RUN-004)**
   - AI detection of required libraries (e.g., if code contains "Matter.", inject Matter.js CDN).
2. **Self-Healing Loop (FR-AI-005 / 5.2)**
   - Implement error capture in Sandpack.
   - Send errors back to `/api/heal` for AI correction.
   - Show a "Fixing it for you!" notification.
3. **Context Injection**
   - Improve the AI prompt to include current variables and sprite states for better code accuracy.

## Phase 4: Final Polish (Hours 36-48) - ✅ COMPLETED
*Goal: The "Wow" factor. Cyberpunk vibe and smooth animations.*

1. **Cyberpunk Theme (FR-UI-003)** - ✅ Done
   - Override Blockly CSS for neon borders and dark backgrounds.
   - Add glassmorphism to the sidebar and panels.
2. **AI Status & Transitions (FR-UI-002/005)** - ✅ Done
   - Pulsing animations for the Magic Block during generation.
   - AI status bar showing "AI Neural Processing..." with scanline.
3. **Resizable Layout / Code View (FR-UI-004)** - ✅ Done
   - Split-pane layout with `react-resizable-panels`.
   - Advanced "Live Engine Code" panel.

---

## Next Steps
See [remaining_tasks.md](file:///c:/Projects/hack/remaining_tasks.md) for the final demo refinement list.
