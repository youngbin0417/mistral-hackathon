# Remaining Tasks: Mistral Snap & Build

The core foundation and "AI-Native" features (Magic Block, Self-Healing, Cyberpunk UI) are successfully implemented. The following tasks remain to move from "Working Prototype" to "Production Grade Demo".

## 1. AI Intelligence Refinement (P1)
- [ ] **Agent Chain (Generator -> Refiner)**:
    - Update `/api/generate` to use a two-step process: First generate the logic, then a second Mistral call to "polish" and add comments/error guards.
- [ ] **Advanced Library Detection**:
    - Expand detection to include `p5.sound` (detecting "noise", "sound", "music") and `p5.dom`.
    - Ensure `esm.sh` imports are correctly prepended for all detected libs.

## 2. UI/UX & Feedback (P1)
- [ ] **AI Phase Indicator**:
    - Update the status bar to show actual phases: `INTERPRETING INTENT...` -> `WRITING CODE...` -> `OPTIMIZING...`.
- [ ] **Code View Enhancements**:
    - Implement a dedicated "Full Screen Code View" modal using a syntax highighter (like `Prism.js`).
- [ ] **Magic Block Glow Sticking**:
    - Ensure the `.magic-block-glow` class persists or animates more dynamically when the specific block is "Active".

## 3. Demo Scenario Verification (P0)
- [ ] **Scenario A: Rainbow Trail**: 
    - Test "leave a rainbow trail" prompt to ensure p5.js integration works with `window.entities`.
- [ ] **Scenario B: Physics Leap**:
    - Test "bounce like a basketball" to ensure `Matter.js` is injected and applied to a sprite created via blocks.
- [ ] **Scenario C: Event Handling**:
    - Verify that `When Clicked` standard block correctly triggers AI-generated effects inside sprites.

## 4. Stability & Polish (P2)
- [ ] **Acorn Validation**:
    - Add a lightweight JS syntax check on the backend before returning code to prevent obvious syntax errors.
- [ ] **Responsive Resizing**:
    - Fine-tune the `react-resizable-panels` behavior for very small screens (mobile tablets).

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
