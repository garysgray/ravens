![Game Splash](images/the_ravens.png)

# The Ravens: Atmospheric Visualization Architecture

A high-fidelity web application utilizing a multi-layered CSS rendering stack, real-time canvas overlays, and an integrated post-processing pipeline.

## Technical Overview

The core of this application is a "Deep-Stack" layering system. By isolating environmental elements, entities, and UI across a 100-point Z-index scale, the application achieves a distinct sense of parallax depth while maintaining interactive performance.

## Key Technical Implementation

### Pointer Event Management
To allow the user to interact with the HUD (Z-index 90) while a canvas sits on top of it (Z-index 99), the system utilizes `pointer-events: none` on all non-interactive visual overlays. This ensures that mouse coordinates can be captured by the background scripts without blocking the functional UI buttons.

### Atmospheric Pipeline
The application simulates a camera lens through a series of fixed-position div elements:
* **Vignette:** A radial gradient that focuses visual weight on the center of the viewport.
* **Scanlines:** A repeating linear gradient simulating CRT monitor artifacts.
* **Film Grain:** Removed. The per-pixel noise layer (`_drawNoise`) was generating ~8 million random numbers per second at 1080p and has been eliminated entirely.

## Performance Optimizations

### Off-Screen Canvas Caching
Static environment elements are pre-rendered to hidden off-screen canvases during initialization and on resize/time change. Only dynamic elements redraw each frame:
- `HouseRenderer` — structure, roof, wings, turret buffered. Only animated window glows draw live.
- `HillRenderer` — full hill shape, gradient, ridge line, and road buffered.
- `MountainRangeRenderer` — already cached; extended to invalidate on time change.

### Gradient Caching
Canvas gradients are expensive to create. All static or semi-static gradients are now created once and reused:
- `SkyBackground` — sky, ground, and fog gradients cached; rebuilt only on resize or time change.
- `TreeRenderer` — trunk linear gradients cached per tree; rebuilt only on time change.
- `RavenLayer` — fade gradient cached; rebuilt only on resize.
- `CloudSystem` — fill style resolved once per frame before the draw loop.

### Trig & Math Caching
- `RavenCircles` — ring tilt `Math.cos` / `Math.sin` moved from per-bird per-frame to once per ring in `initBirds()`.
- `PerchedRaven` — `Math.sin(seed * 999)` direction calculation moved from per-frame to `getTreeData()`.
- `CircleRaven` and `Raven` — wing top and bottom triangles merged into a single `beginPath` / `fill` call.

### Color Parsing
- `BaseRenderer._alpha()` — hex color parsing cached via lookup table; each unique color parsed once.
- `Raven` — raw colors pre-parsed to RGB on `setTime()`, eliminating per-raven hex parsing every frame.
- `StarField` — star color pre-parsed on color change, eliminating 160 hex parses per frame.

### DOM Read Reduction
- `Scene` — `window.innerWidth` / `window.innerHeight` cached as `this.W` / `this.H` on resize; draw loop reads cached values instead of querying the DOM each frame.
- `RavenSideRenderer` — same pattern applied via `_resize(W, H)` fed from `Scene`.

### Mobile CSS
- `backdrop-filter: blur()` disabled on mobile viewports to reduce GPU load on the HUD element.

## Installation
1. Clone the repository.
2. Serve the directory via a local server or open `index.html` directly in a browser.


│   index.html
│
├───css
│       style.css
│
├───images
│       the_ravens.png
│
├───js
│   │   main.js
│   │
│   ├───core
│   │       config.js
│   │       controller.js
│   │       scene.js
│   │
│   ├───render
│   │   │   baseRenderer.js
│   │   │
│   │   ├───ground
│   │   │       hill.js
│   │   │       mountains.js
│   │   │       trees.js
│   │   │
│   │   ├───house
│   │   │       house.js
│   │   │       road.js
│   │   │
│   │   ├───ravens
│   │   │       circleRaven.js
│   │   │       perchedRaven.js
│   │   │       ravenCircles.js
│   │   │       ravens.js
│   │   │       ravenSide.js
│   │   │
│   │   └───sky
│   │           cloudSystem.js
│   │           skyBackGround.js
│   │           starField.js
│   │
│   └───utils
│           audio.js
│           hud.js
