// ─── Raven Constants ─────────────────────────────────────────────────────────
const RAVEN_CONST =
{

  // Spawn / movement
  spawn:
  {
    yMin: 0.2,
    yRange: 0.45,
    offscreenMult: 6,
    spawnOffset: 4,
  },

  // Wing animation
  wing:
  {
    speedMin: 0.004,
    speedRange: 0.008,
  },

  // Visual randomness
  visual:
  {
    alphaMin: 0.72,
    alphaRange: 0.25,
    depthMin: 0.4,
    depthRange: 0.6,
  },

  // Shape (normalized to size)
  // Shape (normalized to size)
  body:
  {
    noseX: -2.8,
    midTopY: -0.4,
    midBotY:  0.8,
    tailX:  2.4,
  },

  head:
  {
    x: -2.2,
    y: -0.1,  
    rx: 0.70,
    ry: 0.50,
    rot: 0,   
  },

  // FIX: Redefined beak coordinates for a curved, hooked shape
  beak:
  {
    x1: -2.6, // Base top (where it meets the head)
    y1: -0.3, // Higher base start for a thicker look
    
    x2: -3.8, // Pushed further out for length (was -3.3)
    y2:  0.1, // Dropped down for the hook effect (was -0.1)
    
    ctrlX: -3.3, // Control point to pull the curve up before dropping to the hook
    ctrlY: -0.4,
    
    x3: -2.3, // Base bottom
    y3:  0.2, // Lower base end to make the beak thick at the throat
  },

  // Add these to RAVEN_CONST
  wingShape: {
    shoulderX: -1.1,
    shoulderY: -0.2,
    tipX: 1.4,   // Pushed out for longer primary feathers
    baseX: -0.4,
    baseY: 0.3,
  },

  tail: {
    x: 2.4,      // Start of tail
    length: 1.2, // How far it extends
    width: 0.8,  // Spread of the fan
    count: 5,    // Number of tail feathers/notches
  },

  feathers: {
    wingCount: 17, // Number of trailing edge feathers
    spread: 0.6,  // How "ragged" the wing looks
  }

  
};

// ─── RavenSideRenderer ───────────────────────────────────────────────────────
class RavenSideRenderer extends BaseRenderer
{
  constructor()
  {
    super({
      posY: 0.4,
      scale: 1.0,
      count: 6,
      minSpeed: 0.8,
      maxSpeed: 2.2,
      minSize: 8,
      maxSize: 22,
      wingStrength: 1.6, 
      waveDrift: 18,
      waveSpeed: 0.012,
    });

    this.ravens = [];
    this.time = 'dawn';
    this.initialized = false;
  }

  setTime(id) { this.time = id; }

  _initRavens(W, H)
  {
    for (let i = 0; i < this.cfg.count; i++)
    {
      this.ravens.push(this._createRaven(W, H, true));
    }
    this.initialized = true;
  }

  _createRaven(W, H, randomX)
  {
    const c = this.cfg;
    const K = RAVEN_CONST;
    const goingRight = Math.random() < 0.5;
    const size  = c.minSize  + Math.random() * (c.maxSize  - c.minSize);
    const speed = c.minSpeed + Math.random() * (c.maxSpeed - c.minSpeed);
    const baseY = (K.spawn.yMin + Math.random() * K.spawn.yRange) * H;

    return {
      x: randomX
        ? Math.random() * W
        : (goingRight ? -size * K.spawn.spawnOffset : W + size * K.spawn.spawnOffset),
      y: baseY,
      baseY: baseY,
      vx: goingRight ? speed : -speed,
      size,
      goingRight,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: K.wing.speedMin + Math.random() * K.wing.speedRange,
      wavePhase: Math.random() * Math.PI * 2,
      alpha: K.visual.alphaMin + Math.random() * K.visual.alphaRange,
      depth: K.visual.depthMin + Math.random() * K.visual.depthRange,
    };
  }

