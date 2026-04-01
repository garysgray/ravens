// ─── FIXED TIMESTEP GAME LOOP ────────────────────────────────────────────────
// Uses a fixed timestep simulation for consistent updates regardless of FPS
// - update runs at 60Hz fixed step
// - draw runs every frame
// - accumulator prevents frame spikes from breaking simulation

const FIXED_TIMESTEP = 1000 / 60; // ~16.66ms per update step (60 FPS)
const MAX_FRAME_TIME = 250;       // Clamp large frame spikes (e.g. tab switch)
const MAX_STEPS = 5;              // Prevent spiral of death (too many updates)

let controller;
let lastTime = performance.now();
let accumulator = 0;

// ─── INIT ────────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  try {
    controller = new Controller();

    // Initial state setup
    controller.start('sparse', 'dawn');

    requestAnimationFrame(gameLoop);
  } catch (e) {
    console.error('Init failed:', e);
  }
});

// ─── MAIN LOOP ───────────────────────────────────────────────────────────────
function gameLoop(now) 
{
  // Delta time in milliseconds (no conversion to seconds)
  const frameTime = Math.min(now - lastTime, MAX_FRAME_TIME);

  lastTime = now;
  accumulator += frameTime;

  let steps = 0;

  // Fixed-step update loop
  while (accumulator >= FIXED_TIMESTEP && steps < MAX_STEPS) 
  {
    controller.update(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
    steps++;
  }

  // Safety: prevent runaway accumulation after extreme lag
  if (steps >= MAX_STEPS) accumulator = 0;

  // Always render once per frame
  controller.draw();

  requestAnimationFrame(gameLoop);
}