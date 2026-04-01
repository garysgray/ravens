class Road 
{
  static DEFAULTS = 
  {
    ALPHA: 0.7,
    WIDTH_MULT: 0.03,
    CAP: 'round',
    JOIN: 'round',
    
    // Anchor Points (R0-R3)
    R0: { x: 0.62, y: 0.02 }, // bottom start
    R1: { x: 0.28, y: 0.16 }, // first bend
    R2: { x: 0.28, y: 0.08 }, // second bend
    R3: { x: 0.02, y: 0.00 }, // top end
    
    // Control Points
    C0: { x: 0.10, y: 0.06 },
    C1: { x: 0.05, y: 0.14 },
    C2: { x: 0.10, y: 0.04 }
  };

  constructor(roadOverride = {}) 
  {
    this.cfg = { ...Road.DEFAULTS, ...roadOverride };
  }

  draw(ctx, s, cx, baseY, hillW, hillTopY, theme) 
  {
    const c = this.cfg;
    const col = this._alpha(theme.treeBase, c.ALPHA);
    const roadW = s * c.WIDTH_MULT;

    // Map internal coordinates to screen coordinates
    const p0 = { x: cx - hillW * c.R0.x, y: baseY - s * c.R0.y };
    const p1 = { x: cx + hillW * c.R1.x, y: hillTopY + s * c.R1.y };
    const p2 = { x: cx - hillW * c.R2.x, y: hillTopY + s * c.R2.y };
    const p3 = { x: cx + hillW * c.R3.x, y: hillTopY + s * c.R3.y };

    ctx.save();
    ctx.strokeStyle = col;
    ctx.lineWidth = roadW;
    ctx.lineCap = c.CAP;
    ctx.lineJoin = c.JOIN;

    // Segment 1
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.quadraticCurveTo(
      cx - hillW * c.C0.x,
      baseY - s * c.C0.y,
      p1.x, p1.y
    );
    ctx.stroke();

    // Segment 2
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(
      cx + hillW * c.C1.x,
      hillTopY + s * c.C1.y,
      p2.x, p2.y
    );
    ctx.stroke();

    // Segment 3
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.quadraticCurveTo(
      cx - hillW * c.C2.x,
      hillTopY + s * c.C2.y,
      p3.x, p3.y
    );
    ctx.stroke();

    // Connection dots (elbows)
    ctx.fillStyle = col;
    [p1, p2].forEach(p => 
    {
      ctx.beginPath();
      ctx.arc(p.x, p.y, roadW * 0.8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  // Helper for alpha if not extending BaseRenderer directly
  _alpha(color, a) 
  {
    if (color.startsWith('#')) 
    {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return color;
  }
}