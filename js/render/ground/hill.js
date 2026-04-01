class HillRenderer extends BaseRenderer 
{
  constructor() 
  {
    super({
      POS_X: 0.42,
      POS_Y: 0.82,
      SCALE: 1.0,
      HILL_W_RATIO: 3.1,
      HILL_H_RATIO: 1.3,

      // Shape Bezier Constants
      C1_X1:0.7,  C1_X2:0.45, C1_Y2:0.06, C1_X3:0.08,
      C2_X1:0.05, C2_X2:0.18, C2_Y2:0.03, C2_X3:0.38, C2_Y3:0.10,
      C3_X1:0.55, C3_Y1:0.18, C3_X2:0.80, C3_Y2:0.02,

      RIDGE_LINE_WIDTH: 2,
      RIDGE_ALPHA: 0.15,
      FILL_TOP_ALPHA: 0.95,
      FILL_MID_ALPHA: 0.98,
      FILL_BOT_ALPHA: 1.0,

      SHOW_RIDGE: true,
      SHOW_ROAD: true
    });

    // Initialize the road instance
    this.road = new Road();
  }

  // ADD THIS BLOCK
  update(dt) 
  {
    // Currently static, so we do nothing here.
    // This prevents the "is not a function" error.
  }

  draw(ctx, W, H, t) 
  {
    if (!t) return;
    
    const d = this.getDims(W, H);
    const c = this.cfg;

    const s = d.w;
    const cx = d.x;
    const baseY = d.y;
    
    const hillW = s * c.HILL_W_RATIO;
    const hillTopY = baseY - (s * c.HILL_H_RATIO);

    ctx.save();

    // ── HILL FILL
    const hillGrad = ctx.createLinearGradient(cx, hillTopY, cx, baseY);
    hillGrad.addColorStop(0,   this._alpha(t.treeMid,  c.FILL_TOP_ALPHA));
    hillGrad.addColorStop(0.5, this._alpha(t.treeBase, c.FILL_MID_ALPHA));
    hillGrad.addColorStop(1,   this._alpha(t.treeBase, c.FILL_BOT_ALPHA));

    ctx.fillStyle = hillGrad;
    this._hillPath(ctx, cx, baseY, hillW, hillTopY, s);
    ctx.fill();

    // ── RIDGE LINE
    if (c.SHOW_RIDGE)
    {
      ctx.strokeStyle = this._alpha(t.skyGlow, c.RIDGE_ALPHA);
      ctx.lineWidth = c.RIDGE_LINE_WIDTH;
      this._ridgePath(ctx, cx, hillW, hillTopY, s);
      ctx.stroke();
    }

    // ── ROAD (Delegate to the new class)
    if (c.SHOW_ROAD)
    {
      this.road.draw(ctx, s, cx, baseY, hillW, hillTopY, t);
    }

    ctx.restore();
  }

  _hillPath(ctx, cx, baseY, hillW, hillTopY, s) 
  {
    const c = this.cfg;
    ctx.beginPath();
    ctx.moveTo(cx - hillW, baseY);
    ctx.bezierCurveTo(cx - hillW*c.C1_X1, baseY, cx - hillW*c.C1_X2, hillTopY + s*c.C1_Y2, cx - hillW*c.C1_X3, hillTopY);
    ctx.bezierCurveTo(cx + hillW*c.C2_X1, hillTopY, cx + hillW*c.C2_X2, hillTopY + s*c.C2_Y2, cx + hillW*c.C2_X3, hillTopY + s*c.C2_Y3);
    ctx.bezierCurveTo(cx + hillW*c.C3_X1, hillTopY + s*c.C3_Y1, cx + hillW*c.C3_X2, baseY - s*c.C3_Y2, cx + hillW, baseY);
    ctx.closePath();
  }

  _ridgePath(ctx, cx, hillW, hillTopY, s) 
  {
    const c = this.cfg;
    ctx.beginPath();
    ctx.moveTo(cx - hillW*c.C1_X3, hillTopY);
    ctx.bezierCurveTo(cx + hillW*c.C2_X1, hillTopY, cx + hillW*c.C2_X2, hillTopY + s*c.C2_Y2, cx + hillW*c.C2_X3, hillTopY + s*c.C2_Y3);
  }
}