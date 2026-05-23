# Ghana Farmer Support Application - Linear Design Redesign Specification

**Date:** 2026-05-23
**Status:** Approved by User

---

## 1. Goal & Context

The goal is to transition the entire visual identity of the Ghana Farmer Support Application to the precise, professional, dark-first **Linear (linear.app)** design system defined in [DESIGN.md](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/DESIGN.md). We are swapping the previous Forest Green/Lime styling for an absolute void Marketing Black canvas (`#08090a`), elegant Indigo (`#5e6ad2`) accents, clean Inter Variable typography with global single-story `cv01` and geometric alternate `ss03` OpenType settings, snappy quadratic ease transitions, and transparent overlay hairline borders.

---

## 2. Technical Blueprint

The visual redesign affects the application shell layout, styling system, charting component, and mapping color layers. The implementation spans the following areas:

### i. Font Importation & Layout Structure (`public/index.html`)
* **Google Fonts Integration:** Swap the `Outfit` font connection for **Inter** (supporting variable axis weight 100-900).
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
  ```
* **Emoji Replacements:** Adjust hero iconography and section buttons to adopt a clean, engineered layout tone.

### ii. Design Token Custom Variables (`public/css/styles.css`)
Redefine custom properties globally at the `:root` to map to the Linear specification:
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
}
```

### iii. Global Typography Axis & Feature Overrides
Apply OpenType alternate features and continuous weight `510` for high-impact UI elements:
```css
body, button, input, select, textarea {
  font-family: var(--font-family);
  font-feature-settings: "cv01", "ss03"; /* Single-story 'a' + geometric alternates */
  font-variation-settings: "wght" 400;
  -webkit-font-smoothing: antialiased;
}

/* Specific UI Emphasis elements mapped precisely to continuous weight 510 axis */
h1, h2, h3, h4, .btn, .map-tab-btn, .lang-btn, .farm-item-name, .farm-prop-label, .metric-label, .quick-question-btn, #lbl-title {
  font-variation-settings: "wght" 510 !important;
  letter-spacing: -0.01em;
}
```

### iv. Component Specific Overhauls
* **Buttons:** Standardize rectangular flat style (`6px` comfortable radius). Replace rounded pill buttons. Map primary states to Indigo `#5e6ad2` with direct hover scale shifts and `#828fff` transitions.
* **Cards & Panel Containers:** Elevate cards via **luminance stacking** backgrounds (`rgba(255,255,255,0.05)`), removing unnecessary overhead drop-shadows. Card borders use transparent `rgba(255,255,255,0.05)`.
* **Focus States:** Composite multi-layered indigo shadows:
  ```css
  box-shadow: 0 0 0 2px rgba(94, 106, 210, 0.4), 0 0 0 4px rgba(94, 106, 210, 0.2);
  ```
* **Hero Landing Section:** Modify shifting radial backgrounds from green gradients to a majestic indigo ambient glow (`rgba(94,106,210,0.08)`) against the absolute Marketing Black backdrop.

### v. Data Visualization Themes (`public/js/charts.js`)
* Change `chartFontFamily` token reference to `'Inter', sans-serif`.
* **Weather & Forecast Charts:** Rainfall bar dataset uses Indigo fill (`rgba(94, 106, 210, 0.35)` with `#5e6ad2` border). Max/Min temperatures map to Indigo and Violet accents.
* **NDVI Curves:** Background gradient underlay shifts from Lime to Indigo theme `rgba(94, 106, 210, 0.3)`. Preserve green/amber/red data state indicators strictly for individual data coordinate dots.
* **Benchmarks:** Yield chart uses a solid violet-to-indigo column gradient.

### vi. Map Drawing Visual Layer (`public/js/map.js`)
* Shift geoman drawing shapes and active farm polygon strokes from standard green to brand Indigo (`#5e6ad2`) to maintain unified visual branding.

---

## 3. Verification Plan

### Automated Verification
* Run the API and database test suites to verify that no functional schema or backend behavior has been impacted:
  ```bash
  npm test
  ```

### Manual Visual Verification
1. **Typography Alternate Checks:** Inspect dashboard text under Chrome DevTools, verifying that Inter renders with the correct single-story 'a' glyph (`cv01`) and geometric shapes (`ss03`). Verify font-weight is set to `510` for labels and headers.
2. **Color Palette Assessment:** Confirm absolute marketing black canvas backdrop (`#08090a`) shows no remnants of original forest green color styles.
3. **Luminance Stacking Verification:** Inspect dashboard panels and bottom cards, verifying that depth is expressed by lighter dark backgrounds (`rgba(255,255,255,0.05)`) rather than heavy drop-shadow overlays.
4. **Snappy Animations:** Hover over buttons, lang controls, and feature panels to confirm quadratic transitions (150ms) are brisk and snappy with no bouncy curves.
5. **Chart Color Alignment:** Verify that temperature, precipitation, and yield datasets render in gorgeous Indigo and Violet tones.
