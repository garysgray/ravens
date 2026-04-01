class CloudSystem extends BaseRenderer 
{
  constructor(config) 
  {
    super(config);
    this.phase = 0; // drives animation over time
  }

  update(dt) 
  {
    // global phase (used for motion + puff sway)
    this.phase += dt * 0.0012;
  }

  draw(ctx, W, H, t) 
  {
    const K = SKY_CONST;
    const c = this.cfg;

    // ── COLOR + ALPHA
    const cloudCol   = K.CLOUD_COLOR_OVERRIDE || t.skyGlow;
    const cloudAlpha = K.CLOUD_ALPHA * K.CLOUD_OPACITY_SCALE;
    const cloudStyle = this._alpha(cloudCol, cloudAlpha);

    const s = Math.min(W, H); // base scale
    const timestamp = this.phase * K.CLOUD_PHASE_SCALE; // movement driver

    // ── LOOP CLOUDS
    for (let i = 0; i < c.CLOUD_COUNT; i++) 
    {
      // ── SPEED (varies per cloud)
      const speed =
        c.CLOUD_SPEED *
        (K.CLOUD_SPEED_BASE + (i % 3) * K.CLOUD_SPEED_STEP) *
        s;

      // ── SIZE
      const sizeW =
        s *
        (c.CLOUD_MIN_SZ + (i * 7 % 10) * K.CLOUD_SIZE_VARIANCE) *
        4;

      const sizeH = sizeW / c.CLOUD_STRETCH; // vertical squash/stretch

      // ── POSITION
      let x =
        ((i * K.CLOUD_X_SPACING * W) + (timestamp * speed)) %
        (W + sizeW * 2) -
        sizeW;

      let y =
        (i * K.CLOUD_Y_SPACING) * H + // vertical stacking
        (H * K.CLOUD_Y_OFFSET);       // global offset

      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = cloudStyle;

      // ── PUFFS (the actual cloud shape)
      for (let p = 0; p < K.CLOUD_PUFF_COUNT; p++) 
      {
        // horizontal spacing between puffs
        const px = p * (sizeW * K.CLOUD_PUFF_SPACING);

        // vertical wobble (animated)
        const py =
          Math.sin(p + i + this.phase) *
          (sizeH * K.CLOUD_PUFF_SWAY);

        ctx.beginPath();

        ctx.ellipse(
          px,
          py,
          sizeW * 0.5, // puff width
          sizeH,       // puff height
          0,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      ctx.restore();
    }
  }
}