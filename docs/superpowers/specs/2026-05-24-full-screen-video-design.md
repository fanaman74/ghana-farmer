# Ghana Farmer Support Application - Full-Screen Video Specification

**Date:** 2026-05-24
**Status:** Approved by User

---

## 1. Goal & Context

The goal is to implement an immersive, premium, cinematic landing experience on the homepage (`#home-view`) by replacing the vector map layout and background animations with a **full-screen silent loop video backdrop of African village farmers** working their fields. 

---

## 2. Technical Blueprint

The implementation involves injecting an HTML5 background video tag, configuring absolute full-bleed backdrop covering rules, styling a glassmorphic overlay vignette to guarantee Inter Variable text contrast, and resetting the responsive homepage alignment.

### i. Loop Video Integration (`public/index.html`)
We will remove the `.hero-layout-split` and `.hero-map-card` wrappers from `#home-view` and replace them with a full-screen looping video container placed at the base:

```html
<!-- Cinematic Background Loop Video -->
<div class="hero-video-container">
  <video autoplay loop muted playsinline class="hero-bg-video">
    <source src="https://assets.mixkit.co/videos/preview/mixkit-african-farmer-working-in-field-with-hoe-41804-large.mp4" type="video/mp4">
  </video>
  <div class="hero-video-overlay"></div>
</div>
```

### ii. Layout & Contrast Styles (`public/css/styles.css`)
To keep the text extremely legible and consistent with Linear's style, we apply these layout variables:
```css
/* Full viewport video coverage container */
.hero-video-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -2; /* Safely placed below text layers */
  pointer-events: none;
}

.hero-bg-video {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Retains crop ratio over full container */
}

/* Glassmorphic Dark Overlay Vignette */
.hero-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg, 
    rgba(8, 9, 10, 0.75) 0%, 
    rgba(8, 9, 10, 0.6) 50%, 
    rgba(8, 9, 10, 0.85) 100%
  );
  backdrop-filter: blur(3px); /* Soft cinematic blur */
  z-index: -1;
}
```

### iii. Center Alignment Reset (`public/css/styles.css`)
* Revert the `#home-view` container and `.hero-section` to a clean centered alignment matching the original landing grid:
  ```css
  .home-view-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--header-height));
    background: var(--bg-app); /* Offline color fallback */
    overflow-y: auto;
    padding: 60px 24px;
    z-index: 1;
  }
  ```

---

## 3. Verification Plan

### Automated Verification
* Execute test commands to check backend status:
  ```bash
  npm test
  ```

### Manual Visual Verification
1. **Contrast Legibility:** Check the landing page on different display devices, ensuring all white Inter titles, paragraphs, and active cards have high contrast against the looping video behind them.
2. **Infinite Looping:** Verify that the MP4 video plays silently and seamlessly restarts its loop once completed without flashing white.
3. **Cover Fitment:** Resize the browser window rapidly, checking that `object-fit: cover` adapts instantly to prevent black bars or layout breaks.
4. **Offline Resiliency:** Disconnect the network in DevTools, refresh, and confirm the background degrades cleanly to the dark Marketing Black backdrop.
