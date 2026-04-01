// ─── Sky Background Renderer ────────────────────────────────────────────────
// Responsible for drawing:
// 1. Sky gradient
// 2. Sun / moon glow (animated via phase)
// 3. Ground fade
// 4. Fog layer with horizontal drift
class SkyBackground extends BaseRenderer 
{
  constructor() 
  {
    super();

    // Internal animation timer used for subtle oscillations (glow, fog drift)
    this.phase = 0;
  }

  // Called every frame with delta time (ms)
  update(dt) 
  {
    // Slowly advance phase for smooth sine-based animation
    this.phase += dt * 0.0012; 
  }

  // Main render function
  draw(ctx, W, H, t) 
  {
    const K = SKY_CONST;
    
    // ─── SKY GRADIENT ────────────────────────────────────────────────────────
    // Vertical gradient from top sky color -> mid -> horizon color
    const sky = ctx.createLinearGradient(0, 0, 0, H * K.SKY_H);
    sky.addColorStop(0, t.skyTop);
    sky.addColorStop(K.SKY_MID_STOP, t.skyMid);
    sky.addColorStop(1, t.skyHor);

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // ─── SUN / MOON GLOW ─────────────────────────────────────────────────────
    // Position is normalized (0-1) with fallback defaults
    const gx = W * (t.glowX || K.GLOW_X_DEFAULT);
    const gy = H * (t.glowY || K.GLOW_Y_DEFAULT);

    const rad = W * K.GLOW_RADIUS;

    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, rad);
    
    // Pulsing intensity using sine wave + base values
    const pulse = K.GLOW_BASE + Math.sin(this.phase) * K.GLOW_PULSE;

    glow.addColorStop(0, this._alpha(t.skyGlow, pulse));
    glow.addColorStop(0.25, this._alpha(t.skyGlow, K.GLOW_MID_ALPHA));
    glow.addColorStop(1, 'transparent');

    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // ─── LAYERS BELOW SKY ────────────────────────────────────────────────────
    this._drawGround(ctx, W, H, K);
    this._drawFog(ctx, W, H, t, K);
  }

  // ─── FOG LAYER ────────────────────────────────────────────────────────────
  _drawFog(ctx, W, H, t, K) 
  {
    const groundY = H * K.FOG_GROUND_Y;

    // Horizontal drift using sine wave (gives slow movement effect)
    const drift = Math.sin(this.phase * K.FOG_DRIFT_FREQ) * W * K.FOG_DRIFT_AMP;

    const fg = ctx.createLinearGradient(
      0,
      groundY * K.FOG_TOP,
      0,
      groundY + H * K.FOG_EXT
    );

    fg.addColorStop(0, 'transparent');
    fg.addColorStop(0.5, t.treeFog);
    fg.addColorStop(1, 'transparent');

    ctx.save();

    // Apply horizontal movement
    ctx.translate(drift, 0);

    ctx.fillStyle = fg;

    // Fog band region
    ctx.fillRect(W * K.FOG_OFFSET_X, 0, W * K.FOG_WIDTH, H);

    ctx.restore();
  }

  // ─── GROUND FOG / BASE LAYER ─────────────────────────────────────────────
  _drawGround(ctx, W, H, K) 
  {
    const ground = ctx.createLinearGradient(0, H * K.GROUND_Y, 0, H);
    ground.addColorStop(0, 'transparent');
    ground.addColorStop(1, K.GROUND_COLOR);

    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, W, H);
  }
}