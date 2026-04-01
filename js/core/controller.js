class Controller 
{
  constructor() 
  {
    // AUDIO SYSTEM
    this.audio = new SceneAudio();

    // MAIN SCENE (ALL RENDER + UPDATE LOGIC)
    this.scene = new Scene(this.audio);

    // HUD (UI CONTROL LAYER)
    // - density change callback
    // - time change callback
    // - audio toggle
    // - click sound
    this.hud = new HUD(
      (id) => this.scene.setDensity(id),
      (id) => this.scene.setTime(id),
      ()   => this.audio.toggle(),
      ()   => this.audio.playClick()
    );

    // AUDIO AUTOSTART SAFETY
    // Most browsers block audio until user interaction
    document.addEventListener(
      'click',
      () => {
        if (this.audio && !this.audio.enabled) {
          // SceneAudio uses enable(), NOT resume()
          this.audio.enable();
        }
      },
      { once: true }
    );
  }

  // ─────────────────────────────────────────────────────────────
  // GAME LOOP UPDATE
  // ─────────────────────────────────────────────────────────────
  update(dt) 
  {
    if (this.scene && typeof this.scene.update === 'function') {
      this.scene.update(dt);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // GAME LOOP DRAW
  // ─────────────────────────────────────────────────────────────
  draw() 
  {
    if (this.scene && typeof this.scene.draw === 'function') {
      this.scene.draw();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // INITIAL GAME STATE SETUP
  // ─────────────────────────────────────────────────────────────
  start(densityId, timeId) 
  {
    // Set initial scene state safely
    if (this.scene) 
    {
      if (typeof this.scene.setTime === 'function') {
        this.scene.setTime(timeId);
      }

      if (typeof this.scene.setDensity === 'function') {
        this.scene.setDensity(densityId);
      }
    }
  }
}