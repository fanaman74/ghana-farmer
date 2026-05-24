# Ghana Farmer Support Application - Hero Animated Map Specification

**Date:** 2026-05-24
**Status:** Approved by User

---

## 1. Goal & Context

The goal is to implement a high-impact, premium vector map of Ghana within the hero landing section (`#home-view`) of the application. The map will display simplified boundary paths of the nation, glowing coordinate nodes for major agricultural centers (**Tamale**, **Techiman**, **Kumasi**, **Takoradi**, **Accra**), and glowing animated bezier curves representing key trade logistics flow lines between them. 

---

## 2. Technical Blueprint

The feature involves adding inline SVG markup to the HTML landing structure, styling layout alignments and animation timelines in CSS, and configuring responsive reflow layouts.

### i. SVG Geometry & Cities Coordinates Map (`public/index.html`)
We will place an inline responsive `<svg viewBox="0 0 320 460">` adjacent to the hero content inside the `#home-view` container. The SVG elements will map to these coordinates:

* **Cities Coordinates Bounding Box:**
  - **Tamale (North):** `(190, 140)`
  - **Techiman (Mid-West):** `(90, 280)`
  - **Kumasi (Mid-South):** `(140, 340)`
  - **Takoradi (South-West):** `(80, 420)`
  - **Accra (South-East):** `(230, 410)`

* **Logistics Bezier Paths:**
  - Tamale to Techiman: `M190,140 Q130,220 90,280`
  - Techiman to Kumasi: `M90,280 Q105,310 140,340`
  - Kumasi to Accra: `M140,340 Q190,380 230,410`
  - Kumasi to Takoradi: `M140,340 Q100,390 80,420`
  - Takoradi to Accra: `M80,420 Q155,430 230,410`

* **Ghana Vector Outline:** A simplified polyline path tracing the geometric envelope of Ghana.
  ```xml
  <path class="ghana-outline-path" d="M120,40 L190,42 L240,80 L250,150 L270,220 L270,300 L250,380 L230,410 L160,430 L80,420 L75,340 L50,290 L75,210 L80,120 Z" />
  ```

### ii. Split-Grid Hero Alignment (`public/css/styles.css`)
* **Desktop Grid:** Convert `.home-view-container` into a responsive split grid on large viewports (`min-width: 1024px`):
  ```css
  .home-view-container {
    display: grid !important;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 48px;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }
  ```
* **SVG Container Card:** Wrapper card `.hero-map-card` using glassmorphism `rgba(255, 255, 255, 0.03)` and micro transparent borders to float the vector map elegantly.

### iii. CSS Path Dashoffset Flow Animations (`public/css/styles.css`)
We will configure keyframes to animate light flows along the corridors and nodes:
```css
/* Styling vectors */
.ghana-outline-path {
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 1.5px;
  fill: rgba(255, 255, 255, 0.01);
  transition: var(--transition);
}

.logistics-corridor-base {
  stroke: rgba(94, 106, 210, 0.12);
  stroke-width: 1.5px;
  fill: none;
  stroke-dasharray: 4 4;
}

.logistics-corridor-flow {
  stroke: var(--color-primary); /* #5e6ad2 */
  stroke-width: 2px;
  fill: none;
  stroke-dasharray: 8 60;
  stroke-dashoffset: 0;
  animation: logistics-flow-run 6s linear infinite;
  filter: drop-shadow(0 0 2px var(--color-primary));
}

@keyframes logistics-flow-run {
  to {
    stroke-dashoffset: -340;
  }
}

/* Glowing City Hub Nodes */
.city-node-inner {
  fill: var(--color-accent); /* #a8b1ff */
}

.city-node-outer {
  fill: var(--color-primary); /* #5e6ad2 */
  transform-origin: center;
  animation: node-throb-pulse 2s ease-in-out infinite alternate;
}

@keyframes node-throb-pulse {
  0% {
    transform: scale(0.9);
    opacity: 0.35;
  }
  100% {
    transform: scale(1.45);
    opacity: 0.85;
  }
}

.city-node-label {
  font-family: var(--font-family);
  font-variation-settings: "wght" 510;
  font-size: 10px;
  fill: var(--text-muted);
  text-anchor: middle;
}
```

---

## 3. Verification Plan

### Automated Verification
* Run integration testing to verify code compiled structure:
  ```bash
  npm test
  ```

### Manual Visual Verification
1. **Responsive Reflow:** Verify that on desktop viewports, the map renders side-by-side with the hero content in a balanced grid. Swap viewport sizes down to mobile, verifying that the map stacks cleanly above or below the text with no overflow errors.
2. **Animation Continuity:** Inspect logistics paths in the browser, verifying that the flowing indigo dots flow smoothly along each of the bezier curve tracks without clipping or visual jumps.
3. **Pulse Node Centering:** Confirm that the throbbing outer circles pulse concentric to the city node dots.
4. **i18n Compatibility:** Ensure text translation remains clean on switching languages.
