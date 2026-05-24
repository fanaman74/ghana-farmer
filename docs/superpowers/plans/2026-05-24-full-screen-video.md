# Full-Screen Video Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the vector map grid with a cinematic, full-screen silent looping agricultural background video overlayed with a dark glassmorphic vignette for legibility.

**Architecture:** We will restructure `#home-view` to center its content. We will place an HTML5 background video tag covering the viewport via `object-fit: cover` and apply a linear dark overlay with a `blur(3px)` depth filter to guarantee Inter Variable text contrast.

**Tech Stack:** HTML5 Video API, CSS cover, backdrop-filter blur

---

### Task 1: Integrate HTML5 Looping Background Video (`public/index.html`)

**Files:**
- Modify: `public/index.html:57-124`
- Test: Verify index.html loads with correct centered elements

- [ ] **Step 1: Replace split layout with centered video structure**
  Replace lines 57-124:
  ```html
    <main id="home-view" class="home-view-container">
      <div class="hero-bg-glow"></div>
      
      <div class="hero-layout-split">
        <section class="hero-section">
          <div class="hero-logo-shimmer">🌱</div>
          <h1 id="lbl-hero-title">Empowering Ghanaian Agriculture</h1>
          <p id="lbl-hero-subtitle">Interactive mapping, satellite crop tracking, climate analytics, and AI advisor localized in English, Akan (Twi), and Ewe.</p>
        </section>

        <!-- Right Side: Beautiful SVG Ghana Logistics Map -->
        <div class="hero-map-card card">
          <svg viewBox="0 0 320 460" class="hero-ghana-svg">
            <!-- Simplified Ghana Vector Outline Path -->
            <path class="ghana-outline-path" d="M120,40 L190,42 L240,80 L250,150 L270,220 L270,300 L250,380 L230,410 L160,430 L80,420 L75,340 L50,290 L75,210 L80,120 Z" />

            <!-- Bezier Logistics Dashed Backing Tracks -->
            <path class="logistics-corridor-base" d="M190,140 Q130,220 90,280" /> <!-- Tamale -> Techiman -->
            <path class="logistics-corridor-base" d="M90,280 Q105,310 140,340" />  <!-- Techiman -> Kumasi -->
            <path class="logistics-corridor-base" d="M140,340 Q190,380 230,410" /> <!-- Kumasi -> Accra -->
            <path class="logistics-corridor-base" d="M140,340 Q100,390 80,420" />  <!-- Kumasi -> Takoradi -->
            <path class="logistics-corridor-base" d="M80,420 Q155,430 230,410" />  <!-- Takoradi -> Accra -->

            <!-- Flowing Active Dash Corridor Particles -->
            <path class="logistics-corridor-flow" d="M190,140 Q130,220 90,280" />
            <path class="logistics-corridor-flow" d="M90,280 Q105,310 140,340" />
            <path class="logistics-corridor-flow" d="M140,340 Q190,380 230,410" />
            <path class="logistics-corridor-flow" d="M140,340 Q100,390 80,420" />
            <path class="logistics-corridor-flow" d="M80,420 Q155,430 230,410" />

            <!-- Tamale Node -->
            <g transform="translate(190, 140)">
              <text y="-14" class="city-node-label">Tamale</text>
            </g>

            <!-- Techiman Node -->
            <g transform="translate(90, 280)">
              <text x="-16" y="4" class="city-node-label" style="text-anchor: end;">Techiman</text>
            </g>

            <!-- Kumasi Node -->
            <g transform="translate(140, 340)">
              <text x="16" y="4" class="city-node-label" style="text-anchor: start;">Kumasi</text>
            </g>

            <!-- Takoradi Node -->
            <g transform="translate(80, 420)">
              <text y="20" class="city-node-label">Takoradi</text>
            </g>

            <!-- Accra Node -->
            <g transform="translate(230, 410)">
              <text y="20" class="city-node-label">Accra</text>
            </g>
          </svg>
        </div>
      </div>
  ```
  With:
  ```html
    <main id="home-view" class="home-view-container">
      <!-- Full-Screen Cinematic Video Background -->
      <div class="hero-video-container">
        <video autoplay loop muted playsinline class="hero-bg-video">
          <source src="https://assets.mixkit.co/videos/preview/mixkit-african-farmer-working-in-field-with-hoe-41804-large.mp4" type="video/mp4">
        </video>
        <div class="hero-video-overlay"></div>
      </div>
      
      <section class="hero-section">
        <div class="hero-logo-shimmer">🌱</div>
        <h1 id="lbl-hero-title">Empowering Ghanaian Agriculture</h1>
        <p id="lbl-hero-subtitle">Interactive mapping, satellite crop tracking, climate analytics, and AI advisor localized in English, Akan (Twi), and Ewe.</p>
      </section>
  ```

- [ ] **Step 2: Verify HTML diff**
  Run: `git diff public/index.html`
  Expected: Clear removal of split SVG structure and addition of video tag.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add public/index.html
  git commit -m "feat: replace SVG outline split grid with full-screen background loop video in index.html"
  ```

---

### Task 2: Define Full-Bleed Video covering & Contrast Overlay Styles (`public/css/styles.css`)

**Files:**
- Modify: `public/css/styles.css`
- Test: Verify styles load correctly on viewport resizes

- [ ] **Step 1: Revert home-view to centered structure and add video css rules**
  Find:
  ```css
  .home-view-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--header-height));
    background: radial-gradient(circle at 50% 50%, #0f1011 0%, #08090a 100%);
    overflow-y: auto;
    padding: 60px 24px;
    z-index: 1;
  }
  ```
  And replace it with:
  ```css
  .home-view-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--header-height));
    background: var(--bg-app);
    overflow-y: auto;
    padding: 60px 24px;
    z-index: 1;
  }
  ```

- [ ] **Step 2: Append video background full-bleed positioning**
  Find the newly appended split grid and SVG animations (lines 1247 onwards):
  ```css
  /* Split layout responsive grid on desktop viewports */
  .hero-layout-split {
  ...
  .city-node-label {
    ...
    pointer-events: none;
  }
  ```
  And replace them entirely with the clean cover video rules:
  ```css
  /* Full viewport background loop video rules */
  .hero-video-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -2;
    pointer-events: none;
  }

  .hero-bg-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

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
    backdrop-filter: blur(3px); /* elegant glass blur overlay */
    z-index: -1;
  }

  /* Re-center hero content */
  .hero-section {
    text-align: center;
    max-width: 800px;
    margin-bottom: 56px;
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-section p {
    font-size: 19px;
    color: var(--text-muted);
    line-height: 1.6;
    max-width: 680px;
    margin: 0 auto;
  }
  ```

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add public/css/styles.css
  git commit -m "style: implement full-bleed background cover, dark blur vignette overlay, and re-centered hero text styles"
  ```

---

### Task 3: Bump PWA Shell Cache & Verify (`public/sw.js`)

**Files:**
- Modify: `public/sw.js:5`
- Test: Run `npm test`

- [ ] **Step 1: Bump Cache Name to v11**
  Replace line 5:
  ```javascript
  const CACHE_NAME = 'ghana-farmer-shell-v10';
  ```
  With:
  ```javascript
  const CACHE_NAME = 'ghana-farmer-shell-v11';
  ```

- [ ] **Step 2: Run automated Express integration regression tests**
  Run: `npm test`
  Expected: 13/13 tests pass green.

- [ ] **Step 3: Commit final cache invalidate changes**
  Run:
  ```bash
  git add public/sw.js
  git commit -m "style: invalidate PWA asset cache by bumping service worker shell version to v11"
  ```
