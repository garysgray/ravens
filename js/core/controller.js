class Controller 
{
  constructor() 
  {
    this.audio = new SceneAudio();
    this.scene = new Scene(this.audio);
    
    this.hud = new HUD(
      (id) => this.scene.setDensity(id),
      (id) => this.scene.setTime(id),
      ()   => this.audio.toggle(),
      ()   => this.audio.playClick()
    );

    // FIX: SceneAudio doesn't have .resume(), use .enable() or .toggle()
    document.addEventListener('click', () => {
      if (!this.audio.enabled) {
        this.audio.enable();
      }
    }, { once: true });
  }

  update(dt) 
  {
    this.scene.update(dt);
  }

  draw() 
  {
    this.scene.draw();
  }

  start(densityId, timeId) 
  {
    // Ensure these methods exist on your Scene class
    this.scene.setTime(timeId);
    this.scene.setDensity(densityId);
  }
}