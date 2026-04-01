class Scene 
{
  constructor(audio) 
  {
    this.audio = audio;

    // --- SKY SYSTEMS (BACKGROUND LAYER) ---
    this.skyBg  = new SkyBackground();
    this.stars  = new StarField(160);
    this.clouds = new CloudSystem({
      CLOUD_COUNT: 6,
      CLOUD_SPEED: 0.0004,
      CLOUD_STRETCH: 4.0,
      CLOUD_MIN_SZ: 0.08
    });

    // --- ENVIRONMENT (MID LAYERS) ---
    this.trees = new TreeRenderer();
    this.perchedRavens = new PerchedRaven();

    this.mountains = new MountainRangeRenderer();
    this.hill = new HillRenderer();
    this.house = new HouseRenderer();

    // --- RAVEN SYSTEMS (CHARACTERS) ---
    this.ravens = new RavenSystem();
    this.ravenSide = new RavenSideRenderer();
    this.circles = new RavenCircles('raven-circles-canvas');

    this._currentTime = 'dawn';

    // --- CANVAS REFERENCES ---
    this.skyCanvas = document.getElementById('sky-canvas');
    this.skyCtx = this.skyCanvas?.getContext('2d');

    this.sideCanvas = document.getElementById('raven-side-canvas');
    this.sideCtx = this.sideCanvas?.getContext('2d');

    this.noiseCanvas = document.getElementById('noise');
    this.noiseCtx = this.noiseCanvas?.getContext('2d');

    // --- INIT ---
    this._resize();

    // Safe resize binding (keeps correct "this")
    window.addEventListener('resize', () => this._resize());
  }

  // ─────────────────────────────────────────────────────────────
  // TIME CONTROL
  // ─────────────────────────────────────────────────────────────
  setTime(id) 
  {
    this._currentTime = id;

    // Notify systems that depend on time state
    [this.house, this.ravens, this.ravenSide].forEach(s => {
      if (s && typeof s.setTime === 'function') {
        s.setTime(id);
      }
    });
  }

  setDensity(id) 
  { 
    if (this.ravens && typeof this.ravens.setDensity === 'function') {
      this.ravens.setDensity(id);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESIZE HANDLER
  // ─────────────────────────────────────────────────────────────
  _resize() 
  {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Resize all canvases safely
    [this.skyCanvas, this.sideCanvas, this.noiseCanvas].forEach(c => {
      if (c) {
        c.width = w;
        c.height = h;
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE LOOP (SIMULATION)
  // ─────────────────────────────────────────────────────────────
  update(dt) 
  {
    // SKY LAYERS
    this.skyBg.update(dt);
    this.stars.update(dt);
    this.clouds.update(dt);

    // WORLD LAYERS
    this.hill.update(dt);
    this.house.update(dt);
    this.trees.update(dt);
    this.circles.update(dt);

    // RAVEN SYSTEMS
    this.ravens.update(dt);
    this.ravenSide.update(dt);
    this.perchedRavens.update(dt);
  }

  // ─────────────────────────────────────────────────────────────
  // DRAW LOOP (RENDERING)
  // ─────────────────────────────────────────────────────────────
  draw() 
  {
    const t = CONFIG.time[this._currentTime];
    const W = window.innerWidth;
    const H = window.innerHeight;

    // =========================
    // MAIN SKY + WORLD CANVAS
    // =========================
    if (this.skyCtx) 
    {
      this.skyCtx.clearRect(0, 0, W, H);

      // BACKGROUND → FOREGROUND ORDER
      this.skyBg.draw(this.skyCtx, W, H, t);

      if (this._currentTime !== 'midday') {
        this.stars.draw(this.skyCtx, W, H, t);
      }

      this.clouds.draw(this.skyCtx, W, H, t);
      this.mountains.draw(this.skyCtx, W, H, t);
      this.hill.draw(this.skyCtx, W, H, t);

      // Trees first (they define bird anchor points)
      this.trees.draw(this.skyCtx, W, H, t);

      // Perched ravens tied to tree data
      const treeData = this.trees.getTreeData(W, H);
      if (Array.isArray(treeData)) 
      {
        treeData.forEach(tree => {
          if (tree?.birds) {
            tree.birds.forEach(bird => {
              this.perchedRavens.draw(
                this.skyCtx,
                t,
                tree,
                bird.pos,
                bird.type
              );
            });
          }
        });
      }

      // House + flying ravens last (foreground)
      this.house.draw(this.skyCtx, W, H, t);
      this.ravens.draw();
    }

    // =========================
    // SIDE VIEW CANVAS
    // =========================
    if (this.sideCtx) 
    {
      this.sideCtx.clearRect(0, 0, W, H);
      this.ravenSide.draw(this.sideCtx, W, H, t);
    }

    // =========================
    // RAVEN CIRCLES LAYER
    // =========================
    if (this.circles) 
    {
      this.circles.clear();
      this.circles.drawBack(t);
      this.circles.drawFront(t);
    }

    // STATIC NOISE OVERLAY
    this._drawNoise();
  }

  // ─────────────────────────────────────────────────────────────
  // NOISE LAYER (VISUAL EFFECT)
  // ─────────────────────────────────────────────────────────────
  _drawNoise() 
  {
    if (!this.noiseCtx || !this.noiseCanvas) return;

    const W = this.noiseCanvas.width;
    const H = this.noiseCanvas.height;

    const idata = this.noiseCtx.createImageData(W, H);
    const data = idata.data;

    for (let i = 0; i < data.length; i += 4) 
    {
      const v = Math.random() * 255;

      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;

      // Alpha controls intensity of noise
      // lower = subtle grain, higher = heavy static
      data[i + 3] = 6;
    }

    this.noiseCtx.putImageData(idata, 0, 0);
  }
}