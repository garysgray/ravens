// ─── Raven Configuration ──────────────────────────────────────────────────────
const RAVEN_CONFIG = 
{
  layers: 
  [
    {
      sizeBase: 1.2,
      sizeVar: 0.8,
      speedBase: 0.35,
      speedVar: 0.15,
      yRange: [0.08, 0.52],
      drift: 0.012,
      alphaBase: 0.38,
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

  respawn: { margin: 60, yPadding: 0.08 },
  angle: { base: Math.PI * 0.12, spread: Math.PI * 0.35 },
  velocity: { randomX: 0.03, randomY: 0.015, maxVyFactor: 0.5 },
  motion: { waveSinScale: 0.6, driftXMultiplier: 12, driftYMultiplier: 6, verticalForceFactor: 0.4 },
  spawn: { sideChance: 0.6, leftMarginX: 0.2, midSpanWidth: 0.5, offscreenX: -20 },
  wave: { speedMin: 0.04, speedMax: 0.08 },
  wing: { speedMin: 0.12, speedMax: 0.22, scale: 1.2 },
  alpha: { variation: 0.12 },
  render: { wingUpScale: 2, wingDownScale: 2, bodyHalf: 0.5 },
  fade: { start: 0.35, end: 0.55 },
  
  densityKey: 'sparse',
  flipDirectionFix: false
};

// ─── Raven Entity ─────────────────────────────────────────────────────────────
class Raven extends BaseRenderer 
{
  constructor(W, H, layer, timeId) 
  {
    super();
    this.layer = layer;
    this.reset(W, H, timeId, true);
  }

  setTime(id) 
  {
    const t = CONFIG.time[id];
    if (!t) return;
    this._timeId = id;
    this.rawColors = [t.ravenFar, t.ravenMid, t.ravenClose];
  }

  reset(W, H, timeId, randomize) 
  {
    const ls = RAVEN_CONFIG.layers[this.layer];

    this.size = ls.sizeBase + Math.random() * ls.sizeVar;
    this.speed = ls.speedBase + Math.random() * ls.speedVar;
    this.yRange = ls.yRange;
    this.drift = ls.drift;

    this.x = randomize 
      ? Math.random() * W 
      : (Math.random() < RAVEN_CONFIG.spawn.sideChance ? W * RAVEN_CONFIG.spawn.leftMarginX + Math.random() * W * RAVEN_CONFIG.spawn.midSpanWidth : RAVEN_CONFIG.spawn.offscreenX);

    this.y = (ls.yRange[0] + Math.random() * (ls.yRange[1] - ls.yRange[0])) * H;

    const ang = RAVEN_CONFIG.angle.base + Math.random() * RAVEN_CONFIG.angle.spread;
    this.vx = Math.cos(ang) * this.speed;
    this.vy = Math.sin(ang) * this.speed * RAVEN_CONFIG.motion.verticalForceFactor;

    this.wavePhase = Math.random() * Math.PI * 2;
    this.waveSpeed = RAVEN_CONFIG.wave.speedMin + Math.random() * (RAVEN_CONFIG.wave.speedMax - RAVEN_CONFIG.wave.speedMin);
    this.wingPhase = Math.random() * Math.PI * 2;
    this.wingSpeed = RAVEN_CONFIG.wing.speedMin + Math.random() * (RAVEN_CONFIG.wing.speedMax - RAVEN_CONFIG.wing.speedMin);
    this.alphaVal = ls.alphaBase + (Math.random() - 0.5) * RAVEN_CONFIG.alpha.variation;

    this.setTime(timeId);
  }

  update(W, H, dt) 
  {
    const m = dt * 0.06; // Normalized speed multiplier

    this.wavePhase += this.waveSpeed * m;
    this.wingPhase += this.wingSpeed * m;

    this.x += (this.vx + Math.sin(this.wavePhase * RAVEN_CONFIG.motion.waveSinScale) * this.drift * RAVEN_CONFIG.motion.driftXMultiplier) * m;
    this.y += (this.vy + Math.sin(this.wavePhase) * this.drift * RAVEN_CONFIG.motion.driftYMultiplier) * m;

    this.vx += (Math.random() - 0.5) * RAVEN_CONFIG.velocity.randomX * m;
    this.vy += (Math.random() - 0.5) * RAVEN_CONFIG.velocity.randomY * m;

    const maxVy = this.speed * RAVEN_CONFIG.velocity.maxVyFactor;
    this.vy = Math.max(-maxVy, Math.min(maxVy, this.vy));

    const pad = RAVEN_CONFIG.respawn.yPadding;
    if (this.x > W + RAVEN_CONFIG.respawn.margin || this.x < -RAVEN_CONFIG.respawn.margin || this.y > H * (this.yRange[1] + pad) || this.y < H * (this.yRange[0] - pad)) 
    {
      this.reset(W, H, this._timeId || 'dawn', false);
    }
  }

  draw(ctx) 
  {
    // 1. The 's' (size) is our Master Unit for this specific bird.
    const s = this.size; 
    const wing = Math.sin(this.wingPhase);
    
    // 2. Use 's' for the wing flap scale so it stays proportional to the body
    const wUp = wing * s * (RAVEN_CONFIG.wing.scale || 0.4);

    ctx.save();
    
    // 3. Position and Rotation
    ctx.translate(this.x, this.y);
    
    const angle = Math.atan2(this.vy, this.vx);
    ctx.rotate(RAVEN_CONFIG.flipDirectionFix ? angle + Math.PI : angle);

    // 4. Color/Alpha
    ctx.fillStyle = this._alpha(this.rawColors[this.layer], this.alphaVal);

    // 5. THE FIX: Every vertical measurement now uses 's' 
    // instead of a different height variable.
    
    // Body: Width is 2*s, Height is 1*s (or half based on your config)
    const bodyH = s * (RAVEN_CONFIG.render.bodyHalf || 0.5);
    ctx.fillRect(-s, -bodyH, s * 2, s);

    // Top Wing
    ctx.beginPath();
    ctx.moveTo(-s, 0); 
    ctx.lineTo(0, -s * (RAVEN_CONFIG.render.wingUpScale || 0.6) - wUp); 
    ctx.lineTo(s, 0);
    ctx.fill();

    // Bottom Wing
    ctx.beginPath();
    ctx.moveTo(-s, 0); 
    ctx.lineTo(0, s * (RAVEN_CONFIG.render.wingDownScale || 0.4) + wUp); 
    ctx.lineTo(s, 0);
    ctx.fill();

    ctx.restore();
  }
}

// ─── Raven Layer ──────────────────────────────────────────────────────────────
class RavenLayer extends BaseRenderer 
{
  constructor(canvasId, layerIndex) 
  {
    super();
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.layerIndex = layerIndex;
    this.ravens = [];
    this.timeId = 'dawn';
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _resize() 
  {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setCount(n) 
  {
    if (!this.canvas) return;
    const W = this.canvas.width;
    const H = this.canvas.height;
    while (this.ravens.length < n) this.ravens.push(new Raven(W, H, this.layerIndex, this.timeId));
    if (this.ravens.length > n) this.ravens.splice(n);
  }

  setTime(id) 
  {
    this.timeId = id;
    this.ravens.forEach(r => r.setTime(id));
  }

  update(dt) 
  {
    if (!this.canvas) return;
    this.ravens.forEach(r => r.update(this.canvas.width, this.canvas.height, dt));
  }

  draw() 
  {
    if (!this.ctx) return;
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.ctx.clearRect(0, 0, W, H);

    this.ravens.forEach(r => r.draw(this.ctx));

    // Foreground Fade for Layer 0
    if (this.layerIndex === 0) 
    {
      const fade = this.ctx.createLinearGradient(0, H * RAVEN_CONFIG.fade.start, 0, H * RAVEN_CONFIG.fade.end);
      fade.addColorStop(0, 'transparent');
      fade.addColorStop(1, 'rgba(0,0,0,1)');
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.fillStyle = fade;
      this.ctx.fillRect(0, 0, W, H);
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }
}

// ─── Raven System ─────────────────────────────────────────────────────────────
class RavenSystem extends BaseRenderer 
{
  constructor() 
  {
    super();
    this.layers = 
    [
      new RavenLayer('ravens-far', 0),
      new RavenLayer('ravens-mid', 1),
      new RavenLayer('ravens-close', 2),
    ];
    this.densityId = RAVEN_CONFIG.densityKey;
    this._applyDensity();
  }

  setDensity(id) 
  {
    this.densityId = id;
    this._applyDensity();
  }

  setTime(id) 
  {
    this.layers.forEach(l => l.setTime(id));
  }

  _applyDensity() 
  {
    const d = CONFIG.density[this.densityId];
    if (!d) return;
    this.layers[0].setCount(d.far);
    this.layers[1].setCount(d.mid);
    this.layers[2].setCount(d.close);
  }

  update(dt) 
  {
    this.layers.forEach(l => l.update(dt));
  }

  draw() 
  {
    this.layers.forEach(l => l.draw());
  }
}