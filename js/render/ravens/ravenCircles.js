// ─────────────────────────────────────────────
// THE MAIN RENDERER CLASS
// ─────────────────────────────────────────────
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
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.CONST = 
    {
      math: { TAU: Math.PI * 2 }
    };

    this.rings = 
    [
      { radius: 0.13, count: 6,  speed: -0.0014, size: 0.7, alpha: 0.70, tilt: 0, tiltAxis: 0, wingOffset: true, wingSpeed: 1.0, zLayer: 'back', color: null, birds: [] },
      { radius: 0.20, count: 9,  speed:  0.0019, size: 1.0, alpha: 0.78, tilt: 0, tiltAxis: 0, wingOffset: true, wingSpeed: 1.0, zLayer: 'back', color: null, birds: [] },
      { radius: 0.28, count: 12, speed: -0.0013, size: 2.0, alpha: 0.82, tilt: 0, tiltAxis: 0, wingOffset: true, wingSpeed: 1.0, zLayer: 'back', color: null, birds: [] },
      { radius: 0.38, count: 16, speed:  0.0008, size: 3.0, alpha: 0.88, tilt: 0, tiltAxis: 0, wingOffset: true, wingSpeed: 1.2, zLayer: 'back', color: null, birds: [] }
    ];

    this.initBirds();
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  initBirds() 
  {
    this.rings.forEach(ring => 
    {
      ring._angle = 0;
      ring.birdInstances = Array.from({ length: ring.count }, (_, i) => 
      {
        return new CircleRaven(i, ring.count, ring, ring.birds[i] || {});
      });
    });
  }

  update(dt) 
  {
    if (!dt) return;
    const m = dt * 0.06;
    const gs = this.cfg.globalSpeed;

    for (const ring of this.rings) 
    {
      ring._angle += ring.speed * gs * m;
      
      for (const bird of ring.birdInstances) 
      {
        // We removed 'this.CONST.ring.wingPhaseStep' from here
        // because the bird now uses its own internal this.wingPhaseStep
        bird.update(dt, ring.wingSpeed, gs);
      }
    }
  }

  setRing(i, k, v) 
  {
    const ring = this.rings[i];
    if (!ring) return;
    ring[k] = v;
    if (k === 'count' || k === 'birds') this.initBirds();
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

  _drawRings(layer, t) 
  {
    if (!this.ctx || !this.canvas || !t) return;

    const W = this.canvas.width;
    const H = this.canvas.height;
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

      ring.birdInstances.forEach((bird, i) => 
      {
        if (bird.skip) return;

        const angle = ring._angle + (i / ring.count) * this.CONST.math.TAU + bird.angleOffset;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        const lx = x * ca + y * sa;
        const ly = -x * sa + y * ca;

        const bx = cx + lx * ca - ly * scaleFlat * sa;
        const by = cy + lx * sa + ly * scaleFlat * ca;

        const dx = -Math.sin(angle) * r;
        const dy =  Math.cos(angle) * r;
        const dlx = dx * ca + dy * sa;
        const dly = -dx * sa + dy * ca;
        const tx = dlx * ca - dly * scaleFlat * sa;
        const ty = dlx * sa + dly * scaleFlat * ca;

        const tangentAngle = Math.atan2(ty, tx) + (ring.speed < 0 ? Math.PI : 0);

        const sinA = Math.sin(angle);
        const depth = 0.85 + 0.3 * ((sinA + 1) / 2);
        const size = Math.max(o.minSize, ring.size * bird.sizeMult * depth * o.globalSize * (baseDim / 500));

        const depthAlpha = 0.6 + 0.4 * ((sinA + 1) / 2);
        const alpha = (bird.alphaMult !== null ? bird.alphaMult : ring.alpha) * depthAlpha * o.globalAlpha;
        const color = bird.colorOverride || ring.color || t.ravenClose || '#000';

        ctx.save();
        ctx.fillStyle = this._alpha(color, alpha);
        ctx.translate(bx, by);
        ctx.rotate(tangentAngle + bird.bodyTilt);
        
        bird.draw(ctx, size, this.CONST);
        
        ctx.restore();
      });
    }
  }
}