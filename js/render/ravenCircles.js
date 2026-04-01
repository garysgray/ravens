class RavenCircles extends BaseRenderer
{
  constructor(canvasId)
  {
    super({
      cx: 0.46,
      cy: 0.42,
      globalSpeed: 1.0,
      globalSize: 1.0,
      globalAlpha: 1.0,
      minSize: 4.0
    });

    // ─────────────────────────────────────────────
    // Canvas setup
    // ─────────────────────────────────────────────
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // internal time state
    this.phase = 0;

    // constants (no magic numbers in main loop)
    this.CONST =
    {
      ring:
      {
        wingPhaseStep: 0.08
      },
      render:
      {
        wingUp: 2.0,
        wingDown: 2.0,
        bodyHalf: 0.5
      },
      math:
      {
        TAU: Math.PI * 2
      }
    };

    // ─────────────────────────────────────────────
    // Rings (stable config, no runtime mutation surprises)
    // ─────────────────────────────────────────────
    this.rings =
    [
      { radius: 0.13, count: 6,  speed: -0.0014, size: 0.7, alpha: 0.70, tilt: 0, tiltAxis: 0, wingOffset: true, wingSpeed: 1.0, zLayer: 'back', color: null, birds: [] },
      { radius: 0.20, count: 9,  speed:  0.0019, size: 1.0, alpha: 0.78, tilt: 0, tiltAxis: 0, wingOffset: true, wingSpeed: 1.0, zLayer: 'back', color: null, birds: [] },
      { radius: 0.28, count: 12, speed: -0.0013, size: 2.0, alpha: 0.82, tilt: 0, tiltAxis: 0, wingOffset: true, wingSpeed: 1.0, zLayer: 'back', color: null, birds: [] },
      { radius: 0.38, count: 16, speed:  0.0008, size: 3.0, alpha: 0.88, tilt: 0, tiltAxis: 0, wingOffset: true, wingSpeed: 1.2, zLayer: 'back', color: null, birds: [] }
    ];

    // ─────────────────────────────────────────────
    // Precompute stable offsets (fixes “seed drift” type bugs)
    // ─────────────────────────────────────────────
    this.rings.forEach((ring, ri) =>
    {
      ring._angle = (this.CONST.math.TAU / this.rings.length) * ri;

      // stable wing phase offsets (NO randomness, NO undefined seed usage)
      ring._wingPhases = Array.from(
        { length: ring.count },
        (_, i) => ring.wingOffset
          ? (i / ring.count) * this.CONST.math.TAU
          : 0
      );
    });

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  // ─────────────────────────────────────────────
  // UPDATE
  // dt-driven animation (stable scaling)
  // ─────────────────────────────────────────────
  update(dt)
  {
    if (!dt) return;

    const m = dt * 0.06;
    const gs = this.cfg.globalSpeed;

    for (const ring of this.rings)
    {
      ring._angle += ring.speed * gs * m;

      const ws = (ring.wingSpeed || 1.0) * gs;

      for (let i = 0; i < ring._wingPhases.length; i++)
      {
        ring._wingPhases[i] += this.CONST.ring.wingPhaseStep * ws * m;
      }
    }
  }

  setOption(k, v)
  {
    this.cfg[k] = v;
  }

  setRing(i, k, v)
  {
    const ring = this.rings[i];
    if (!ring) return;

    ring[k] = v;

    // rebuild wing phases safely if count changes
    if (k === 'count')
    {
      ring._wingPhases = Array.from(
        { length: ring.count },
        (_, i) => ring.wingOffset
          ? (i / ring.count) * this.CONST.math.TAU
          : 0
      );
    }
  }

  _resize()
  {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  clear()
  {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawBack(t) { this._drawRings('back', t); }
  drawFront(t) { this._drawRings('front', t); }

  // ─────────────────────────────────────────────
  // MAIN DRAW
  // ─────────────────────────────────────────────
  _drawRings(layer, t)
  {
    if (!this.ctx || !this.canvas || !t) return;

    const W = this.canvas.width;
    const H = this.canvas.height;
    if (W === 0 || H === 0) this._resize();

    const ctx = this.ctx;
    const o = this.cfg;

    const cx = W * o.cx;
    const cy = H * o.cy;
    const baseDim = Math.min(W, H);

    for (const ring of this.rings)
    {
      if (ring.zLayer !== layer) continue;

      const r = ring.radius * baseDim;

      const tilt = ring.tilt || 0;
      const axis = ring.tiltAxis || 0;

      const scaleFlat = 1 - tilt;
      const ca = Math.cos(axis);
      const sa = Math.sin(axis);

      for (let i = 0; i < ring.count; i++)
      {
        const bird = ring.birds[i] || {};

        if (bird.skip) continue;

        // stable angular position
        const angle =
          ring._angle +
          (i / ring.count) * this.CONST.math.TAU +
          (bird.angleOffset || 0);

        // circle projection
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        const lx = x * ca + y * sa;
        const ly = -x * sa + y * ca;

        const bx = cx + lx * ca - ly * scaleFlat * sa;
        const by = cy + lx * sa + ly * scaleFlat * ca;

        // tangent direction
        const dx = -Math.sin(angle) * r;
        const dy =  Math.cos(angle) * r;

        const dlx = dx * ca + dy * sa;
        const dly = -dx * sa + dy * ca;

        const tx = dlx * ca - dly * scaleFlat * sa;
        const ty = dlx * sa + dly * scaleFlat * ca;

        const tangentAngle =
          Math.atan2(ty, tx) + (ring.speed < 0 ? Math.PI : 0);

        // size + depth stability
        const depth = 0.85 + 0.3 * ((Math.sin(angle) + 1) / 2);

        const size =
          Math.max(
            o.minSize,
            ring.size * (bird.size || 1) * depth * o.globalSize * (baseDim / 500)
          );

        // alpha (fixed layering, no drift)
        const depthAlpha = 0.6 + 0.4 * ((Math.sin(angle) + 1) / 2);
        const alpha =
          (bird.alpha != null ? bird.alpha : ring.alpha) *
          depthAlpha *
          o.globalAlpha;

        const color = bird.color || ring.color || t.ravenClose || '#000';

        const wingPhase =
          ring._wingPhases[i] + (bird.wingPhaseOffset || 0);

        ctx.save();
        ctx.fillStyle = this._alpha(color, alpha);
        ctx.translate(bx, by);
        ctx.rotate(tangentAngle + (bird.bodyTilt || 0));

        this._drawSilhouette(ctx, size, wingPhase);
        ctx.restore();
      }
    }
  }

  // ─────────────────────────────────────────────
  // RAVEN SHAPE
  // ─────────────────────────────────────────────
  _drawSilhouette(ctx, s, wingPhase)
  {
    const wing = Math.sin(wingPhase);
    const wUp = wing * s * this.CONST.render.wingUp;

    // body
    ctx.fillRect(-s, -s * this.CONST.render.bodyHalf, s * 2, s);

    // wings
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(0, -s * this.CONST.render.wingUp - wUp);
    ctx.lineTo(s, 0);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(0, s * this.CONST.render.wingDown + wUp);
    ctx.lineTo(s, 0);
    ctx.fill();
  }
}