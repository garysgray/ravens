// ─── Raven Configuration ──────────────────────────────────────────────────────
const RAVEN_CONFIG = 
{
  // Per-layer behavior (far → close birds)
  layers: 
  [
    {
      sizeBase: 1.2,     // base size of bird
      sizeVar: 0.8,      // random size variation
      speedBase: 0.35,   // base movement speed
      speedVar: 0.15,    // random speed variation
      yRange: [0.08, 0.52], // vertical spawn range (0–1 screen)
      drift: 0.012,      // how much wave drift affects movement
      alphaBase: 0.38,   // base opacity for this layer
    },
    {
      sizeBase: 2.4,
      sizeVar: 1.2,
      speedBase: 0.65,
      speedVar: 0.25,
      yRange: [0.15, 0.62],
      drift: 0.020,
      alphaBase: 0.72,
    },
    {
      sizeBase: 4.5,
      sizeVar: 2.5,
      speedBase: 1.10,
      speedVar: 0.50,
      yRange: [0.22, 0.68],
      drift: 0.032,
      alphaBase: 0.92,
    }
  ],

  // When ravens leave screen → respawn
  respawn: { 
    margin: 60,     // offscreen buffer
    yPadding: 0.08  // vertical tolerance before reset
  },

  // Initial flight angle randomness
  angle: { 
    base: Math.PI * 0.12, 
    spread: Math.PI * 0.35 
  },

  // Random velocity jitter each frame
  velocity: { 
    randomX: 0.03, 
    randomY: 0.015, 
    maxVyFactor: 0.5 // clamps vertical speed
  },

  // Motion shaping (wave + drift)
  motion: { 
    waveSinScale: 0.6, 
    driftXMultiplier: 12, 
    driftYMultiplier: 6, 
    verticalForceFactor: 0.4 
  },

  // Spawn positioning logic
  spawn: { 
    sideChance: 0.6,      // chance to spawn inside vs offscreen
    leftMarginX: 0.2,     // left spawn area
    midSpanWidth: 0.5,    // width of spawn band
    offscreenX: -20       // spawn outside screen
  },

  // Wave motion speed
  wave: { 
    speedMin: 0.04, 
    speedMax: 0.08 
  },

  // Wing flapping animation
  wing: { 
    speedMin: 0.12, 
    speedMax: 0.22, 
    scale: 1.2 // strength of wing movement
  },

  // Alpha randomness
  alpha: { 
    variation: 0.12 
  },

  // Shape proportions
  render: { 
    wingUpScale: 2, 
    wingDownScale: 2, 
    bodyHalf: 0.5 
  },

  // Fade overlay (foreground only)
  fade: { 
    start: 0.35, 
    end: 0.55 
  },
  
  densityKey: 'sparse',   // which density preset to use
  flipDirectionFix: false // optional flip for direction
};
// ─── Raven Entity ─────────────────────────────────────────────────────────────
// Represents a single raven instance in the simulation
class Raven extends BaseRenderer 
{
  constructor(W, H, layer, timeId) 
  {
    super(); // initialize BaseRenderer
    this.layer = layer; // which depth layer (far/mid/close)
    this.reset(W, H, timeId, true); // spawn initial state
  }

  // Updates color palette based on current time-of-day theme
  setTime(id) 
  {
    const t = CONFIG.time[id];
    if (!t) return;
    this._timeId   = id;
    this.rawColors = [t.ravenFar, t.ravenMid, t.ravenClose];

    // pre-parse colors for _alpha
    this._parsedColors = this.rawColors.map(hex => 
    {
      if (!hex || hex[0] !== '#') return null;
      return {
        r: parseInt(hex.slice(1,3), 16),
        g: parseInt(hex.slice(3,5), 16),
        b: parseInt(hex.slice(5,7), 16)
      };
    });
  }

