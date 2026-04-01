class BaseRenderer 
{
  constructor(config = {}) 
  {
    this.cfg = {
      POS_X:  0.5,
      POS_Y:  0.82,
      SCALE:  1.0,
      BASE_W: 0.25,
      BASE_H: 0.35,
      ...config
    };
  }

  _alpha(hex, a) 
  {
    if (!hex || hex[0] !== '#') return `rgba(0,0,0,${a})`;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  getDims(W, H) 
  {
    //  Find the "Reference Unit" (The smaller of the two screen sides)
    // This is the secret to resolution independence.
    const baseUnit = Math.min(W, H);
    
    const scale = this.cfg.SCALE || 1.0;

    //  Use BASE_UNIT for both width AND height.
    // Now, if W shrinks, the height shrinks too, keeping the ratio 1:1.
    const objW  = baseUnit * (this.cfg.BASE_W || 0.28) * scale;
    const objH  = baseUnit * (this.cfg.BASE_H || 0.40) * scale;

    //  Keep X and Y tied to screen percentages so they stay in the right spot
    let   cx    = W * (this.cfg.POS_X  || 0.5);
    const baseY = H * (this.cfg.POS_Y  || 0.82);

    //  Edge clamping (keeps objects from bleeding off the sides)
    const half  = objW * 0.5;
    if (cx + half > W) cx = W - half;
    if (cx - half < 0) cx = half;

    return { x: cx, y: baseY, w: objW, h: objH, scale };
  }
}