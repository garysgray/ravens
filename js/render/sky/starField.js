// ─── Star Field Renderer ────────────────────────────────────────────────
// Renders a procedural star field with:
// - Randomized star positions
// - Twinkling animation via sine wave
// - Per-star speed variation
class StarField extends BaseRenderer 
{
  constructor(count) 
  {
    // Pass config into BaseRenderer (STAR_COUNT used in init)
    super({ STAR_COUNT: count });

    // Star data array (initialized lazily)
    this.stars = null;

    // Animation phase used for twinkle motion
    this.phase = 0;

    this._lastStarColor = null;
    this._parsedStar    = null;
  }

  // Called every frame
  update(dt) 
  {
    // Advance animation phase for sine-based twinkle
    this.phase += dt * 0.0012;
  }

  // Draw all stars
  draw(ctx, W, H, t) 
  {
    const K = SKY_CONST;

    // Lazy init so we only generate stars once
    if (!this.stars) this._init(K);

    // Base star color (can be overridden globally or by sky state)
    const starColor = K.STAR_COLOR_OVERRIDE || t.skyGlow || '#fff';

    if (starColor !== this._lastStarColor)
    {
      const r = parseInt(starColor.slice(1,3), 16);
      const g = parseInt(starColor.slice(3,5), 16);
      const b = parseInt(starColor.slice(5,7), 16);
      this._parsedStar    = { r, g, b };
      this._lastStarColor = starColor;
    }
    const ps = this._parsedStar;

    this.stars.forEach(s => 
    {
      // Twinkle calculation:
      // base alpha + sine wave variation scaled by global twinkle factor
      const b =
        (s.a +
          Math.sin(this.phase * (1 / s.speed) + s.twinkle) *
            K.STAR_TWINKLE) *
        K.STAR_OPACITY_SCALE;

      ctx.beginPath();

      // Draw star as small circle in normalized screen space
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);

      // Clamp alpha so it never goes negative (avoids invisible/invalid render)
      ctx.fillStyle = `rgba(${ps.r},${ps.g},${ps.b},${Math.max(0, b)})`;

      ctx.fill();
    });
  }

  // ─── STAR INITIALIZATION ────────────────────────────────────────────────
  _init(K) 
  {
    this.stars = [];

    // Create fixed number of stars based on config
    for (let i = 0; i < this.cfg.STAR_COUNT; i++) 
    {
      this.stars.push({
        // X position across full width
        x: Math.random(),

        // Y position limited to sky portion
        y: Math.random() * K.STAR_Y_MAX,

        // Random radius within range
        r: Math.random() * K.STAR_R_RANGE + K.STAR_R_MIN,

        // Base brightness
        a: Math.random() * K.STAR_A_RANGE + K.STAR_A_MIN,

        // Unique phase offset for twinkle variation
        twinkle: Math.random() * Math.PI * 2,

        // Individual speed multiplier (affects twinkle frequency)
        speed:
          K.STAR_SPEED_MIN + Math.random() * K.STAR_SPEED_RANGE,
      });
    }
  }
}