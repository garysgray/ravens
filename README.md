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
* **Film Grain:** A noise texture layer to reduce color banding in dark gradients.

## Installation

1. Clone the repository.
2. Serve the directory via a local server or open `index.html` directly in a browser.



