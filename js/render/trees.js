// ─── Tree Constants ────────────────────────────────────────────────────────────
const TREE_CONST = {
  TIME_SCALE: 0.001, 

  // --- INDIVIDUAL TREE PLACEMENT & SHAPE ---
  // To add a bird: { pos: height_on_tree (0.0-1.0), type: 'SHAPES' | 'SILHOUETTE' | 'HYBRID' }
  INSTANCES: [
    { 
      xMul: -0.9, yMul: -.6, hMul: 1.10, twMul: 0.06, seed: 12, 
      birds: [
        { pos: 0.5, type: 'SHAPES' },     // Geometric (Circle/Ellipse/Triangle)
        { pos: 0.7, type: 'SILHOUETTE' } // Matches rrrrrr.png exactly
      ] 
    },
    { 
      xMul:  0.5, yMul: -.6, hMul: 1.25, twMul: 0.08, seed: 45, 
      birds: [
        { pos: 0.4, type: 'HYBRID' },    // Silhouette head + Rounded body
        { pos: 0.8, type: 'SHAPES' }
      ] 
    },
    { xMul: -1.2, yMul:  -.6, hMul: 0.80, twMul: 0.04, seed: 89, birds: [{ pos: 0.6, type: 'SILHOUETTE' }] },
    { xMul:  1, yMul:  -.6, hMul: 0.70, twMul: 0.04, seed: 33, birds: [{ pos: 0.5, type: 'HYBRID' }] },
  ],

  // --- GLOBAL CUSTOMIZATION DIALS ---
  FOLIAGE_ALPHA_BASE: 0.18,   
  FOLIAGE_ALPHA_TOP:  0.20,   
  TRUNK_COLOR_OVERRIDE: null, 
  LEAF_COLOR_OVERRIDE:  null, 
  BIRD_SIZE_SCALE:    1.0,    
  BIRD_DIR_OVERRIDE:  null,   

  // --- FOLIAGE SHAPE LOGIC ---
  LAYER_TOP_OFFSET: 0.20,
  LAYER_HEIGHT:     0.80,
  CANOPY_SQUASH_Y:  0.65,
  CANOPY_BLOB_VAR:  0.20,

  // --- SWAY / ANIMATION ---
  SWAY_FREQ_Y:   0.8,
  SWAY_Y_FACTOR: 0.35,

  // --- TRUNK BÉZIER CURVES ---
  TRUNK_FLARE: 0.8,
  TRUNK_TOP:   0.5,
  TRUNK_CP1_Y: 0.3,
  TRUNK_CP2_Y: 0.7,

  // --- BRANCH LOGIC ---
  BRANCH_COUNT:   6,
  BRANCH_START:   0.3,
  BRANCH_RANGE:   0.6,
  BRANCH_LEN:     0.3,
  BRANCH_DECAY:   0.5,
  BRANCH_CURVE_X: 0.5,
  BRANCH_CURVE_Y: 0.2,
  BRANCH_END_Y:   0.4,

  // --- BIRD LOGIC ---
  BIRD_OFFSET_X: 0.08,
  BIRD_BOB_AMP:  2,
  BIRD_BOB_FREQ: 2,
};

class TreeRenderer extends BaseRenderer {
  constructor() {
    super({
      POS_Y: 0.82,
      SCALE: 1.5,
      SWAY_AMP: 4.0,
      SWAY_FREQ: 0.8,
      LEAF_LAYERS: 6,
      BLOB_COUNT: 4,
      CANOPY_WIDTH: 0.32,
    });
    this.time = 0;
  }

  update(dt) {
    this.time += dt * TREE_CONST.TIME_SCALE;
  }

  // Helper for the Scene to get tree data without drawing
  getTreeData(W, H) {
    const d = this.getDims(W, H);
    const s = d.w;
    return TREE_CONST.INSTANCES.map(cfg => ({
      x: d.x + s * cfg.xMul,
      y: d.y + s * cfg.yMul,
      h: s * cfg.hMul,
      tw: s * cfg.twMul,
      seed: cfg.seed,
      birds: cfg.birds,
    }));
  }

  draw(ctx, W, H, t) {
    if (!t) return;
    const trees = this.getTreeData(W, H);

    trees.forEach(tree => {
      ctx.save();
      this._drawTrunk(ctx, t, tree);
      this._drawFoliage(ctx, t, tree);
      this._drawBranches(ctx, t, tree);
      ctx.restore();
    });
  }

