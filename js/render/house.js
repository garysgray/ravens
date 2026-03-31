class HouseRenderer extends BaseRenderer 
{
  constructor() 
  {
    super({ POS_X: 0.46, POS_Y: 0.70, SCALE: 0.4 });
    
    this.time = 'dawn';
    this.phase = 0;

    // NEW: independent scaling
    this.scaleX = 2.6;
    this.scaleY = 1.5;

    this.C = {
      ATTIC_SCALE: 0.58,
      ATTIC_HEIGHT_SCALE: 0.38,
      ROOF_PEAK_SCALE: 0.82,
      LEFT_WING_WIDTH: 0.17,
      LEFT_WING_HEIGHT: 0.72,
      LEFT_WING_OFFSET: 0.14,
      LEFT_WING_PEAK_X: 0.085,
      LEFT_WING_PEAK_Y: 1.02,
      RIGHT_WING_WIDTH: 0.13,
      RIGHT_WING_HEIGHT: 0.68,
      RIGHT_WING_PEAK_X: 0.065,
      RIGHT_WING_PEAK_Y: 0.96,
      TURRET_WIDTH: 0.075,
      TURRET_HEIGHT: 0.88,
      TURRET_OFFSET: 0.13,
      TURRET_PEAK: 0.44,
      WINDOW_W1: 0.055,
      WINDOW_W2: 0.065,
      WINDOW_H1: 0.15,
      WINDOW_H2: 0.17,
      ATTIC_WIN_X: 0.42,
      ATTIC_WIN_Y: 0.27,
      GLOW_FREQUENCY: 3,
      GLOW_AMPLITUDE: 0.06,
      GLOW_BASE: 0.18,
      GLOW_MIDDAY: 0.07,
      GLOW_RADIUS_MULT: 2.2,
      GLOW_FILL_EXPAND: 3,
      GLOW_ALPHA: 0.10,
      PHASE_SPEED: 0.0004 
    };
  }

  setTime(id) { this.time = id; }

  update(dt) 
  {
    this.phase += dt * this.C.PHASE_SPEED;
  }

  draw(ctx, W, H, t) 
  {
    if (!t) return;
    ctx.save();

    const d = this.getDims(W, H);

    // UPDATED: independent scaling
    const hw = d.w * this.scaleX;
    const hh = d.w * 1.1 * this.scaleY;

    const hx = d.x - hw * 0.5;

    // UPDATED: keep horizon alignment correct with Y scaling
    const hy = d.y - (hh * (1.2 / 1.1)); 

    // Main body
    ctx.fillStyle = t.houseBase;
    ctx.fillRect(hx, hy - hh, hw, hh);

    // Attic
    const atticW = hw * this.C.ATTIC_SCALE;
    const atticH = hh * this.C.ATTIC_HEIGHT_SCALE;
    const atticX = hx + hw * 0.21;
    const atticY = hy - hh - atticH;
    ctx.fillRect(atticX, atticY, atticW, atticH);

    // Roof peak
    ctx.beginPath();
    ctx.moveTo(atticX - hw * 0.03, atticY);
    ctx.lineTo(atticX + atticW * 0.5, hy - hh - hh * this.C.ROOF_PEAK_SCALE);
    ctx.lineTo(atticX + atticW + hw * 0.03, atticY);
    ctx.closePath();
    ctx.fillStyle = t.houseBase;
    ctx.fill();

    // Left wing
    ctx.fillStyle = t.houseMid;
    const lwW = hw * this.C.LEFT_WING_WIDTH;
    const lwH = hh * this.C.LEFT_WING_HEIGHT;
    const lwX = hx - hw * this.C.LEFT_WING_OFFSET;
    ctx.fillRect(lwX, hy - lwH, lwW, lwH);

    ctx.beginPath();
    ctx.moveTo(lwX, hy - lwH);
    ctx.lineTo(lwX + hw * this.C.LEFT_WING_PEAK_X, hy - hh * this.C.LEFT_WING_PEAK_Y);
    ctx.lineTo(lwX + lwW, hy - lwH);
    ctx.closePath();
    ctx.fill();

    // Right wing
    const rwW = hw * this.C.RIGHT_WING_WIDTH;
    const rwH = hh * this.C.RIGHT_WING_HEIGHT;
    const rwX = hx + hw;
    ctx.fillRect(rwX, hy - rwH, rwW, rwH);

    ctx.beginPath();
    ctx.moveTo(rwX, hy - rwH);
    ctx.lineTo(rwX + hw * this.C.RIGHT_WING_PEAK_X, hy - hh * this.C.RIGHT_WING_PEAK_Y);
    ctx.lineTo(rwX + rwW, hy - rwH);
    ctx.closePath();
    ctx.fill();

    // Turret
    const tx = hx + hw + hw * this.C.TURRET_OFFSET;
    const tw = hw * this.C.TURRET_WIDTH;
    const th = hh * this.C.TURRET_HEIGHT;
    ctx.fillStyle = t.houseBase;
    ctx.fillRect(tx, hy - th, tw, th);

    ctx.beginPath();
    ctx.moveTo(tx - tw * 0.12, hy - th);
    ctx.lineTo(tx + tw * 0.5, hy - th - th * this.C.TURRET_PEAK);
    ctx.lineTo(tx + tw + tw * 0.12, hy - th);
    ctx.closePath();
    ctx.fill();

    // Windows
    const wins = [
      {x: hx + hw * 0.07, y: hy - hh * 0.32, w: hw * this.C.WINDOW_W1, h: hh * this.C.WINDOW_H1},
      {x: hx + hw * 0.18, y: hy - hh * 0.32, w: hw * this.C.WINDOW_W1, h: hh * this.C.WINDOW_H1},
      {x: hx + hw * 0.40, y: hy - hh * 0.38, w: hw * this.C.WINDOW_W2, h: hh * this.C.WINDOW_H2},
      {x: hx + hw * 0.55, y: hy - hh * 0.38, w: hw * this.C.WINDOW_W2, h: hh * this.C.WINDOW_H2},
      {x: hx + hw * 0.69, y: hy - hh * 0.32, w: hw * this.C.WINDOW_W1, h: hh * this.C.WINDOW_H1},
      {
        x: atticX + atticW * this.C.ATTIC_WIN_X,
        y: hy - hh - hh * this.C.ATTIC_WIN_Y,
        w: hw * this.C.WINDOW_W1,
        h: hh * 0.12
      },
    ];

    wins.forEach(w => 
    {
      const bright = this.time === 'midday'
        ? this.C.GLOW_MIDDAY
        : this.C.GLOW_BASE + Math.sin(this.phase * this.C.GLOW_FREQUENCY + w.x) * this.C.GLOW_AMPLITUDE;

      const wg = ctx.createRadialGradient(
        w.x + w.w / 2, w.y + w.h / 2, 0,
        w.x + w.w / 2, w.y + w.h / 2, w.w * this.C.GLOW_RADIUS_MULT
      );

      wg.addColorStop(0, this._alpha(t.skyGlow, bright));
      wg.addColorStop(1, 'transparent');

      ctx.fillStyle = wg;
      ctx.fillRect(
        w.x - w.w, 
        w.y - w.h, 
        w.w * this.C.GLOW_FILL_EXPAND, 
        w.h * this.C.GLOW_FILL_EXPAND
      );

      ctx.fillStyle = this._alpha(t.skyGlow, this.C.GLOW_ALPHA);
      ctx.fillRect(w.x, w.y, w.w, w.h);
    });

    ctx.restore();
  }
}