  // Resets raven position, motion, and animation state
  reset(W, H, timeId, randomize) 
  {
    const ls = RAVEN_CONFIG.layers[this.layer]; // layer settings

    // size and speed are randomized per bird
    this.size = ls.sizeBase + Math.random() * ls.sizeVar;
    this.speed = ls.speedBase + Math.random() * ls.speedVar;

    this.yRange = ls.yRange; // vertical spawn bounds
    this.drift = ls.drift;   // wave drift strength

    // X spawn logic:
    // either fully random OR controlled spawn band / offscreen spawn
    this.x = randomize 
      ? Math.random() * W 
      : (Math.random() < RAVEN_CONFIG.spawn.sideChance 
          ? W * RAVEN_CONFIG.spawn.leftMarginX + Math.random() * W * RAVEN_CONFIG.spawn.midSpanWidth 
          : RAVEN_CONFIG.spawn.offscreenX);

    // Y spawn within layer-defined range
    this.y = (ls.yRange[0] + Math.random() * (ls.yRange[1] - ls.yRange[0])) * H;

    // initial movement angle with randomness
    const ang = RAVEN_CONFIG.angle.base + Math.random() * RAVEN_CONFIG.angle.spread;

    // velocity derived from angle + speed
    this.vx = Math.cos(ang) * this.speed;
    this.vy = Math.sin(ang) * this.speed * RAVEN_CONFIG.motion.verticalForceFactor;

    // animation phases (wave + wing)
    this.wavePhase = Math.random() * Math.PI * 2;
    this.waveSpeed = RAVEN_CONFIG.wave.speedMin + Math.random() * (RAVEN_CONFIG.wave.speedMax - RAVEN_CONFIG.wave.speedMin);

    this.wingPhase = Math.random() * Math.PI * 2;
    this.wingSpeed = RAVEN_CONFIG.wing.speedMin + Math.random() * (RAVEN_CONFIG.wing.speedMax - RAVEN_CONFIG.wing.speedMin);

    // opacity variation per bird
    this.alphaVal = ls.alphaBase + (Math.random() - 0.5) * RAVEN_CONFIG.alpha.variation;

    this.setTime(timeId); // apply theme colors
  }

  // Updates physics + animation each frame
  update(W, H, dt) 
  {
    const m = dt * 0.06; // time normalization factor

    // advance animation phases
    this.wavePhase += this.waveSpeed * m;
    this.wingPhase += this.wingSpeed * m;

    // movement with wave distortion
    this.x += (this.vx + Math.sin(this.wavePhase * RAVEN_CONFIG.motion.waveSinScale) * this.drift * RAVEN_CONFIG.motion.driftXMultiplier) * m;
    this.y += (this.vy + Math.sin(this.wavePhase) * this.drift * RAVEN_CONFIG.motion.driftYMultiplier) * m;

    // random jitter for natural movement
    this.vx += (Math.random() - 0.5) * RAVEN_CONFIG.velocity.randomX * m;
    this.vy += (Math.random() - 0.5) * RAVEN_CONFIG.velocity.randomY * m;

    // clamp vertical velocity
    const maxVy = this.speed * RAVEN_CONFIG.velocity.maxVyFactor;
    this.vy = Math.max(-maxVy, Math.min(maxVy, this.vy));

    // respawn logic when out of bounds
    const pad = RAVEN_CONFIG.respawn.yPadding;

    if (
      this.x > W + RAVEN_CONFIG.respawn.margin ||
      this.x < -RAVEN_CONFIG.respawn.margin ||
      this.y > H * (this.yRange[1] + pad) ||
      this.y < H * (this.yRange[0] - pad)
    ) 
    {
      this.reset(W, H, this._timeId || 'dawn', false);
    }
  }

  // Renders raven to canvas
  draw(ctx) 
  {
    // size is master scale unit for entire bird
    const s = this.size; 

    const wing = Math.sin(this.wingPhase); // wing oscillation

    // wing motion scaled by size
    const wUp = wing * s * (RAVEN_CONFIG.wing.scale || 0.4);

    ctx.save();

    // position bird
    ctx.translate(this.x, this.y);

    // rotate based on velocity direction
    const angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(RAVEN_CONFIG.flipDirectionFix ? angle + Math.PI : angle);

    // set color with alpha blending
    const pc = this._parsedColors?.[this.layer];
    ctx.fillStyle = pc 
      ? `rgba(${pc.r},${pc.g},${pc.b},${this.alphaVal})`
      : this._alpha(this.rawColors[this.layer], this.alphaVal);

    // body shape
    const bodyH = s * (RAVEN_CONFIG.render.bodyHalf || 0.5);
    ctx.fillRect(-s, -bodyH, s * 2, s);

    // top + bottom wings in one path
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(0, -s * (RAVEN_CONFIG.render.wingUpScale || 0.6) - wUp);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s * (RAVEN_CONFIG.render.wingDownScale || 0.4) + wUp);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
// ─── Raven Layer ──────────────────────────────────────────────────────────────
// Manages a collection of Ravens on a single canvas layer.
// Handles creation, resizing, updating, rendering, and time-of-day syncing.
class RavenLayer extends BaseRenderer 
{
  constructor(canvasId, layerIndex) 
  {
    super();

    // Canvas setup
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // Which visual layer this belongs to (affects raven behavior/appearance)
    this.layerIndex = layerIndex;

    // Active raven instances in this layer
    this.ravens = [];

    // Current time-of-day state used for coloring
    this.timeId = 'dawn';

    // Initial sizing
    this._resize();

    // Keep canvas synced to window size
    window.addEventListener('resize', () => this._resize());
  }

