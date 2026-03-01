# Remaining Tasks: Mistral Snap & Build

## 1. AI Intelligence Refinement (P1)
- [x] **Agent Chain (Generator -> Refiner)**: ✅ Complete
    - Update `/api/generate` to use a two-step process: First generate the logic, then a second Mistral call to "polish" and add comments/error guards.
- [x] **Advanced Library Detection**: ✅ Complete
    - Expand detection to include `p5.sound` and `p5.dom`.

## 2. Infrastructure & Scale (P1)
- [x] **Redis Deployment (Production)**: ✅ Complete
    - Setup managed Upstash Redis for global consistency.
- [x] **Grafana Dashboards**: ✅ Complete
    - Create custom dashboard JSON for tracking Mistral token usage and error rates.

## 3. Demo Scenario Verification (P0)
- [x] **Scenario A: Rainbow Trail**: ✅ Verified
- [x] **Scenario B: Physics Leap**: ✅ Verified
- [x] **Scenario C: Event Handling**: ✅ Verified

## 4. 🎙️ ElevenLabs Voice Blocks (New Proposal)
- [x] **Speak Block**: ElevenLabs TTS API integration & text-to-speech bubble synchronization.
- [x] **Voice Style Block**: Dynamic ElevenLabs `voice_id` switching based on character logic.
- [x] **React with Voice / NPC Dialog**: Event trigger to TTS generation via Mistral.

## 5. 🎵 AI Audio Engine Blocks (New Proposal)
- [x] **Magic BGM Block**: ElevenLabs SFX API to generate background music.
- [x] **Adaptive Sound / SFX Generator**: ElevenLabs SFX API for logic-based sound effects.

## 6. 🧠 Meta-Programming Blocks (New Proposal)
- [ ] **Debug Explain**: Auto-catch Sandpack errors, explain via Mistral, and output via ElevenLabs.
- [ ] **Remix Code / Add Feature**: Direct source code modification via Codestral diff.

---

## Progress Checklist
| Feature | Status |
|---|---|
| Cyberpunk Theme | ✅ Complete |
| Magic Block (AI) | ✅ Complete |
| Context-Aware Prompting | ✅ Complete |
| Resizable Panels | ✅ Complete |
| Robust Iframe Preview | ✅ Complete |
| Self-Healing (Basic) | ✅ Complete |
| Neural Scanline Animation | ✅ Complete |
| AI Monitoring (Loki/Grafana) | ✅ Complete |
| High-Speed Cache (Redis) | ✅ Complete |
| Unit Test (100% Core Coverage) | ✅ Complete |
| Blockly Toolbox Removal | ✅ Complete |
| UI Stability & Dark Mode Fixes | ✅ Complete |
| Redis Log Integration | ✅ Complete |
| Event Blocks (When Clicked, Always) | ✅ Complete |
