class SkyBackground extends BaseRenderer 
{
  constructor() 
  {
    super();
    this.phase = 0;

    this._skyGrad    = null;
    this._groundGrad = null;
    this._fogGrad    = null;
    this._lastT      = null;
    this._lastW      = 0;
    this._lastH      = 0;
  }

  update(dt) 
  {
    this.phase += dt * 0.0012; 
  }

  draw(ctx, W, H, t) 
  {
    const K = SKY_CONST;

    const sizeChanged = this._lastW !== W || this._lastH !== H;
    const timeChanged = this._lastT !== t;

    // SKY GRADIENT
    if (!this._skyGrad || sizeChanged || timeChanged)
    {
      const sky = ctx.createLinearGradient(0, 0, 0, H * K.SKY_H);
      sky.addColorStop(0, t.skyTop);
      sky.addColorStop(K.SKY_MID_STOP, t.skyMid);
      sky.addColorStop(1, t.skyHor);
      this._skyGrad = sky;
    }

    ctx.fillStyle = this._skyGrad;
    ctx.fillRect(0, 0, W, H);

    // SUN / MOON GLOW (radial gradient — pulse changes every frame so can't cache)
    const gx  = W * (t.glowX || K.GLOW_X_DEFAULT);
    const gy  = H * (t.glowY || K.GLOW_Y_DEFAULT);
    const rad = W * K.GLOW_RADIUS;
    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad);

    const pulse = K.GLOW_BASE + Math.sin(this.phase) * K.GLOW_PULSE;
    glow.addColorStop(0, this._alpha(t.skyGlow, pulse));
    glow.addColorStop(0.25, this._alpha(t.skyGlow, K.GLOW_MID_ALPHA));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    this._drawGround(ctx, W, H, K, sizeChanged);
    this._drawFog(ctx, W, H, t, K, sizeChanged, timeChanged);

    // cache keys
    this._lastT = t;
    this._lastW = W;
    this._lastH = H;
  }

  _drawFog(ctx, W, H, t, K, sizeChanged, timeChanged) 
  {
    if (!this._fogGrad || sizeChanged || timeChanged)
    {
      const groundY = H * K.FOG_GROUND_Y;
      const fg = ctx.createLinearGradient(
        0, groundY * K.FOG_TOP,
        0, groundY + H * K.FOG_EXT
      );
      fg.addColorStop(0, 'transparent');
      fg.addColorStop(0.5, t.treeFog);
      fg.addColorStop(1, 'transparent');
      this._fogGrad = fg;
    }

    const groundY = H * K.FOG_GROUND_Y;
    const drift   = Math.sin(this.phase * K.FOG_DRIFT_FREQ) * W * K.FOG_DRIFT_AMP;

    ctx.save();
    ctx.translate(drift, 0);
    ctx.fillStyle = this._fogGrad;
    ctx.fillRect(W * K.FOG_OFFSET_X, 0, W * K.FOG_WIDTH, H);
    ctx.restore();
  }

  _drawGround(ctx, W, H, K, sizeChanged) 
  {
    if (!this._groundGrad || sizeChanged)
    {
      this._groundGrad = ctx.createLinearGradient(0, H * K.GROUND_Y, 0, H);
      this._groundGrad.addColorStop(0, 'transparent');
      this._groundGrad.addColorStop(1, K.GROUND_COLOR);
    }

    ctx.fillStyle = this._groundGrad;
    ctx.fillRect(0, 0, W, H);
  }
}