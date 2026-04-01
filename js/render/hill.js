class HillRenderer extends BaseRenderer 
{
  constructor() 
  {
    super({
      // ── POSITION / SCALE
      POS_X: 0.42, // horizontal position (% screen)
      POS_Y: 0.82, // vertical base (ground level)
      SCALE: 1.0,  // global size multiplier
      
      // ── HILL SIZE
      HILL_W_RATIO: 3.1, // width relative to base size
      HILL_H_RATIO: 1.3, // height relative to base size

      // ── HILL SHAPE (3 bezier segments, left → right)
      C1_X1:0.7,  C1_X2:0.45, C1_Y2:0.06, C1_X3:0.08,
      C2_X1:0.05, C2_X2:0.18, C2_Y2:0.03, C2_X3:0.38, C2_Y3:0.10,
      C3_X1:0.55, C3_Y1:0.18, C3_X2:0.80, C3_Y2:0.02,

      // ── ROAD WIDTH / STYLE
      ROAD_W_MULT: 0.03, // thickness of road
      ROAD_ALPHA: 0.7,

      // ── ROAD POINTS (main anchors)
      R0_X:0.62, R0_Y:0.02, // bottom start
      R1_X:0.28, R1_Y:0.16, // first bend
      R2_X:0.28, R2_Y:0.08, // second bend
      R3_X:0.02,            // top end

      // ── ROAD CURVE CONTROLS adjustable
      R0_CTRL_X: 0.1,
      R0_CTRL_Y: 0.06,

      R1_CTRL_X: 0.05,
      R1_CTRL_Y: 0.14,

      R2_CTRL_X: 0.1,
      R2_CTRL_Y: 0.04,

      // ── RIDGE LINE
      RIDGE_LINE_WIDTH: 2,
      RIDGE_ALPHA: 0.15,

      // ── FILL GRADIENT
      FILL_TOP_ALPHA: 0.95,
      FILL_MID_ALPHA: 0.98,
      FILL_BOT_ALPHA: 1.0,

      // ── OUTLINE (optional)
      OUTLINE_WIDTH: 0,
      OUTLINE_ALPHA: 0.2,

      // ── TOGGLES
      SHOW_RIDGE: true,
      SHOW_ROAD: true,

      // ── ARC SETTINGS (road dots)
      ARC_START: 0,
      ARC_END: Math.PI * 2,

      ROAD_CAP: 'round',
      ROAD_JOIN: 'round'
    });
  }

  update(dt) {}

  draw(ctx, W, H, t) 
  {
    if (!t) return;
    
    const d = this.getDims(W, H);
    const c = this.cfg;

    const s = d.w;          // base size scale
    const cx = d.x;         // center X
    const baseY = d.y;      // ground level
    
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

    // ── OUTLINE (optional)
    if (c.OUTLINE_WIDTH > 0)
    {
      ctx.strokeStyle = this._alpha(t.treeBase, c.OUTLINE_ALPHA);
      ctx.lineWidth = c.OUTLINE_WIDTH * s * 0.01;
      ctx.stroke();
    }

    // ── RIDGE LINE
    if (c.SHOW_RIDGE)
    {
      ctx.strokeStyle = this._alpha(t.skyGlow, c.RIDGE_ALPHA);
      ctx.lineWidth   = c.RIDGE_LINE_WIDTH;

      this._ridgePath(ctx, cx, hillW, hillTopY, s);
      ctx.stroke();
    }

    // ── ROAD
    if (c.SHOW_ROAD)
    {
      this._drawRoad(ctx, s, cx, baseY, hillW, hillTopY, t);
    }

    ctx.restore();
  }

  // ── MAIN HILL SHAPE
  _hillPath(ctx, cx, baseY, hillW, hillTopY, s) 
  {
    const c = this.cfg;

    ctx.beginPath();
    ctx.moveTo(cx - hillW, baseY);

    // left slope
    ctx.bezierCurveTo(
      cx - hillW*c.C1_X1, baseY,
      cx - hillW*c.C1_X2, hillTopY + s*c.C1_Y2,
      cx - hillW*c.C1_X3, hillTopY
    );

    // top ridge
    ctx.bezierCurveTo(
      cx + hillW*c.C2_X1, hillTopY,
      cx + hillW*c.C2_X2, hillTopY + s*c.C2_Y2,
      cx + hillW*c.C2_X3, hillTopY + s*c.C2_Y3
    );

    // right slope
    ctx.bezierCurveTo(
      cx + hillW*c.C3_X1, hillTopY + s*c.C3_Y1,
      cx + hillW*c.C3_X2, baseY - s*c.C3_Y2,
      cx + hillW, baseY
    );

    ctx.closePath();
  }

  // ── RIDGE LINE (top highlight)
  _ridgePath(ctx, cx, hillW, hillTopY, s) 
  {
    const c = this.cfg;

    ctx.beginPath();
    ctx.moveTo(cx - hillW*c.C1_X3, hillTopY);

    ctx.bezierCurveTo(
      cx + hillW*c.C2_X1,
      hillTopY,
      cx + hillW*c.C2_X2,
      hillTopY + s*c.C2_Y2,
      cx + hillW*c.C2_X3,
      hillTopY + s*c.C2_Y3
    );
  }

  // ── ROAD : all control points now configurable
  _drawRoad(ctx, s, cx, baseY, hillW, hillTopY, t) 
  {
    const c = this.cfg;

    const col   = this._alpha(t.treeBase, c.ROAD_ALPHA);
    const roadW = s * c.ROAD_W_MULT;

    // anchor points
    const p0 = { x: cx - hillW*c.R0_X, y: baseY - s*c.R0_Y };
    const p1 = { x: cx + hillW*c.R1_X, y: hillTopY + s*c.R1_Y };
    const p2 = { x: cx - hillW*c.R2_X, y: hillTopY + s*c.R2_Y };
    const p3 = { x: cx + hillW*c.R3_X, y: hillTopY };

    ctx.strokeStyle = col;
    ctx.lineWidth   = roadW;
    ctx.lineCap     = c.ROAD_CAP;
    ctx.lineJoin    = c.ROAD_JOIN;

    // segment 1
    ctx.beginPath();
    ctx.moveTo(p0.x,p0.y);
    ctx.quadraticCurveTo(
      cx - hillW*c.R0_CTRL_X,
      baseY - s*c.R0_CTRL_Y,
      p1.x,p1.y
    );
    ctx.stroke();

    // segment 2
    ctx.beginPath();
    ctx.moveTo(p1.x,p1.y);
    ctx.quadraticCurveTo(
      cx + hillW*c.R1_CTRL_X,
      hillTopY + s*c.R1_CTRL_Y,
      p2.x,p2.y
    );
    ctx.stroke();

    // segment 3
    ctx.beginPath();
    ctx.moveTo(p2.x,p2.y);
    ctx.quadraticCurveTo(
      cx - hillW*c.R2_CTRL_X,
      hillTopY + s*c.R2_CTRL_Y,
      p3.x,p3.y
    );
    ctx.stroke();

    // connection dots
    ctx.fillStyle = col;

    [p1, p2].forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x,p.y,roadW*0.8,c.ARC_START,c.ARC_END);
      ctx.fill();
    });
  }
}