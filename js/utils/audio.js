class SceneAudio 
{
  constructor() 
  {
    this.ctx       = null;
    this.enabled   = false;
    this.windGain  = null;
    this.callTimer = null;
  }

  enable() 
  {
    if (this.enabled) return;
    this.ctx     = new AudioContext();
    this.enabled = true;
    this._buildWind();
    this._scheduleCall();
    document.getElementById('sound-toggle').textContent = 'Mute Audio';
  }

  disable() 
  {
    if (!this.enabled) return;
    if (this.ctx) this.ctx.close();
    this.ctx     = null;
    this.enabled = false;
    clearTimeout(this.callTimer);
    document.getElementById('sound-toggle').textContent = 'Enable Audio';
  }

  toggle() 
  {
    this.enabled ? this.disable() : this.enable();
  }

  // _buildWind() 
  // {
  //   const buf  = this.ctx.createBuffer(1, this.ctx.sampleRate * 4, this.ctx.sampleRate);
  //   const data = buf.getChannelData(0);
  //   for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  //   const src  = this.ctx.createBufferSource();
  //   src.buffer = buf;
  //   src.loop   = true;

  //   const filter           = this.ctx.createBiquadFilter();
  //   filter.type            = 'lowpass';
  //   filter.frequency.value = CONFIG.audio.windFreq;
  //   filter.Q.value         = CONFIG.audio.windQ;

  //   this.windGain            = this.ctx.createGain();
  //   this.windGain.gain.value = 0.04;

  //   src.connect(filter);
  //   filter.connect(this.windGain);
  //   this.windGain.connect(this.ctx.destination);
  //   src.start();
  // }

  // _singleCaw(at) 
  // {
  //   if (!this.enabled || !this.ctx) return;
  //   const now = at || this.ctx.currentTime;

  //   // 1. Use a Sawtooth wave instead of Noise for harmonic grit
  //   const osc = this.ctx.createOscillator();
  //   osc.type = 'sawtooth'; 
  //   // Ravens are low: 400Hz - 600Hz base
  //   osc.frequency.setValueAtTime(CONFIG.audio.callFreq + (Math.random() * 100 - 50), now);
  //   // Slight pitch drop during the caw for realism
  //   osc.frequency.exponentialRampToValueAtTime(CONFIG.audio.callFreq * 0.8, now + 0.2);

  //   // 2. The "Grit" - Use an additional noise layer for the breathy scratch
  //   const noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
  //   const nData = noiseBuf.getChannelData(0);
  //   for (let i = 0; i < nData.length; i++) nData[i] = Math.random() * 2 - 1;
  //   const noise = this.ctx.createBufferSource();
  //   noise.buffer = noiseBuf;

  //   // 3. Filters: Narrow Bandpass to focus the "honk"
  //   const filter = this.ctx.createBiquadFilter();
  //   filter.type = 'bandpass';
  //   filter.frequency.value = CONFIG.audio.callFreq;
  //   filter.Q.value = 2.0; // Not too sharp, we want some body

  //   const gain = this.ctx.createGain();
  //   gain.gain.setValueAtTime(0, now);
  //   gain.gain.linearRampToValueAtTime(0.15, now + 0.05); // Fade in fast
  //   gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25); // Fade out

  //   // Connect both sources to the filter
  //   osc.connect(filter);
  //   noise.connect(filter);
  //   filter.connect(gain);
  //   gain.connect(this.ctx.destination);

  //   osc.start(now);
  //   noise.start(now);
  //   osc.stop(now + 0.3);
  //   noise.stop(now + 0.3);
  // }

  // _ravenCall() 
  // {
  //   if (!this.enabled || !this.ctx) return;
    
  //   // First caw
  //   this._singleCaw(this.ctx.currentTime);

  //   // Ravens often caw in rhythmic patterns
  //   if (Math.random() < 0.6) {
  //     const delay = 0.3 + Math.random() * 0.2;
  //     setTimeout(() => this._singleCaw(this.ctx.currentTime), delay * 1000);
      
  //     // Rare triple-caw
  //     if (Math.random() < 0.3) {
  //        setTimeout(() => this._singleCaw(this.ctx.currentTime), (delay + 0.4) * 1000);
  //     }
  //   }

  //   this._scheduleCall();
  // }

  // _scheduleCall() 
  // {
  //   const { min, range } = CONFIG.audio.callInterval;
  //   const delay = min + Math.random() * range;
  //   this.callTimer = setTimeout(() => this._ravenCall(), delay);
  // }

  playClick() 
  {
    if (!this.enabled || !this.ctx) return;
    const now  = this.ctx.currentTime;
    const buf  = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src  = this.ctx.createBufferSource();
    src.buffer = buf;

    const hp  = this.ctx.createBiquadFilter();
    hp.type   = 'highpass';
    hp.frequency.value = 2200;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.6, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    src.connect(hp); hp.connect(g); g.connect(this.ctx.destination);
    src.start(now);
  }
}