  _drawTrunk(ctx, t, tree) {
    const K = TREE_CONST;
    const tw = tree.tw;
    const trunkCol = K.TRUNK_COLOR_OVERRIDE || t.treeBase;
    const trunkMid = t.treeMid;

    const trg = ctx.createLinearGradient(tree.x - tw / 2, tree.y, tree.x + tw / 2, tree.y);
    trg.addColorStop(0, trunkCol);
    trg.addColorStop(0.5, trunkMid);
    trg.addColorStop(1, trunkCol);
    ctx.fillStyle = trg;

    ctx.beginPath();
    ctx.moveTo(tree.x - tw * K.TRUNK_FLARE, tree.y);
    ctx.bezierCurveTo(
      tree.x - tw, tree.y - tree.h * K.TRUNK_CP1_Y,
      tree.x - tw * K.TRUNK_TOP * 0.5, tree.y - tree.h * K.TRUNK_CP2_Y,
      tree.x - tw * K.TRUNK_TOP * 0.5, tree.y - tree.h
    );
    ctx.lineTo(tree.x + tw * K.TRUNK_TOP * 0.5, tree.y - tree.h);
    ctx.bezierCurveTo(
      tree.x + tw * K.TRUNK_TOP * 0.5, tree.y - tree.h * K.TRUNK_CP2_Y,
      tree.x + tw, tree.y - tree.h * K.TRUNK_CP1_Y,
      tree.x + tw * K.TRUNK_FLARE, tree.y
    );
    ctx.closePath();
    ctx.fill();
  }

  _drawFoliage(ctx, t, tree) {
    const c = this.cfg;
    const K = TREE_CONST;
    const leafCol = K.LEAF_COLOR_OVERRIDE || t.treeMid;
    const baseCol = K.TRUNK_COLOR_OVERRIDE || t.treeBase;

    for (let i = 0; i < c.LEAF_LAYERS; i++) {
      const pct = i / (c.LEAF_LAYERS - 1);
      const layerY = tree.y - (tree.h * K.LAYER_TOP_OFFSET) - (tree.h * K.LAYER_HEIGHT * pct);
      const layerR = tree.h * c.CANOPY_WIDTH * (1.1 - pct * 0.5);

      for (let j = 0; j < c.BLOB_COUNT; j++) {
        const angle = (j / c.BLOB_COUNT) * Math.PI * 2;
        const offX = Math.sin(this.time * c.SWAY_FREQ + j + tree.seed) * c.SWAY_AMP;
        const offY = Math.cos(this.time * c.SWAY_FREQ * K.SWAY_FREQ_Y + i) * (c.SWAY_AMP * K.SWAY_Y_FACTOR);
        const bx = tree.x + Math.cos(angle) * (layerR * 0.4) + offX;
        const by = layerY + Math.sin(angle) * (layerR * 0.2) + offY;
        const br = layerR * (0.7 + Math.sin(j * 1.5 + tree.seed) * K.CANOPY_BLOB_VAR);

        const a = K.FOLIAGE_ALPHA_BASE + pct * K.FOLIAGE_ALPHA_TOP;
        const cg = ctx.createRadialGradient(bx, by - br * 0.2, 0, bx, by, br);
        cg.addColorStop(0, this._alpha(leafCol, a));
        cg.addColorStop(1, this._alpha(baseCol, 0.05));

        ctx.beginPath();
        ctx.ellipse(bx, by, br, br * K.CANOPY_SQUASH_Y, 0, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
      }
    }
  }

  _drawBranches(ctx, t, tree) {
    const K = TREE_CONST;
    const branchCol = K.LEAF_COLOR_OVERRIDE || t.treeMid;
    ctx.strokeStyle = branchCol;
    ctx.lineCap = 'round';

    for (let i = 0; i < K.BRANCH_COUNT; i++) {
      const bPct = K.BRANCH_START + (i / K.BRANCH_COUNT) * K.BRANCH_RANGE;
      const bY = tree.y - (tree.h * bPct);
      const side = i % 2 === 0 ? 1 : -1;
      const bLen = tree.h * K.BRANCH_LEN * (1 - bPct * K.BRANCH_DECAY);

      ctx.lineWidth = tree.tw * (1 - bPct) * 0.6;
      ctx.beginPath();
      ctx.moveTo(tree.x, bY);
      ctx.quadraticCurveTo(
        tree.x + bLen * K.BRANCH_CURVE_X * side,
        bY - bLen * K.BRANCH_CURVE_Y,
        tree.x + bLen * side,
        bY - bLen * K.BRANCH_END_Y
      );
      ctx.stroke();
    }
  }
}
