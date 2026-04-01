// ─────────────────────────────────────────────
// THE INDIVIDUAL BIRD CLASS
// ─────────────────────────────────────────────
class CircleRaven 
{
  // Static defaults for easy global customization
  static DEFAULTS = 
  {
    wingUpScale: 2.0,
    wingDownScale: 2.0,
    bodyHeightScale: 0.5,
    bodyWidthScale: 2.0,
    wingPhaseStep: 0.05
  };

  constructor(index, totalInRing, ringConfig, birdOverride = {}) 
  {
    // Behavior & Visibility
    this.skip = birdOverride.skip || false;
    
    // Visual Overrides
    this.sizeMult = birdOverride.size || 1;
    this.alphaMult = birdOverride.alpha != null ? birdOverride.alpha : null;
    this.colorOverride = birdOverride.color || null;
    
    // Transformation Overrides
    this.angleOffset = birdOverride.angleOffset || 0;
    this.bodyTilt = birdOverride.bodyTilt || 0;
    
    // Animation Customization
    this.wingPhaseOffset = birdOverride.wingPhaseOffset || 0;
    this.wingPhaseStep = birdOverride.wingPhaseStep || CircleRaven.DEFAULTS.wingPhaseStep;
    
    // Shape Customization (Scaling factors for the silhouette)
    this.config = 
    {
      wingUp: birdOverride.wingUp || CircleRaven.DEFAULTS.wingUpScale,
      wingDown: birdOverride.wingDown || CircleRaven.DEFAULTS.wingDownScale,
      bodyHalf: birdOverride.bodyHalf || CircleRaven.DEFAULTS.bodyHeightScale,
      bodyWidth: birdOverride.bodyWidth || CircleRaven.DEFAULTS.bodyWidthScale
    };

    // Internal animation state
    this.wingPhase = ringConfig.wingOffset 
      ? (index / totalInRing) * Math.PI * 2 
      : 0;
  }

  update(dt, ringWingSpeed, globalSpeed) 
  {
    const m = dt * 0.06;
    const ws = (ringWingSpeed || 1.0) * globalSpeed;
    this.wingPhase += this.wingPhaseStep * ws * m;
  }

  draw(ctx, s) 
  {
    const wing = Math.sin(this.wingPhase + this.wingPhaseOffset);
    const wUp  = wing * s * this.config.wingUp;

    // body
    ctx.fillRect(-s, -s * this.config.bodyHalf, s * this.config.bodyWidth, s);

    // both wings in one path
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(0, -s * this.config.wingUp - wUp);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s * this.config.wingDown + wUp);
    ctx.closePath();
    ctx.fill();
  }
}
