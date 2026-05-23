# Linear Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely migrate the visual design system of the application to follow the Linear design system specified in DESIGN.md.

**Architecture:** We will replace Outfit fonts with Inter Variable loading and apply cv01/ss03 OpenType features globally. CSS custom variables will be redefined with Linear's palette, replacing green/lime accents with Brand Indigo and Level-2 luminance stacking cards, followed by chart color mappings and drawing coordinates recolorization.

**Tech Stack:** Vanilla HTML5, CSS3 Variables, ES6 JavaScript, Chart.js, Leaflet.js

---

### Task 1: Load Inter Variable Fonts & Refactor HTML (`public/index.html`)

**Files:**
- Modify: `public/index.html:8-25`
- Test: Run terminal status check

- [ ] **Step 1: Swap Google Fonts connection in index.html**
  Replace line 8-12:
  ```html
  <!-- Premium Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  ```
  With:
  ```html
  <!-- Premium Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  ```

- [ ] **Step 2: Update document title and PWA meta theme**
  Replace lines 23-24:
  ```html
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0f2e1e">
  ```
  With:
  ```html
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#08090a">
  ```

- [ ] **Step 3: Run git diff to verify changes**
  Run: `git diff public/index.html`
  Expected: Only the Fonts link and theme meta are modified.

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add public/index.html
  git commit -m "style: load Inter Variable font and update theme color in index.html"
  ```

---

### Task 2: Define Token variables & Global Typography (`public/css/styles.css`)

**Files:**
- Modify: `public/css/styles.css:1-45`
- Test: Run terminal stylesheet verification

- [ ] **Step 1: Redefine base CSS variables**
  Replace:
  ```css
  :root {
    /* Harmonized Color Palette */
    --bg-app: #080b09;
    --bg-sidebar: rgba(15, 23, 20, 0.65);
    --bg-card: rgba(22, 34, 28, 0.45);
    --bg-card-hover: rgba(30, 48, 38, 0.6);
    
    --border-glow: rgba(16, 185, 129, 0.15);
    --border-glow-hover: rgba(16, 185, 129, 0.35);
    --border-muted: rgba(255, 255, 255, 0.06);
    
    --color-primary: #10b981; /* Emerald */
    --color-primary-hover: #059669;
    --color-accent: #84cc16; /* Lime */
    --color-accent-hover: #65a30d;
    --color-success: #22c55e; /* Green */
    --color-success-hover: #16a34a;
    --color-danger: #ef4444;
    --color-danger-hover: #dc2626;
    
    --text-main: #f3f4f6;
    --text-muted: #9ca3af;
    --text-dark: #1f2937;
    
    /* Fonts */
    --font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    
    /* Sizing / Layout spacing */
    --header-height: 70px;
    --sidebar-width: 300px;
    --analytics-width: 400px;
    --radius-sm: 8px;
    --radius-md: 14px;
    --radius-lg: 20px;
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    --glass-blur: blur(14px);
  }
  ```
  With:
  ```css
  :root {
    /* Color Canvas */
    --bg-app: #08090a;            /* Marketing Black */
    --bg-sidebar: #0f1011;        /* Panel Dark */
    --bg-card: rgba(255, 255, 255, 0.05); /* Level 2 Card (Luminance Stacking) */
    --bg-card-hover: rgba(255, 255, 255, 0.07);
    
    /* Brand Accent Signatures */
    --color-primary: #5e6ad2;       /* Brand Indigo */
    --color-primary-hover: #828fff; /* Accent Violet */
    --color-accent: #a8b1ff;        /* Violet Light */
    --color-accent-hover: #828fff;
    
    /* Status Color Palette (strictly for functional data/status states) */
    --color-success: #27a644;       /* Success Green */
    --color-success-hover: #10b981; /* Complete Emerald */
    --color-danger: #e53935;        /* Red */
    --color-danger-hover: #ef4444;
    --color-warning: #f59e0b;       /* Amber */
    
    /* Text Contrast Hierarchy */
    --text-main: #f7f8f8;           /* White Primary */
    --text-muted: #8a8f98;          /* Tertiary Muted Gray */
    --text-dark: #08090a;           /* Dark Canvas */
    
    /* Transparent Hairline Borders */
    --border-micro: rgba(255, 255, 255, 0.02);
    --border-glow: rgba(255, 255, 255, 0.05);       /* Border Subtle */
    --border-glow-hover: rgba(255, 255, 255, 0.08); /* Border Standard */
    --border-muted: rgba(255, 255, 255, 0.02);
    
    /* Fonts & Weights */
    --font-family: 'Inter Variable', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-mono: 'Berkeley Mono', 'SF Mono', Consolas, monospace;
    
    /* Radius Rules */
    --radius-sm: 4px;   /* Standard */
    --radius-md: 6px;   /* Comfortable (Buttons, inputs) */
    --radius-lg: 8px;   /* Card */
    --radius-panel: 12px; /* Dialogs / Modals */
    
    /* Controlled Snappy Motion */
    --transition: all 150ms cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Snappy quadratic */
    --glass-blur: blur(12px) saturate(180%);
    --header-height: 70px;
    --sidebar-width: 300px;
    --analytics-width: 400px;
    --shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
  }
  ```

- [ ] **Step 2: Add global font variation and feature rules**
  Replace body properties (lines 52-59):
  ```css
  body {
    font-family: var(--font-family);
    background-color: var(--bg-app);
    color: var(--text-main);
    overflow: hidden;
    height: 100vh;
    -webkit-font-smoothing: antialiased;
  }
  ```
  With:
  ```css
  body, button, input, select, textarea {
    font-family: var(--font-family);
    font-feature-settings: "cv01", "ss03"; /* Non-negotiable Inter features */
    font-variation-settings: "wght" 400;
  }

  body {
    background-color: var(--bg-app);
    color: var(--text-main);
    overflow: hidden;
    height: 100vh;
    -webkit-font-smoothing: antialiased;
  }

  /* Emphasis weight 510 on precise continuous axis */
  h1, h2, h3, h4, .btn, .map-tab-btn, .lang-btn, .farm-item-name, .farm-prop-label, .metric-label, .quick-question-btn, #lbl-title {
    font-variation-settings: "wght" 510 !important;
    letter-spacing: -0.01em;
  }
  ```

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add public/css/styles.css
  git commit -m "style: define CSS theme variables and global typography defaults"
  ```

