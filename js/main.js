// 1. Change these to Milliseconds
const FIXED_TIMESTEP = 1000 / 60; // ~16.66ms
const MAX_FRAME_TIME = 250;       // 250ms
const MAX_STEPS = 5;

let controller;
let lastTime = performance.now();
let accumulator = 0;

window.addEventListener('load', () => {
  try {
    controller = new Controller();
    controller.start('sparse', 'dawn');
    requestAnimationFrame(gameLoop);
  } catch (e) {
    console.error('Init failed:', e);
  }
});

function gameLoop(now) { // Use the 'now' passed by rAF
  // 2. Remove the "/ 1000" - keep it in ms
  const frameTime = Math.min(now - lastTime, MAX_FRAME_TIME);
  lastTime = now;
  accumulator += frameTime;

  let steps = 0;
  while (accumulator >= FIXED_TIMESTEP && steps < MAX_STEPS) {
    // 3. Pass the ms value (16.66)
    controller.update(FIXED_TIMESTEP); 
    accumulator -= FIXED_TIMESTEP;
    steps++;
  }

  if (steps >= MAX_STEPS) accumulator = 0;

  controller.draw();
  requestAnimationFrame(gameLoop);
}
