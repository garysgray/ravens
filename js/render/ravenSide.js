
// ─── Raven Constants ─────────────────────────────────────────────────────────
// Global shared configuration for raven shape, motion, and visual tuning.
// These values are referenced across ALL raven renderers.
const RAVEN_CONST =
{
  // Spawn / movement behavior
  spawn:
  {
    yMin: 0.2,        // lowest spawn height (% of screen)
    yRange: 0.45,     // vertical spawn randomness range
    offscreenMult: 6, // how far offscreen before respawn triggers
    spawnOffset: 4,   // how far outside screen ravens spawn
  },

  // Wing animation speed control
  wing:
  {
    speedMin: 0.000004, // slowest flap speed
    speedRange: 0.0008,  // randomness range added to flap speed
  },

  // Visual randomness (opacity + depth layering feel)
  visual:
  {
    alphaMin: 0.72,
    alphaRange: 0.95,
    depthMin: 0.9,
    depthRange: 0.6,
  },

  // ── BODY SHAPE (normalized, scaled by size "s") ──
  body:
  {
    noseX: -3.0,
    midTopY: -0.6,
    midBotY:  0.8,
    tailX:  2.2,
  },

  // ── HEAD SHAPE ──
  head:
  {
    x:  -2.4,
    y:  -0.2,
    rx:  0.6,
    ry:  0.45,
    rot: 0,
  },

  // ── BEAK SHAPE (quadratic curve definition) ──
  beak:
  {
    x1: -2.6, y1: -0.2,
    x2: -4.2, y2:  0.2,
    ctrlX: -3.6, ctrlY: -0.5,
    x3: -2.5, y3:  0.15,
  },

  // ── WING SHAPE ──
  wingShape:
  {
    shoulderX: -1.0,
    shoulderY: -0.1,
    tipX: 1.8,
    baseX: -0.4,
    baseY: 0.3,
  },

  // ── TAIL SHAPE ──
  tail:
  {
    x: 2.2,
    length: 2.0,
    width: 0.6,
    count: 3,
  },

  // ── FEATHER SYSTEM ──
  feathers:
  {
    wingCount: 9,
    spread: 1.6,
  }
};


// ─── RavenSideRenderer ───────────────────────────────────────────────────────
// Renders stylized side-view ravens using procedural animation.
// Handles spawn, motion, wing flapping, and full shape drawing.
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

  setTime(id)
  {
    this.time = id;
  }

  // Creates initial raven population
  _initRavens(W, H)
  {
    for (let i = 0; i < this.cfg.count; i++)
    {
      this.ravens.push(this._createRaven(W, H, true));
    }
    this.initialized = true;
  }

  // Creates a single raven instance with randomized properties
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
        : (goingRight
            ? -size * K.spawn.spawnOffset
            : W + size * K.spawn.spawnOffset),

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

  // Main update loop (physics + animation)
  update(dt)
  {
    if (!dt) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    if (!this.initialized) this._initRavens(W, H);

    const m = dt * 0.06;
    const c = this.cfg;
    const K = RAVEN_CONST;

    this.ravens.forEach((r, i) =>
    {
      // horizontal motion
      r.x += r.vx * m;

      // animation phases
      r.wingPhase += r.wingSpeed * m * 16.6;
      r.wavePhase += c.waveSpeed * m;

      // vertical wave motion
      r.y = r.baseY + Math.sin(r.wavePhase) * c.waveDrift;

      // respawn check (offscreen kill + replace)
      if (
        (r.vx > 0 && r.x > W + r.size * K.spawn.offscreenMult) ||
        (r.vx < 0 && r.x < -r.size * K.spawn.offscreenMult)
      )
      {
        this.ravens[i] = this._createRaven(W, H, false);
      }
    });
  }

  // Draw all ravens
  draw(ctx, W, H, t)
  {
    if (!t || !this.initialized) return;

    this.ravens.forEach((r) =>
    {
      ctx.save();

      ctx.globalAlpha = r.alpha * r.depth;

      ctx.translate(r.x, r.y);

      // flip direction for right-moving ravens
      if (r.goingRight) ctx.scale(-1, 1);

      this._renderShape(ctx, r.size, r.wingPhase, t.ravenClose || '#333');

      ctx.restore();
    });
  }

  // ─── Core procedural raven drawing ───
  _renderShape(ctx, s, wingPhase, color)
  {
    const K = RAVEN_CONST;
    const c = this.cfg;

    const beat = Math.sin(wingPhase);
    const wingY = beat * s * c.wingStrength;

    ctx.fillStyle = color;

    // ── BODY ──
    const B = K.body;

    ctx.beginPath();
    ctx.moveTo(B.noseX * s, 0);

    ctx.bezierCurveTo(
      B.noseX * 0.5 * s, B.midTopY * s,
      B.tailX * 0.5 * s, B.midTopY * 0.6 * s,
      B.tailX * s, 0
    );

    ctx.bezierCurveTo(
      B.tailX * 0.5 * s, B.midBotY * s,
      B.noseX * 0.6 * s, B.midBotY * s,
      B.noseX * s, 0
    );

    ctx.fill();

    // ── HEAD ──
    const H = K.head;

    ctx.beginPath();
    ctx.ellipse(H.x * s, H.y * s, H.rx * s, H.ry * s, H.rot, 0, Math.PI * 2);
    ctx.fill();

    // ── BEAK ──
    const Be = K.beak;

    ctx.beginPath();
    ctx.moveTo(Be.x1 * s, Be.y1 * s);
    ctx.quadraticCurveTo(Be.ctrlX * s, Be.ctrlY * s, Be.x2 * s, Be.y2 * s);
    ctx.lineTo(Be.x3 * s, Be.y3 * s);
    ctx.fill();

    // ── WING ──
    const W = K.wingShape;
    const F = K.feathers;

    ctx.beginPath();

    const shX = W.shoulderX * s;
    const shY = W.shoulderY * s;

    ctx.moveTo(shX, shY);

    const tipX = W.tipX * s;
    const tipY = wingY;

    ctx.quadraticCurveTo(
      (shX + tipX) * 0.5,
      shY - s + wingY * 0.5,
      tipX,
      tipY
    );

    for (let i = 0; i < F.wingCount; i++)
    {
      const t = i / (F.wingCount - 1);

      const fx = tipX - t * (tipX - W.baseX * s);

      const fy =
        tipY +
        t * (F.spread * s) +
        Math.sin(i * 1.7) * 0.15 * s;

      ctx.lineTo(fx, fy);
    }

    ctx.lineTo(shX, shY);
    ctx.fill();

    // ── TAIL ──
    const T = K.tail;

    ctx.beginPath();

    const baseX = T.x * s;
    ctx.moveTo(baseX, 0);

    for (let i = 0; i < T.count; i++)
    {
      const t = i / (T.count - 1);

      const tx = baseX + T.length * s;
      const ty = (t - 0.5) * T.width * s * 2;

      ctx.lineTo(tx, ty);
    }

    ctx.closePath();
    ctx.fill();
  }
}