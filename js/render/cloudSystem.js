class CloudSystem extends BaseRenderer {
  constructor(config) {
    super(config);
    this.phase = 0;
  }

  update(dt) {
    this.phase += dt * 0.0012;
  }

  draw(ctx, W, H, t) {
    const K = SKY_CONST;
    const c = this.cfg;
    const cloudCol = K.CLOUD_COLOR_OVERRIDE || t.skyGlow;
    const cloudAlpha = K.CLOUD_ALPHA * K.CLOUD_OPACITY_SCALE;
    const s = Math.min(W, H); 
    const timestamp = this.phase * K.CLOUD_PHASE_SCALE;

    for (let i = 0; i < c.CLOUD_COUNT; i++) {
      const speed = c.CLOUD_SPEED * (K.CLOUD_SPEED_BASE + (i % 3) * K.CLOUD_SPEED_STEP) * s;
      const sizeW = s * (c.CLOUD_MIN_SZ + (i * 7 % 10) * K.CLOUD_SIZE_VARIANCE) * 4;
      const sizeH = sizeW / c.CLOUD_STRETCH;

      let x = ((i * K.CLOUD_X_SPACING * W) + (timestamp * speed)) % (W + sizeW * 2) - sizeW;
      let y = (i * K.CLOUD_Y_SPACING) * H + (H * K.CLOUD_Y_OFFSET);

      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = this._alpha(cloudCol, cloudAlpha);

      for (let p = 0; p < K.CLOUD_PUFF_COUNT; p++) {
        const px = p * (sizeW * K.CLOUD_PUFF_SPACING);
        const py = Math.sin(p + i + this.phase) * (sizeH * K.CLOUD_PUFF_SWAY);
        ctx.beginPath();
        ctx.ellipse(px, py, sizeW * 0.5, sizeH, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}