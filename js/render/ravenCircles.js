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

    this.canvas = document.getElementById(canvasId);
    if (this.canvas) this.ctx = this.canvas.getContext('2d');
    
    // Internal timing state
    this.phase = 0;

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
        fullCircle: Math.PI * 2
      }
    };

    this.rings =
    [
      {
        radius: 0.13,
        count: 6,
        speed: -0.0014,
        size: 0.7,
        alpha: 0.70,
        tilt: 0,
        tiltAxis: 0,
        wingOffset: true,
        wingSpeed: 1.0,
        zLayer: 'back',
        color: null,
        birds: []
      },
      {
        radius: 0.20,
        count: 9,
        speed: 0.0019,
        size: 1,
        alpha: 0.78,
        tilt: 0,
        tiltAxis: 0,
        wingOffset: true,
        wingSpeed: 1.0,
        zLayer: 'back',
        color: null,
        birds: []
      },
      {
        radius: 0.28,
        count: 12,
        speed: -0.0013,
        size: 2,
        alpha: 0.82,
        tilt: 0,
        tiltAxis: 0,
        wingOffset: true,
        wingSpeed: 1.0,
        zLayer: 'back',
        color: null,
        birds: []
      },
      {
        radius: 0.38,
        count: 16,
        speed: 0.0008,
        size: 3,
        alpha: 0.88,
        tilt: 0,
        tiltAxis: 0,
        wingOffset: true,
        wingSpeed: 1.2,
        zLayer: 'back',
        color: null,
        birds: []
      }
    ];

    this.rings.forEach((ring, i) =>
    {
      ring._angle = (this.CONST.math.fullCircle / this.rings.length) * i;

      ring._wingPhases = Array.from(
        { length: ring.count },
        (_, j) => ring.wingOffset
          ? (j / ring.count) * this.CONST.math.fullCircle
          : 0
      );
    });

    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  // UPDATED: Now accepts dt from the Scene loop
  update(dt)
  {
    if (!dt) return;
    
    // Scale factor to keep the original speeds feeling the same (assuming ~60fps)
    const m = dt * 0.06;
    const gs = this.cfg.globalSpeed;

    this.rings.forEach(ring =>
    {
      // Rotate the ring based on dt
      ring._angle += ring.speed * gs * m;

      const ws = (ring.wingSpeed || 1.0) * gs;

      // Update wing flaps based on dt
      ring._wingPhases = ring._wingPhases.map(
        p => p + this.CONST.ring.wingPhaseStep * ws * m
      );
    });
  }

  setOption(k, v) { this.cfg[k] = v; }

  setRing(i, k, v)
  {
    if (!this.rings[i]) return;
    this.rings[i][k] = v;

    if (k === 'count')
    {
      const r = this.rings[i];
      r._wingPhases = Array.from(
        { length: r.count },
        (_, j) => r.wingOffset
          ? (j / r.count) * this.CONST.math.fullCircle
          : 0
      );
    }
  }

  _resize()
  {
    if (this.canvas)
    {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  drawBack(t) { this._drawRings('back', t); }
  drawFront(t) { this._drawRings('front', t); }

  clear()
  {
    if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _drawRings(layer, t)
  {
    if (!this.canvas || !t) return;

    const W = this.canvas.width;
    const H = this.canvas.height;
    if (W === 0) this._resize();

    const ctx = this.ctx;
    const o = this.cfg;
    const cx = W * o.cx;
    const cy = H * o.cy;

    this.rings.forEach(ring =>
    {
      if (ring.zLayer !== layer) return;

      const baseDim = Math.min(W, H);
      const r = ring.radius * baseDim;
      const tilt = ring.tilt || 0;
      const tiltAxis = ring.tiltAxis || 0;
      const scaleFlat = 1 - tilt;
      const ca = Math.cos(tiltAxis);
      const sa = Math.sin(tiltAxis);

      for (let i = 0; i < ring.count; i++)
      {
        const bird = ring.birds[i] || {};
        if (bird.skip) continue;

        const angle = ring._angle + (i / ring.count) * this.CONST.math.fullCircle + (bird.angleOffset || 0);

        const rawX = Math.cos(angle) * r;
        const rawY = Math.sin(angle) * r;
        const lx = rawX * ca + rawY * sa;
        const ly = -rawX * sa + rawY * ca;

        const bx = cx + lx * ca - ly * scaleFlat * sa;
        const by = cy + lx * sa + ly * scaleFlat * ca;

        const dRawX = -Math.sin(angle) * r;
        const dRawY = Math.cos(angle) * r;
        const dlx = dRawX * ca + dRawY * sa;
        const dly = -dRawX * sa + dRawY * ca;
        const dtx = dlx * ca - dly * scaleFlat * sa;
        const dty = dlx * sa + dly * scaleFlat * ca;

        const tangentAngle = Math.atan2(dty, dtx) + (ring.speed < 0 ? Math.PI : 0);
        const depthScale = 0.85 + 0.3 * ((Math.sin(angle) + 1) / 2);

        const s = Math.max(
          o.minSize,
          ring.size * (bird.size || 1.0) * depthScale * o.globalSize * (baseDim / 500)
        );

        const depthAlpha = 0.6 + 0.4 * ((Math.sin(angle) + 1) / 2);
        const birdAlpha = bird.alpha != null ? bird.alpha : ring.alpha;
        const finalAlpha = birdAlpha * depthAlpha * o.globalAlpha;
        const colorStr = bird.color || ring.color || t.ravenClose || '#000';
        const wingPhase = ring._wingPhases[i] + (bird.wingPhaseOffset || 0);

        ctx.save();
        ctx.fillStyle = this._alpha(colorStr, finalAlpha);
        ctx.translate(bx, by);
        ctx.rotate(tangentAngle + (bird.bodyTilt || 0));
        this._drawSilhouette(ctx, s, wingPhase);
        ctx.restore();
      }
    });
  }

  _drawSilhouette(ctx, s, wingPhase)
  {
    const wing = Math.sin(wingPhase);
    const wUp = wing * s * this.CONST.render.wingUp;

    ctx.fillRect(-s, -s * this.CONST.render.bodyHalf, s * 2, s);

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