  // Resize canvas to match window
 _resize() 
  {
    if (!this.canvas) return;
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this._buildFadeGrad();
  }

  _buildFadeGrad()
  {
    if (!this.ctx) return;
    const H    = this.canvas.height;
    const fade = this.ctx.createLinearGradient(
      0, H * RAVEN_CONFIG.fade.start,
      0, H * RAVEN_CONFIG.fade.end
    );
    fade.addColorStop(0, 'transparent');
    fade.addColorStop(1, 'rgba(0,0,0,1)');
    this._fadeGrad = fade;
  }

  // Ensure correct number of ravens exist in this layer
  setCount(n) 
  {
    if (!this.canvas) return;

    const W = this.canvas.width;
    const H = this.canvas.height;

    // Add ravens until we reach target count
    while (this.ravens.length < n)
      this.ravens.push(new Raven(W, H, this.layerIndex, this.timeId));

    // Remove extra ravens if over target count
    if (this.ravens.length > n)
      this.ravens.splice(n);
  }

  // Update time-of-day and propagate to all ravens
  setTime(id) 
  {
    this.timeId = id;

    // Update each raven's color palette
    this.ravens.forEach(r => r.setTime(id));
  }

  // Update simulation step
  update(dt) 
  {
    if (!this.canvas) return;

    const W = this.canvas.width;
    const H = this.canvas.height;

    // Update each raven's physics/animation
    this.ravens.forEach(r => r.update(W, H, dt));
  }

  // Render layer
  draw() 
  {
    if (!this.ctx) return;

    const W = this.canvas.width;
    const H = this.canvas.height;

    // Clear previous frame
    this.ctx.clearRect(0, 0, W, H);

    // Draw all ravens
    this.ravens.forEach(r => r.draw(this.ctx));

    // ─── Foreground fade effect (only for layer 0) ───
    if (this.layerIndex === 0 && this._fadeGrad) 
    {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = this._fadeGrad;
      this.ctx.fillRect(0, 0, W, H);
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }
}

// ─── Raven System ─────────────────────────────────────────────────────────────
// Top-level manager for all raven layers.
// Responsible for density control, time-of-day syncing, and per-frame updates.
class RavenSystem extends BaseRenderer 
{
  constructor() 
  {
    super();

    // Three visual depth layers:
    // 0 = far, 1 = mid, 2 = close
    this.layers = 
    [
      new RavenLayer('ravens-far', 0),
      new RavenLayer('ravens-mid', 1),
      new RavenLayer('ravens-close', 2),
    ];

    // Current density preset key (maps to CONFIG.density)
    this.densityId = RAVEN_CONFIG.densityKey;

    // Apply initial density setup
    this._applyDensity();
  }

  // Switch density preset (changes number of ravens per layer)
  setDensity(id) 
  {
    this.densityId = id;
    this._applyDensity();
  }

  // Propagate time-of-day changes to all layers
  setTime(id) 
  {
    this.layers.forEach(l => l.setTime(id));
  }

  // Apply density config to each layer
  _applyDensity() 
  {
    const d = CONFIG.density[this.densityId];
    if (!d) return;

    // Assign per-layer counts (far/mid/close)
    this.layers[0].setCount(d.far);
    this.layers[1].setCount(d.mid);
    this.layers[2].setCount(d.close);
  }

  // Update all layers (physics + animation)
  update(dt) 
  {
    this.layers.forEach(l => l.update(dt));
  }

  // Render all layers in order
  draw() 
  {
    this.layers.forEach(l => l.draw());
  }
}