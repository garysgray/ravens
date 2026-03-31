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


/**
   * Draws a single-path raven based on the rrrrrr.png silhouette.
   * No separate circles/ellipses.
   */
  // _drawBird(ctx, t, tree, pos) 
  // {
  //   const K = TREE_CONST;
  //   const s = this.cfg.RAVEN_SZ * K.BIRD_SIZE_SCALE;
  //   const side = K.BIRD_DIR_OVERRIDE !== null ? K.BIRD_DIR_OVERRIDE : (tree.seed % 2 === 0 ? 1 : -1);
    
  //   const bx = tree.x + (tree.h * K.BIRD_OFFSET_X * side);
  //   const by = tree.y - (tree.h * pos) + Math.sin(this.time * K.BIRD_BOB_FREQ + tree.seed) * K.BIRD_BOB_AMP;

  //   ctx.save();
  //   ctx.translate(bx, by);
  //   ctx.scale(side, 1);
  //   ctx.fillStyle = t.ravenClose || '#000';

  //   ctx.beginPath();
  //   // Beak tip
  //   ctx.moveTo(s * 1.5, -s * 0.2); 
  //   // Top of head
  //   ctx.quadraticCurveTo(s * 0.8, -s * 0.8, 0, -s * 0.6);
  //   // Back
  //   ctx.quadraticCurveTo(-s * 0.5, -s * 0.2, -s * 0.8, s * 0.5);
  //   // Tail
  //   ctx.lineTo(-s * 1.2, s * 2.5);
  //   ctx.lineTo(-s * 0.5, s * 2.5);
  //   // Belly
  //   ctx.quadraticCurveTo(s * 0.5, s * 1.5, s * 0.8, s * 0.2);
  //   // Under beak
  //   ctx.lineTo(s * 1.5, -s * 0.2);
    
  //   ctx.fill();
  //   ctx.restore();
  // }