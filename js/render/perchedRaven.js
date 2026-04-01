class PerchedRaven extends BaseRenderer 
{
  constructor() 
  {
    super({
      RAVEN_SZ: 5,   // base size of raven
      BOB_AMP: 2,    // vertical bob amount
      BOB_FREQ: 2,   // bob speed
      OFFSET_X: 0.08  // horizontal offset from tree trunk
    });

    // local animation clock for bobbing motion
    this.time = 0;
  }

  update(dt) 
  {
    // advances animation time (kept small for stable sine motion)
    this.time += dt * 0.001;
  }

  draw(ctx, t, tree, pos, type) 
  {
    const K = TREE_CONST;

    // ─────────────────────────────────────────────
    // SIZE
    const s =
      this.cfg.RAVEN_SZ *
      (K.BIRD_SIZE_SCALE || 1.0);

    // ─────────────────────────────────────────────
    // DIRECTION (FIXED)
    // - deterministic per tree
    // - avoids repeating 50/50 patterns
    // - still stable across frames
    const side =
      K.BIRD_DIR_OVERRIDE !== null
        ? K.BIRD_DIR_OVERRIDE
        : (Math.sin(tree.seed * 999) > 0 ? 1 : -1);

    // ─────────────────────────────────────────────
    // POSITION (anchored to tree)
    const bx =
      tree.x +
      (tree.h * this.cfg.OFFSET_X * side);

    const by =
      tree.y -
      (tree.h * pos) +
      Math.sin(this.time * this.cfg.BOB_FREQ + tree.seed) *
      this.cfg.BOB_AMP;

    ctx.save();

    // move to bird position
    ctx.translate(bx, by);

    // flip based on direction
    ctx.scale(side, 1);

    ctx.fillStyle = t.ravenClose || '#000';

    this._renderShape(ctx, s, type);

    ctx.restore();
  }

  _renderShape(ctx, s, type) 
  {
    // ─────────────────────────────────────────────
    // HYBRID SHAPE (sharp stylized raven)
    if (type === 'HYBRID') 
    {
      ctx.beginPath();
      ctx.moveTo(s * 1.6, -s * 0.3);
      ctx.lineTo(s * 0.8, -s * 0.5);
      ctx.quadraticCurveTo(0, -s * 0.7, -s * 1.0, 0);
      ctx.lineTo(-s * 1.4, s * 1.2);
      ctx.lineTo(-s * 0.8, s * 1.2);
      ctx.quadraticCurveTo(s * 0.5, s * 1.0, s * 0.8, 0);
      ctx.closePath();
      ctx.fill();
    }

    // ─────────────────────────────────────────────
    // SILHOUETTE SHAPE (softer organic form)
    else if (type === 'SILHOUETTE') 
    {
      ctx.beginPath();
      ctx.moveTo(s * 1.5, -s * 0.2);
      ctx.quadraticCurveTo(s * 0.8, -s * 0.8, 0, -s * 0.6);
      ctx.quadraticCurveTo(-s * 0.5, -s * 0.2, -s * 0.8, s * 0.5);
      ctx.lineTo(-s * 1.2, s * 2.5);
      ctx.lineTo(-s * 0.5, s * 2.5);
      ctx.quadraticCurveTo(s * 0.5, s * 1.5, s * 0.8, s * 0.2);
      ctx.lineTo(s * 1.5, -s * 0.2);
      ctx.closePath();
      ctx.fill();
    }

    // ─────────────────────────────────────────────
    // DEFAULT SHAPE (simple layered bird form)
    else 
    {
      // body
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.6, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // head
      ctx.beginPath();
      ctx.arc(-s * 0.8, -s * 0.4, s * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // beak
      ctx.beginPath();
      ctx.moveTo(-s * 1.2, -s * 0.4);
      ctx.lineTo(-s * 1.7, -s * 0.3);
      ctx.lineTo(-s * 1.2, -s * 0.2);
      ctx.closePath();
      ctx.fill();
    }
  }
}