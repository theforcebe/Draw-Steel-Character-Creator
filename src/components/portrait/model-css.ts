// CSS animations and styles for the enhanced character model system
// Ported from New Armor - Models - Enhanced.html

export const ENHANCED_MODEL_CSS = `
@keyframes soulPulse {
  0%,100% { opacity:0.7; }
  50% { opacity:1; }
}
@keyframes armorGlow {
  0%,100% { filter: drop-shadow(0 0 4px rgba(201,168,76,0.3)); }
  50% { filter: drop-shadow(0 0 12px rgba(201,168,76,0.6)); }
}
@keyframes revGlow {
  0%,100% { filter: drop-shadow(0 0 4px rgba(127,255,212,0.3)); }
  50% { filter: drop-shadow(0 0 14px rgba(127,255,212,0.6)); }
}
@keyframes float {
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-4px); }
}
@keyframes rune {
  0%,100%{ opacity:0.3; }
  50%{ opacity:1; }
}
@keyframes emberDrift {
  0%{ transform: translateY(0) translateX(0); opacity:0.8; }
  100%{ transform: translateY(-20px) translateX(5px); opacity:0; }
}
@keyframes ghostFloat {
  0%,100%{ transform: translateY(0); }
  50%{ transform: translateY(-3px); }
}

.character-model { display: flex; align-items: center; justify-content: center; }
.character-model svg { max-width: 100%; max-height: 100%; }
.living-svg { }
.rev-svg { animation: ghostFloat 3s ease-in-out infinite; }
.high-lv { }
`;

let cssInjected = false;

export function ensureEnhancedModelCss(): void {
  if (cssInjected) return;
  const style = document.createElement('style');
  style.textContent = ENHANCED_MODEL_CSS;
  document.head.appendChild(style);
  cssInjected = true;
}
