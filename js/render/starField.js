class StarField extends BaseRenderer {
  constructor(count) {
    super({ STAR_COUNT: count });
    this.stars = null;
    this.phase = 0;
  }

  update(dt) {
    this.phase += dt * 0.0012;
  }

  draw(ctx, W, H, t) {
    const K = SKY_CONST;
    if (!this.stars) this._init(K);

    const starColor = K.STAR_COLOR_OVERRIDE || t.skyGlow || '#fff';

    this.stars.forEach(s => {
      const b = (s.a + Math.sin(this.phase * (1 / s.speed) + s.twinkle) * K.STAR_TWINKLE) * K.STAR_OPACITY_SCALE;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fillStyle = this._alpha(starColor, Math.max(0, b));
      ctx.fill();
    });
  }

  _init(K) {
    this.stars = [];
    for (let i = 0; i < this.cfg.STAR_COUNT; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random() * K.STAR_Y_MAX,
        r: Math.random() * K.STAR_R_RANGE + K.STAR_R_MIN,
        a: Math.random() * K.STAR_A_RANGE + K.STAR_A_MIN,
        twinkle: Math.random() * Math.PI * 2,
        speed: K.STAR_SPEED_MIN + Math.random() * K.STAR_SPEED_RANGE,
      });
    }
  }
}