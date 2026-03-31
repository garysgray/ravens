class MountainRangeRenderer extends BaseRenderer 
{
  constructor() 
  {
    // POS_Y: 0.82 to lock it to the same horizon as the house/hill
    super({ POS_X: 0.5, POS_Y: 0.82, SCALE: 2.0 });
    
    this.C = {
      SEGMENTS: 15,       // How many jagged peaks
      RAGGEDNESS: 0.28,   // How 'sharp' the rocks are
      HEIGHT_RATIO: 1,  // Max height of the back range
      COLOR_SHIFT: 0.005   // How much darker the front layers get
    };

    this.cache = null;
  }

  draw(ctx, W, H, t) 
  {
    if (!t) return;
    const d = this.getDims(W, H);
    const s = d.w;

    // 1. Create the Cache if it doesn't exist or screen resized
    if (!this.cache || this.cache.width !== W || this.cache.height !== H) {
      this._renderToCache(W, H, d, t);
    }

    // 2. Just stamp the cached image (Super fast)
    ctx.drawImage(this.cache, 0, 0);
  }

  _renderToCache(W, H, d, t) 
  {
    this.cache = document.createElement('canvas');
    this.cache.width = W;
    this.cache.height = H;
    const cctx = this.cache.getContext('2d');
    const s = d.w;
    const baseY = d.y;

    // Draw 3 layers of canyon walls for depth
    for (let layer = 0; layer < 3; layer++) {
      const layerScale = 1.0 - (layer * 0.2);
      const layerHeight = s * this.C.HEIGHT_RATIO * (0.5 + layer * 0.25);
      
      cctx.fillStyle = this._alpha(t.treeBase, 0.2 + (layer * 0.3));
      cctx.beginPath();
      cctx.moveTo(0, baseY);

      for (let i = 0; i <= this.C.SEGMENTS; i++) {
        const x = (i / this.C.SEGMENTS) * W;
        // Random jagged height
        const noise = (Math.random() - 0.5) * (s * this.C.RAGGEDNESS);
        const y = baseY - (layerHeight + noise);
        
        cctx.lineTo(x, y);
      }

      cctx.lineTo(W, baseY);
      cctx.closePath();
      cctx.fill();

      // Rim light on the canyon edges
      cctx.strokeStyle = this._alpha(t.skyGlow, 0.03);
      cctx.lineWidth = 2;
      cctx.stroke();
    }
  }
}