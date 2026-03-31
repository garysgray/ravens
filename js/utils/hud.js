class HUD 
{
  constructor(onDensity, onTime, onSound, onClick) {
    this.el          = document.querySelector('.HUD');
    this.hideTimer   = null;
    this.onDensity   = onDensity;
    this.onTime      = onTime;
    this.onSound     = onSound;
    this.onClick     = onClick;

    this._bindButtons();
    this._initAutoHide();
  }

  _bindButtons() 
  {
    ['sparse', 'flock', 'swarm'].forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        this.onClick();
        ['sparse', 'flock', 'swarm'].forEach(b => document.getElementById(b).className = '');
        document.getElementById(id).className = 'active-gold';
        this.onDensity(id);
      });
    });

    ['dawn', 'midday', 'dusk'].forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        this.onClick();
        ['dawn', 'midday', 'dusk'].forEach(b => document.getElementById(b).className = '');
        document.getElementById(id).className = 'active-gold';
        this.onTime(id);
      });
    });

    document.getElementById('sound-toggle').addEventListener('click', () => {
      this.onSound();
    });
  }

  _initAutoHide() 
  {
    this.el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._show();
        document.addEventListener('mousemove',  () => this._show());
        document.addEventListener('touchstart', () => this._show());
        document.addEventListener('touchmove',  () => this._show());
      });
    });
  }

  _show() 
  {
    this.el.style.opacity       = '1';
    this.el.style.pointerEvents = 'auto';
    this.el.style.transform     = 'translateX(-50%) translateY(0)';
    document.body.style.cursor  = 'crosshair';
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this._hide(), 3500);
  }

  _hide() 
  {
    this.el.style.opacity       = '0';
    this.el.style.pointerEvents = 'none';
    document.body.style.cursor  = 'none';
  }
}
