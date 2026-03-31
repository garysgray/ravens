class PerchedRaven extends BaseRenderer {
  constructor() {
    super({
      RAVEN_SZ: 5,
      BOB_AMP: 2,
      BOB_FREQ: 2,
      OFFSET_X: 0.08
    });
    this.time = 0;
  }

  update(dt) {
    this.time += dt * 0.001; // Matches tree time scale
  }

  // We pass the tree object so the raven knows exactly where its "home" tree is
  draw(ctx, t, tree, pos, type) {
    const K = TREE_CONST;
    const s = this.cfg.RAVEN_SZ * (K.BIRD_SIZE_SCALE || 1.0);
    const side = K.BIRD_DIR_OVERRIDE !== null ? K.BIRD_DIR_OVERRIDE : (tree.seed % 2 === 0 ? 1 : -1);
    
    // Calculate position based on the tree's current coordinates
    const bx = tree.x + (tree.h * this.cfg.OFFSET_X * side);
    const by = tree.y - (tree.h * pos) + Math.sin(this.time * this.cfg.BOB_FREQ + tree.seed) * this.cfg.BOB_AMP;

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(side, 1);
    ctx.fillStyle = t.ravenClose || '#000';

    this._renderShape(ctx, s, type);

    ctx.restore();
  }

  _renderShape(ctx, s, type) {
    if (type === 'HYBRID') {
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
    else if (type === 'SILHOUETTE') {
      ctx.beginPath();
      ctx.moveTo(s * 1.5, -s * 0.2); 
      ctx.quadraticCurveTo(s * 0.8, -s * 0.8, 0, -s * 0.6);
      ctx.quadraticCurveTo(-s * 0.5, -s * 0.2, -s * 0.8, s * 0.5);
      ctx.lineTo(-s * 1.2, s * 2.5);
      ctx.lineTo(-s * 0.5, s * 2.5);
      ctx.quadraticCurveTo(s * 0.5, s * 1.5, s * 0.8, s * 0.2);
      ctx.lineTo(s * 1.5, -s * 0.2);
      ctx.fill();
    } 
    else {
      // DEFAULT / SHAPES
      ctx.beginPath();
      ctx.ellipse(0, 0, s, s * 0.6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-s * 0.8, -s * 0.4, s * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-s * 1.2, -s * 0.4);
      ctx.lineTo(-s * 1.7, -s * 0.3);
      ctx.lineTo(-s * 1.2, -s * 0.2);
      ctx.fill();
    }
  }
}