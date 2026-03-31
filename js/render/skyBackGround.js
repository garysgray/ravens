class SkyBackground extends BaseRenderer {
  constructor() {
    super();
    this.phase = 0;
  }

  update(dt) {
    this.phase += dt * 0.0012; 
  }

  draw(ctx, W, H, t) {
    const K = SKY_CONST;
    
    // 1. Sky Gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H * K.SKY_H);
    sky.addColorStop(0, t.skyTop);
    sky.addColorStop(K.SKY_MID_STOP, t.skyMid);
    sky.addColorStop(1, t.skyHor);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // 2. Solar/Lunar Glow
    const gx = W * (t.glowX || K.GLOW_X_DEFAULT);
    const gy = H * (t.glowY || K.GLOW_Y_DEFAULT);
    const rad = W * K.GLOW_RADIUS;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad);
    
    // Uses internal phase
    glow.addColorStop(0, this._alpha(t.skyGlow, (K.GLOW_BASE + Math.sin(this.phase) * K.GLOW_PULSE)));
    glow.addColorStop(0.25, this._alpha(t.skyGlow, K.GLOW_MID_ALPHA));
    glow.addColorStop(1, 'transparent');

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    this._drawGround(ctx, W, H, K);
    this._drawFog(ctx, W, H, t, K);
  }

  _drawFog(ctx, W, H, t, K) {
    const groundY = H * K.FOG_GROUND_Y;
    const drift = Math.sin(this.phase * K.FOG_DRIFT_FREQ) * W * K.FOG_DRIFT_AMP;
    const fg = ctx.createLinearGradient(0, groundY * K.FOG_TOP, 0, groundY + H * K.FOG_EXT);
    fg.addColorStop(0, 'transparent');
    fg.addColorStop(0.5, t.treeFog);
    fg.addColorStop(1, 'transparent');

    ctx.save();
    ctx.translate(drift, 0);
    ctx.fillStyle = fg;
    ctx.fillRect(W * K.FOG_OFFSET_X, 0, W * K.FOG_WIDTH, H);
    ctx.restore();
  }

  _drawGround(ctx, W, H, K) {
    const ground = ctx.createLinearGradient(0, H * K.GROUND_Y, 0, H);
    ground.addColorStop(0, 'transparent');
    ground.addColorStop(1, K.GROUND_COLOR);
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, W, H);
  }
}