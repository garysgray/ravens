// ─── HUD Controller ───────────────────────────────────────────────────────────
// Handles:
// - Density selection (sparse / flock / swarm)
// - Time of day selection (dawn / midday / dusk)
// - Sound toggle
// - Auto-hide UI behavior based on inactivity
class HUD 
{
  constructor(onDensity, onTime, onSound, onClick) 
  {
    this.el        = document.querySelector('.HUD');
    this.hideTimer = null;

    // External callbacks (game/system hooks)
    this.onDensity = onDensity;
    this.onTime    = onTime;
    this.onSound   = onSound;
    this.onClick   = onClick;

    this._bindButtons();
    this._initAutoHide();
  }

  // ─── BUTTON BINDING ────────────────────────────────────────────────────────
  _bindButtons() 
  {
    // ─── DENSITY CONTROLS ───────────────────────────────────────────────────
    ['sparse', 'flock', 'swarm'].forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        this.onClick();

        // Reset all density buttons
        ['sparse', 'flock', 'swarm'].forEach(b => {
          document.getElementById(b).className = '';
        });

        // Activate selected button
        document.getElementById(id).className = 'active-gold';

        // Trigger external logic
        this.onDensity(id);
      });
    });

    // ─── TIME OF DAY CONTROLS ───────────────────────────────────────────────
    ['dawn', 'midday', 'dusk'].forEach(id => {
      document.getElementById(id).addEventListener('click', () => {
        this.onClick();

        // Reset time buttons
        ['dawn', 'midday', 'dusk'].forEach(b => {
          document.getElementById(b).className = '';
        });

        // Activate selected time
        document.getElementById(id).className = 'active-gold';

        // Trigger external logic
        this.onTime(id);
      });
    });

    // ─── SOUND TOGGLE ────────────────────────────────────────────────────────
    document.getElementById('sound-toggle').addEventListener('click', () => {
      this.onSound();
    });
  }

  // ─── AUTO-HIDE SYSTEM INITIALIZATION ──────────────────────────────────────
  _initAutoHide() 
  {
    // Smooth UI transitions for show/hide
    this.el.style.transition =
      'opacity 0.7s ease, transform 0.7s ease';

    // Double RAF ensures DOM is fully ready before first show
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._show();

        // Any user interaction resets visibility timer
        document.addEventListener('mousemove',  () => this._show());
        document.addEventListener('touchstart', () => this._show());
        document.addEventListener('touchmove',  () => this._show());
      });
    });
  }

  // ─── SHOW HUD ─────────────────────────────────────────────────────────────
  _show() 
  {
    this.el.style.opacity       = '1';
    this.el.style.pointerEvents = 'auto';
    this.el.style.transform     = 'translateX(-50%) translateY(0)';

    // Show cursor when HUD is visible
    document.body.style.cursor  = 'crosshair';

    // Reset hide timer
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this._hide(), 3500);
  }

  // ─── HIDE HUD ─────────────────────────────────────────────────────────────
  _hide() 
  {
    this.el.style.opacity       = '0';
    this.el.style.pointerEvents = 'none';

    // Hide cursor when HUD is hidden
    document.body.style.cursor  = 'none';
  }
}