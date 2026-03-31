// ─── Sky Constants ────────────────────────────────────────────────────────────
const SKY_CONST = {
  PHASE_SPEED: 0.0004,
  STAR_COLOR_OVERRIDE:  null,
  CLOUD_COLOR_OVERRIDE: null,
  STAR_OPACITY_SCALE:   1.0,
  CLOUD_OPACITY_SCALE:  1.0,

  SKY_H: 0.75,
  SKY_MID_STOP: 0.55,

  GLOW_X_DEFAULT: 0.5,
  GLOW_Y_DEFAULT: 0.55,
  GLOW_RADIUS: 0.45,
  GLOW_BASE: 0.22,
  GLOW_PULSE: 0.03,
  GLOW_MID_ALPHA: 0.10,

  GROUND_Y: 0.75,
  GROUND_COLOR: 'rgba(2,1,1,1)',

  STAR_Y_MAX: 0.55,
  STAR_R_MIN: 0.2,
  STAR_R_RANGE: 0.8,
  STAR_A_MIN: 0.1,
  STAR_A_RANGE: 0.5,
  STAR_SPEED_MIN: 0.003,
  STAR_SPEED_RANGE: 0.006,
  STAR_TWINKLE: 0.15,

  CLOUD_ALPHA: 0.08,
  CLOUD_PHASE_SCALE: 20,
  CLOUD_SPEED_BASE: 0.8,
  CLOUD_SPEED_STEP: 0.4,
  CLOUD_SIZE_VARIANCE: 0.000015,
  CLOUD_X_SPACING: 0.3,
  CLOUD_Y_SPACING: 0.08,
  CLOUD_Y_OFFSET: 0.02,
  CLOUD_PUFF_COUNT: 3,
  CLOUD_PUFF_SPACING: 0.25,
  CLOUD_PUFF_SWAY: 0.1,

  FOG_GROUND_Y: 0.82,
  FOG_DRIFT_FREQ: 0.8,
  FOG_DRIFT_AMP: 0.03,
  FOG_TOP: 0.88,
  FOG_EXT: 0.04,
  FOG_OFFSET_X: -0.1,
  FOG_WIDTH: 1.2,
};

// ─── Theme & Density Config ───────────────────────────────────────────────────
const CONFIG = {
  density: {
    sparse: { close: 8,  mid: 22,  far: 60,  label: 'sparse' },
    flock:  { close: 20, mid: 60,  far: 150, label: 'flock'  },
    swarm:  { close: 45, mid: 130, far: 320, label: 'swarm'  },
  },

  time: {
  dawn: {
    skyTop:'#241f40',
    skyMid:'#443660',
    skyHor:'#d88438',
    skyGlow:'#f0b870',
    glowX:0.38, glowY:0.68,

    treeBase:'#22160a',
    treeMid:'#4a3218',
    treeFog:'rgba(130,70,30,0.40)',

    houseBase:'#1a140c',
    houseMid:'#2e2418',

    ravenFar:'rgba(45,28,10,0.60)',
    ravenMid:'rgba(30,18,6,0.82)',
    ravenClose:'rgba(15,8,2,0.97)',
  },

  midday: {
    skyTop:'#3a5a78',
    skyMid:'#5f7f98',
    skyHor:'#9fb3c8',
    skyGlow:'#e8f4ff',
    glowX:0.5, glowY:0.08,

    treeBase:'#1e2c1e',
    treeMid:'#3a523a',
    treeFog:'rgba(140,165,185,0.30)',

    houseBase:'#1c2228',
    houseMid:'#384450',

    ravenFar:'rgba(15,20,25,0.50)',
    ravenMid:'rgba(8,12,16,0.78)',
    ravenClose:'rgba(3,5,8,0.98)',
  },

  dusk: {
    skyTop:'#201030',
    skyMid:'#542038',
    skyHor:'#e04810',
    skyGlow:'#ff6a30',
    glowX:0.65, glowY:0.72,

    treeBase:'#220a08',
    treeMid:'#4e1a10',
    treeFog:'rgba(150,45,15,0.42)',

    houseBase:'#140706',
    houseMid:'#2a0e08',

    ravenFar:'rgba(50,15,8,0.55)',
    ravenMid:'rgba(32,8,3,0.82)',
    ravenClose:'rgba(14,3,0,0.97)',
  },
},

  audio: {
    wingFreq:     420,
    wingQ:        2.2,
    callFreq:     800,
    windFreq:     200,
    windQ:        0.4,
    callInterval: { min: 4000, range: 8000 },
  },
};