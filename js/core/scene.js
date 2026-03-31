class Scene 
{
  constructor(audio) 
  {
    this.audio = audio;
    
    // --- 1. Sky Siblings (The Split Classes) ---
    this.skyBg  = new SkyBackground();
    this.stars  = new StarField(160);
    this.clouds = new CloudSystem({
      CLOUD_COUNT: 6,
      CLOUD_SPEED: 0.0004,
      CLOUD_STRETCH: 4.0,
      CLOUD_MIN_SZ: 0.08
    });

    this.trees = new TreeRenderer();
    this.perchedRavens = new PerchedRaven(); // The new sibling

    // --- 2. Environment Siblings ---
    this.mountains = new MountainRangeRenderer();
    this.hill = new HillRenderer();
    this.house = new HouseRenderer();
    
    // --- 3. Raven Systems ---
    this.ravens = new RavenSystem();
    this.ravenSide = new RavenSideRenderer();
    this.circles = new RavenCircles('raven-circles-canvas');

    this._currentTime = 'dawn';

    // Canvas references
    this.skyCanvas = document.getElementById('sky-canvas');
    this.skyCtx = this.skyCanvas?.getContext('2d');
    
    this.sideCanvas = document.getElementById('raven-side-canvas');
    this.sideCtx = this.sideCanvas?.getContext('2d');
    
    this.noiseCanvas = document.getElementById('noise');
    this.noiseCtx = this.noiseCanvas?.getContext('2d');

    // Init & Listeners
    this._resize();
    // Arrow function prevents "this._resize is not a function" error
    window.addEventListener('resize', () => this._resize());
  }

  setTime(id) 
  {
    this._currentTime = id;
    // Notify siblings that care about time
    [this.house, this.ravens, this.ravenSide].forEach(s => {
      if (s.setTime) s.setTime(id);
    });
  }

  setDensity(id) 
  { 
    if (this.ravens.setDensity) this.ravens.setDensity(id); 
  }

  _resize() 
  {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    [this.skyCanvas, this.sideCanvas, this.noiseCanvas].forEach(c => {
      if (c) { 
        c.width = w; 
        c.height = h; 
      }
    });
  }

  update(dt) 
  {
    // Update Sky Logic
    this.skyBg.update(dt);
    this.stars.update(dt);
    this.clouds.update(dt);

    // Update World Logic
    this.hill.update(dt);
    this.house.update(dt);
    this.trees.update(dt);
    this.circles.update(dt);
    this.ravens.update(dt);
    this.ravenSide.update(dt);
    this.perchedRavens.update(dt);
  }

  draw() 
{
  const t = CONFIG.time[this._currentTime];
  const W = window.innerWidth;
  const H = window.innerHeight;

  // --- Main Canvas Draw (Sky + World) ---
  if (this.skyCtx) {
    this.skyCtx.clearRect(0, 0, W, H);

    // Order: Background -> Stars -> Clouds -> Mountains -> Hill -> Trees
    this.skyBg.draw(this.skyCtx, W, H, t);

    if (this._currentTime !== 'midday') {
      this.stars.draw(this.skyCtx, W, H, t);
    }

    this.clouds.draw(this.skyCtx, W, H, t);
    this.mountains.draw(this.skyCtx, W, H, t);
    this.hill.draw(this.skyCtx, W, H, t);
    
    // 1. Draw the actual Trees
    this.trees.draw(this.skyCtx, W, H, t);

    // 2. Draw the Perched Ravens sitting in those trees
    // We grab the positions from the trees so the birds move with the sway
    const treeData = this.trees.getTreeData(W, H);
    treeData.forEach(tree => {
      if (tree.birds) {
        tree.birds.forEach(bird => {
          this.perchedRavens.draw(this.skyCtx, t, tree, bird.pos, bird.type);
        });
      }
    });

    // 3. Draw the House and Flying Ravens on top
    this.house.draw(this.skyCtx, W, H, t);
    this.ravens.draw();
  }

  // --- Side Canvas Draw ---
  if (this.sideCtx) {
    this.sideCtx.clearRect(0, 0, W, H);
    this.ravenSide.draw(this.sideCtx, W, H, t);
  }

  // --- Raven Circles Canvas ---
  if (this.circles) {
    this.circles.clear();
    this.circles.drawBack(t);
    this.circles.drawFront(t);
  }

  this._drawNoise();
}

  _drawNoise() 
{
  if (!this.noiseCtx) return;
  const W = this.noiseCanvas.width;
  const H = this.noiseCanvas.height;
  const idata = this.noiseCtx.createImageData(W, H);
  const data = idata.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = data[i+1] = data[i+2] = v;
    
    // --- TURN IT DOWN HERE ---
    // 15 is "Heavy Static"
    // 8 is "Subtle Grain"
    // 4 is "Barely Noticeable"
    data[i+3] = 6; 
  }
  this.noiseCtx.putImageData(idata, 0, 0);
}
}