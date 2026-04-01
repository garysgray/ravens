class MountainRangeRenderer extends BaseRenderer 
{
  constructor() 
  {
    // POS_Y aligns this with house / hill horizon line
    super({ POS_X: 0.5, POS_Y: 0.82, SCALE: 2.0 });
    this.cache = null;
    this.seededNoise = null;
    this._lastTime = null;  

    // ── VISUAL CONTROLS (terrain shape)
    this.C = {
      SEGMENTS: 15,        // number of peak samples across width
      RAGGEDNESS: 0.28,    // vertical randomness amplitude
      HEIGHT_RATIO: 1.0,   // overall mountain height scale
      COLOR_SHIFT: 0.05   // reserved (not used yet, kept for layering logic)
      
    };

    // cached canvas (pre-rendered mountains)
    this.cache = null;

    // IMPORTANT: ensures cache isn't regenerated with different random terrain every frame
    this.seededNoise = null;
  }

  draw(ctx, W, H, t) 
  {
    if (!t) return;
    const d = this.getDims(W, H);

    if (!this.cache || this.cache.width !== W || this.cache.height !== H || this._lastTime !== t) 
    {
      this._renderToCache(W, H, d, t);
      this._lastTime = t;
    }

    ctx.drawImage(this.cache, 0, 0);
  }

  _renderToCache(W, H, d, t) 
  {
    this.cache = document.createElement('canvas');
    this.cache.width = W;
    this.cache.height = H;

    const cctx = this.cache.getContext('2d');

    const s = d.w;        // base scale
    const baseY = d.y;    // horizon line

    // ─────────────────────────────────────────────
    // generate deterministic noise ONCE per cache build
    // (fixes flickering mountains)
    this.seededNoise = [];
    for (let i = 0; i <= this.C.SEGMENTS; i++) 
    {
      this.seededNoise[i] = (Math.random() - 0.5);
    }

    // ─────────────────────────────────────────────
    // DRAW LAYERS (back → front)
    for (let layer = 0; layer < 3; layer++) 
    {
      // how far back this layer sits (not currently used for x shift, but reserved)
      const layerScale = 1.0 - (layer * 0.2);

      // height increases slightly per layer to create depth illusion
      const layerHeight =
        s *
        this.C.HEIGHT_RATIO *
        (0.5 + layer * 0.25);

      // darker + denser as layers come forward
      const alpha =
      0.2 +
      (layer * 0.3) +
      (layer * this.C.COLOR_SHIFT);

      cctx.fillStyle = this._alpha(t.treeBase, alpha);

      cctx.beginPath();
      cctx.moveTo(0, baseY);

      for (let i = 0; i <= this.C.SEGMENTS; i++) 
      {
        const x = (i / this.C.SEGMENTS) * W;

        // stable noise (NOT flickering anymore)
        const noise =
          this.seededNoise[i] *
          (s * this.C.RAGGEDNESS);

        const y = baseY - (layerHeight + noise);

        cctx.lineTo(x, y);
      }

      cctx.lineTo(W, baseY);
      cctx.closePath();
      cctx.fill();

      // ── rim highlight (edge lighting)
      cctx.strokeStyle = this._alpha(t.skyGlow, 0.03);
      cctx.lineWidth = 2;
      cctx.stroke();
    }
  }
}