---

### Task 3: Refactor UI Components, Layout, Hover States & Hero BG (`public/css/styles.css`)

**Files:**
- Modify: `public/css/styles.css:170-1221`
- Test: Inspect visually on browser local reloading

- [ ] **Step 1: Update focus ring shadows**
  Replace focus rules in input/select styles:
  ```css
  .form-select:focus, .form-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  ```
  With:
  ```css
  .form-select:focus, .form-input:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.4), 0 0 0 4px rgba(94, 106, 210, 0.2) !important;
  }
  ```

- [ ] **Step 2: Update buttons layout to comfortable radius and rectangular**
  Verify `.btn` definitions use `var(--radius-md)` which is now `6px`.
  Ensure primary buttons are styled with correct colors:
  ```css
  .btn-primary {
    background: var(--color-primary);
    color: var(--text-main);
  }
  .btn-primary:hover {
    background: var(--color-primary-hover);
  }
  ```

- [ ] **Step 3: Refactor Cards luminance elevation stacking**
  Replace `.card` and card hover rules:
  ```css
  .card {
    background: var(--bg-card);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--border-glow);
    border-radius: var(--radius-md);
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: var(--shadow);
    transition: var(--transition);
  }

  .card:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-glow-hover);
    box-shadow: 0 12px 40px 0 rgba(16, 185, 129, 0.08);
  }
  ```
  With:
  ```css
  .card {
    background: var(--bg-card);
    backdrop-filter: var(--glass-blur);
    border: 1px solid var(--border-glow);
    border-radius: var(--radius-lg); /* 8px card radius */
    padding: 20px;
    margin-bottom: 16px;
    box-shadow: none; /* No drop shadows on standard cards */
    transition: var(--transition);
  }

  .card:hover {
    background: var(--bg-card-hover);
    border-color: var(--border-glow-hover);
    box-shadow: none;
  }
  ```

- [ ] **Step 4: Update home views and hero ambient glow colors**
  Modify hero and background gradients:
  ```css
  .home-view-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - var(--header-height));
    background: radial-gradient(circle at 50% 50%, #091a10 0%, #030604 100%);
    overflow-y: auto;
    padding: 60px 24px;
    z-index: 1;
  }

  .hero-bg-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 90%;
    background: radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, rgba(132, 204, 22, 0.03) 50%, transparent 100%);
    z-index: -1;
    filter: blur(100px);
    animation: float-glow 25s infinite ease-in-out alternate;
    pointer-events: none;
  }
  ```
  With:
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

  .hero-bg-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 90%;
    background: radial-gradient(circle, rgba(94, 106, 210, 0.07) 0%, rgba(130, 143, 255, 0.03) 50%, transparent 100%);
    z-index: -1;
    filter: blur(100px);
    animation: float-glow 25s infinite ease-in-out alternate;
    pointer-events: none;
  }
  ```

- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add public/css/styles.css
  git commit -m "style: update cards elevation, focus shadows, and hero glow themes"
  ```