  // NEW: Update logic moved out of draw
  update(dt)
  {
    if (!dt) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    
    if (!this.initialized) this._initRavens(W, H);

    // Standard multiplier for ~60fps feel
    const m = dt * 0.06;
    const c = this.cfg;
    const K = RAVEN_CONST;

    this.ravens.forEach((r, i) =>
    {
      // Apply movement scaled by DT
      r.x += r.vx * m;
      r.wingPhase += r.wingSpeed * m * 16.6; // Multiplied to keep original small constant feel
      r.wavePhase += c.waveSpeed * m;

      r.y = r.baseY + Math.sin(r.wavePhase) * c.waveDrift;

      // Respawn logic
      if (
        (r.vx > 0 && r.x > W + r.size * K.spawn.offscreenMult) ||
        (r.vx < 0 && r.x < -r.size * K.spawn.offscreenMult)
      )
      {
        this.ravens[i] = this._createRaven(W, H, false);
      }
    });
  }

  draw(ctx, W, H, t)
  {
    // 1. Safety check - if t (theme) is missing, don't draw
    if (!t || !this.initialized) return;

    this.ravens.forEach((r) =>
    {
      ctx.save();
      
      // 2. Alpha/Depth
      ctx.globalAlpha = r.alpha * r.depth;

      // 3. POSITION: Use r.x and r.y exactly as they are updated in your loop
      // Don't multiply them by W or H here if they are already pixels
      ctx.translate(r.x, r.y);

      // 4. DIRECTION
      if (r.goingRight) ctx.scale(-1, 1);

      // 5. SHAPE SIZE: 
      // If the screen is black, r.size is likely already a pixel value (e.g. 15-30).
      // DO NOT multiply it by 'baseDim' if it's already a pixel value.
      // Just pass r.size directly to the renderer.
      this._renderShape(ctx, r.size, r.wingPhase, t.ravenClose || '#333');
      
      ctx.restore();
    });
  }

  _renderShape(ctx, s, wingPhase, color)
{
  const K = RAVEN_CONST;
  const c = this.cfg;

  const beat = Math.sin(wingPhase);
  const wingY = beat * s * c.wingStrength;

  ctx.fillStyle = color;

  // ── BODY (forward aggressive lean)
  ctx.beginPath();
  ctx.moveTo(-3.0 * s, 0);
  ctx.bezierCurveTo(-1.5 * s, -0.6 * s, 1.2 * s, -0.4 * s, 2.2 * s, 0);
  ctx.bezierCurveTo(1.2 * s, 0.4 * s, -1.8 * s, 0.8 * s, -3.0 * s, 0);
  ctx.fill();

  // ── HEAD (pushed forward)
  ctx.beginPath();
  ctx.ellipse(-2.4 * s, -0.2 * s, 0.6 * s, 0.45 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── BEAK (sharp hooked)
  ctx.beginPath();
  ctx.moveTo(-2.6 * s, -0.2 * s);
  ctx.quadraticCurveTo(-3.6 * s, -0.5 * s, -4.2 * s, 0.2 * s);
  ctx.lineTo(-2.5 * s, 0.15 * s);
  ctx.fill();

  // ── WING (LONG + FINGERED LIKE IMAGE)
  ctx.beginPath();

  const shX = -1.0 * s;
  const shY = -0.1 * s;

  ctx.moveTo(shX, shY);

  const tipX = 1.8 * s;
  const tipY = wingY;

  // leading edge (clean sweep)
  ctx.quadraticCurveTo(0.2 * s, -0.8 * s + wingY * 0.5, tipX, tipY);

  // trailing feathers (sharp fingers)
  const featherCount = 9;
  for (let i = 0; i < featherCount; i++)
  {
    const t = i / (featherCount - 1);

    const fx = tipX - t * (tipX + 0.4 * s);

    // THIS is the key: sharp downward spikes like your image
    const fy =
      tipY +
      t * (1.6 * s) +
      Math.sin(i * 1.7) * 0.15 * s;

    ctx.lineTo(fx, fy);
  }

  ctx.lineTo(shX, shY);
  ctx.fill();

  // ── TAIL (sharp wedge)
  ctx.beginPath();
  ctx.moveTo(2.2 * s, 0);

  ctx.lineTo(3.8 * s, -0.6 * s);
  ctx.lineTo(4.2 * s, 0);
  ctx.lineTo(3.8 * s, 0.6 * s);

  ctx.closePath();
  ctx.fill();
}
}