---

### Task 4: Update Data Visualizations Theme & Gradients (`public/js/charts.js`)

**Files:**
- Modify: `public/js/charts.js:1-236`
- Test: Verify chart renders in visual console without console errors

- [ ] **Step 1: Update default chart fonts and lines**
  Replace lines 10-12:
  ```javascript
  const chartGridColor = 'rgba(255, 255, 255, 0.05)';
  const chartTextColor = '#9ca3af';
  const chartFontFamily = "'Outfit', sans-serif";
  ```
  With:
  ```javascript
  const chartGridColor = 'rgba(255, 255, 255, 0.05)';
  const chartTextColor = '#8a8f98';
  const chartFontFamily = "'Inter', sans-serif";
  ```

- [ ] **Step 2: Recolour Weather precipitation sum**
  Replace Weather precipitation dataset color configs (lines 47-48):
  ```javascript
          backgroundColor: 'rgba(16, 185, 129, 0.35)',
          borderColor: '#10b981',
  ```
  With:
  ```javascript
          backgroundColor: 'rgba(94, 106, 210, 0.35)',
          borderColor: '#5e6ad2',
  ```

- [ ] **Step 3: Recolour temperature lines**
  Replace max/min line color definitions (lines 57-58, 68-69):
  ```javascript
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
  ```
  With:
  ```javascript
          borderColor: '#828fff',
          backgroundColor: 'rgba(130, 143, 255, 0.1)',
  ```
  And:
  ```javascript
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
  ```
  With:
  ```javascript
          borderColor: '#a8b1ff',
          backgroundColor: 'rgba(168, 177, 255, 0.1)',
  ```

- [ ] **Step 4: Update NDVI chart styling**
  Replace lines 133-135 and 144-145:
  ```javascript
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(132, 204, 22, 0.3)');
    gradient.addColorStop(1, 'rgba(132, 204, 22, 0.0)');
  ```
  With:
  ```javascript
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(94, 106, 210, 0.3)');
    gradient.addColorStop(1, 'rgba(94, 106, 210, 0.0)');
  ```
  And:
  ```javascript
        borderColor: '#84cc16', // Lime green
        backgroundColor: gradient,
  ```
  With:
  ```javascript
        borderColor: '#5e6ad2', // Brand Indigo
        backgroundColor: gradient,
  ```

- [ ] **Step 5: Recolour yield benchmark column gradients**
  Replace lines 197-210:
  ```javascript
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(132, 204, 22, 0.1)');
  
    benchmarkChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${cropName} Yield (${unit})`,
          data: values,
          backgroundColor: gradient,
          borderColor: '#10b981',
  ```
  With:
  ```javascript
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(94, 106, 210, 0.4)');
    gradient.addColorStop(1, 'rgba(130, 143, 255, 0.1)');
  
    benchmarkChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: `${cropName} Yield (${unit})`,
          data: values,
          backgroundColor: gradient,
          borderColor: '#5e6ad2',
  ```

- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add public/js/charts.js
  git commit -m "style: map chart colors and text styling to brand indigo and violet"
  ```

---

### Task 5: Shift Map Drawing Vector Color Themes (`public/js/map.js`)

**Files:**
- Modify: `public/js/map.js`
- Test: Verify drawn polygon displays with Indigo border stroke

- [ ] **Step 1: Swap map color settings**
  Find leaflet styles:
  ```javascript
  color: '#10b981',
  fillColor: '#10b981',
  ```
  With:
  ```javascript
  color: '#5e6ad2',
  fillColor: '#5e6ad2',
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add public/js/map.js
  git commit -m "style: update leaflet map polygon strokes and Geoman drawing paths to brand Indigo"
  ```

---

### Task 6: Bump Cache Version & Verify (`public/sw.js`)

**Files:**
- Modify: `public/sw.js:5`
- Test: Run `npm test`

- [ ] **Step 1: Bump Cache Name to v8**
  Replace line 5:
  ```javascript
  const CACHE_NAME = 'ghana-farmer-shell-v7';
  ```
  With:
  ```javascript
  const CACHE_NAME = 'ghana-farmer-shell-v8';
  ```

- [ ] **Step 2: Execute backend regression test suite**
  Run: `npm test`
  Expected: All 13 tests PASS.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add public/sw.js
  git commit -m "style: invalidate PWA asset cache by bumping service worker shell version to v8"
  ```
