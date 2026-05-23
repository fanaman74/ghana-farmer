# Ghana Farmer Support Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a responsive, mobile-first Web/PWA dashboard integrating Open-Meteo, FAOSTAT, and a flexible Sentinel Hub proxy to empower Ghanaian farmers with localized weather forecasts, soil data, satellite-derived NDVI crop health, and national yield benchmarks in English, Akan (Twi), and Ewe.

**Architecture:** A lightweight Node.js/Express monolith with a local SQLite database caching external API queries, serving a high-end vanilla HTML5/CSS/JS frontend featuring Leaflet maps and interactive Chart.js visualizations.

**Tech Stack:** Node.js, Express, `better-sqlite3`, native `node:test` testing, Leaflet, Chart.js, and offline-first Service Workers.

---

## User Review Required

> [!IMPORTANT]
> The database will be a local SQLite file stored inside the workspace (`data/ghana_farmer.db`). No external database server (like PostgreSQL or MySQL) is required.
> Environment variables for Sentinel Hub can be configured in a `.env` file, but a high-fidelity mock data pipeline will automatically act as a fallback if no keys are provided, allowing instant and complete testing without setting up third-party paid accounts.

---

## Open Questions

> [!NOTE]
> None. All initial requirements (monolith architecture, SQLite, English/Twi/Ewe languages, Open-Meteo/FAOSTAT/Sentinel Hub integration, Vanilla CSS + Glassmorphism) have been fully clarified and approved by the user.

---

## Proposed Changes

### Component 1: Project Scaffolding & Setup

#### [NEW] [package.json](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/package.json)
Initialize the project, declare the Node ES module type (`"type": "module"`), and define the core dependencies and test scripts.

#### [NEW] [.env.example](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/.env.example)
Define example environment variables for port configuration and optional Sentinel Hub API credentials.

---

### Component 2: Database Layer (`database.js`)

#### [NEW] [database.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/database.js)
Establish SQLite database initialization, table generation (users, farms, weather caches, faostat caches), and core query handler methods using `better-sqlite3`.

#### [NEW] [database.test.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/tests/database.test.js)
Write integration tests using Node's native `node:test` suite to verify database connection, schema setup, user insertion, farm polygon insertion, and cache eviction logic.

---

### Component 3: Backend Server & Core API Routes (`server.js`)

#### [NEW] [server.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/server.js)
Create the Express server that serves static client assets from `public/` and exposes REST API endpoints for user management and saved farm boundaries.

#### [NEW] [api.test.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/tests/api.test.js)
Verify routing and controller behavior for `/api/users` and `/api/farms` routes.

---

### Component 4: Weather & FAOSTAT Proxy APIs

#### [MODIFY] [server.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/server.js)
Implement `/api/farms/:id/weather` and `/api/faostat/:crop` endpoints with robust transparent caching using Open-Meteo and FAOSTAT APIs.

#### [MODIFY] [api.test.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/tests/api.test.js)
Add integration tests verifying that caching works correctly (secondary requests are served from SQLite cache, not the network) and headers/JSON formatting conform to expectations.

---

### Component 5: Satellite NDVI Proxy & Fallback

#### [MODIFY] [server.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/server.js)
Implement `/api/farms/:id/satellite` to retrieve NDVI stats using configured Sentinel Hub credentials. If absent, generate dynamic, high-fidelity seasonal NDVI time-series aligned to Ghana's weather patterns (high in May–Oct wet season, low in dry season).

---

### Component 6: Frontend Layout, Visuals & i18n

#### [NEW] [index.html](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/index.html)
A semantic, mobile-first responsive dashboard layout with cards for map, weather forecast, NDVI crop health, soil indices, and FAOSTAT benchmarks.

#### [NEW] [styles.css](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/css/styles.css)
Premium CSS design using a custom palette, CSS grid layouts, smooth hover transitions, Google Fonts, and glassmorphic cards.

#### [NEW] [i18n.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/js/i18n.js)
Create the localization dictionary mapping UI labels to English, Akan (Twi), and Ewe, with toggle event handlers.

---

### Component 7: Map Drawing & Charts

#### [NEW] [map.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/js/map.js)
Integrate Leaflet.js and Leaflet Geoman/Draw to enable users to draw boundaries and capture GeoJSON coordinates.

#### [NEW] [charts.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/js/charts.js)
Implement helper wrappers around Chart.js to render climate forecast graphs, NDVI line graphs, and historical yield statistics.

#### [NEW] [app.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/js/app.js)
Coordinate frontend state, fetching backend JSON endpoints and updating map overlays, cards, and charts dynamically.

---

### Component 8: PWA & Offline Support

#### [NEW] [sw.js](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/sw.js)
Implement a PWA Service Worker caching static assets (`/index.html`, `/css/styles.css`, `/js/...`) to enable full app booting offline.

#### [NEW] [manifest.json](file:///Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/manifest.json)
Provide the standard Web App Manifest metadata for installation on mobile devices.

---

## Detailed Task Checklist

### Task 1: Scaffolding and Node.js Dependencies

**Files:**
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/package.json`
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/.env.example`
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/.env`

- [ ] **Step 1: Write `package.json` configuration**
  Write the core configuration mapping Express, `better-sqlite3`, `dotenv`, and `node-fetch`, using native Node ES modules.
- [ ] **Step 2: Install dependencies**
  Run: `npm install`
- [ ] **Step 3: Setup environment configuration files**
  Create `.env.example` and copy to `.env` with a default `PORT=3000`.
- [ ] **Step 4: Verify setup**
  Run a simple script to verify `better-sqlite3` loads correctly without binary compilation errors.
  Expected: Successful module import.
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add package.json .env.example
  git commit -m "chore: initialize project scaffolding and dependencies"
  ```

---

### Task 2: Database Initialization & Tables (`database.js`)

**Files:**
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/database.js`
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/tests/database.test.js`

- [ ] **Step 1: Write failing database test**
  Write `tests/database.test.js` using Node's built-in `node:test` checking schema tables and insertion.
- [ ] **Step 2: Run test to verify it fails**
  Run: `node tests/database.test.js`
  Expected: FAIL with module database.js not found.
- [ ] **Step 3: Implement `database.js` logic**
  Create `database.js` using `better-sqlite3`, initializing tables and exporting helper methods.
- [ ] **Step 4: Run test to verify it passes**
  Run: `node tests/database.test.js`
  Expected: PASS.
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add database.js tests/database.test.js
  git commit -m "feat: implement sqlite database layer with tests"
  ```

---

### Task 3: Express Backend Server & User/Farm Routes

**Files:**
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/server.js`
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/tests/api.test.js`

- [ ] **Step 1: Write failing API test**
  Write `tests/api.test.js` calling `/api/users` and `/api/farms`.
- [ ] **Step 2: Run test to verify it fails**
  Run: `node tests/api.test.js`
  Expected: FAIL (connection refused/cannot find server.js).
- [ ] **Step 3: Implement Express Server (`server.js`)**
  Create `server.js` establishing user routes and farm routes, storing inputs in SQLite.
- [ ] **Step 4: Run test to verify it passes**
  Run: `node tests/api.test.js`
  Expected: PASS.
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add server.js tests/api.test.js
  git commit -m "feat: implement express server with user and farm API routes"
  ```

---

### Task 4: Weather & FAOSTAT Proxy APIs with DB Caching

**Files:**
- Modify: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/server.js`
- Modify: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/database.js`
- Modify: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/tests/api.test.js`

- [ ] **Step 1: Write failing caching tests**
  Add test assertions verifying weather and crop stats fetch correctly and utilize database cache on subsequent calls.
- [ ] **Step 2: Run test to verify it fails**
  Run: `node tests/api.test.js`
  Expected: FAIL (routes return 404 or empty response).
- [ ] **Step 3: Implement weather & crop proxy logic**
  Implement endpoints in `server.js` querying Open-Meteo and FAOSTAT, calculating farm centroids for coordinates, and updating caches.
- [ ] **Step 4: Run test to verify it passes**
  Run: `node tests/api.test.js`
  Expected: PASS.
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add server.js database.js tests/api.test.js
  git commit -m "feat: integrate open-meteo and faostat API proxies with caching"
  ```

---

### Task 5: Satellite NDVI Proxy with Mock Fallback

**Files:**
- Modify: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/server.js`
- Modify: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/tests/api.test.js`

- [ ] **Step 1: Write satellite NDVI route test**
  Add assertions in `tests/api.test.js` validating `/api/farms/:id/satellite` response format and fields.
- [ ] **Step 2: Run test to verify it fails**
  Run: `node tests/api.test.js`
  Expected: FAIL (route returns 404).
- [ ] **Step 3: Implement Sentinel Hub proxy and dynamic mock pipeline**
  Implement `/api/farms/:id/satellite` logic in `server.js` with credentials check and Ghana seasonal mock NDVI curve fallback.
- [ ] **Step 4: Run test to verify it passes**
  Run: `node tests/api.test.js`
  Expected: PASS.
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add server.js tests/api.test.js
  git commit -m "feat: implement satellite ndvi proxy and high-fidelity mock pipeline"
  ```

---

### Task 6: Frontend Scaffold, Premium Styles, & i18n Dictionary

**Files:**
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/index.html`
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/css/styles.css`
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/js/i18n.js`

- [ ] **Step 1: Setup HTML skeleton with Google Fonts**
  Create `public/index.html` including elements for map, language toggles, weather curves, crop widgets, and profile switchers. Include Leaflet and Chart.js CDN tags.
- [ ] **Step 2: Implement Premium CSS styles**
  Write `public/css/styles.css` styling using glassmorphism, glowing borders, custom grids, and fluid mobile sizing.
- [ ] **Step 3: Write multi-language i18n dictionary**
  Write `public/js/i18n.js` carrying complete English, Akan (Twi), and Ewe vocabulary dictionaries and active listener translation update logic.
- [ ] **Step 4: Run server and inspect browser static serving**
  Run: `node server.js` and visit `http://localhost:3000` to confirm layout renders beautifully.
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add public/index.html public/css/styles.css public/js/i18n.js
  git commit -m "feat: create responsive frontend shell and multi-language dictionary"
  ```

---

### Task 7: Leaflet Map Integration & Coordinate Capturing

**Files:**
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/js/map.js`

- [ ] **Step 1: Initialize Leaflet Map**
  Create `public/js/map.js` rendering a default map centered on Kumasi/Accra, Ghana.
- [ ] **Step 2: Add drawing controls**
  Integrate Leaflet drawing tools to let users construct farm boundary polygons.
- [ ] **Step 3: Implement boundary geometry listeners**
  Add coordinate listeners to output drawn polygons as standard GeoJSON structure when saving fields.
- [ ] **Step 4: Verify mapping behavior**
  Load the page, verify maps render and polygons can be constructed without JS console exceptions.
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add public/js/map.js
  git commit -m "feat: integrate leaflet interactive maps with polygon drawing controls"
  ```

---

### Task 8: Chart.js Integration & Core App State Coordinating

**Files:**
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/js/charts.js`
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/js/app.js`

- [ ] **Step 1: Create Chart.js wrapper methods**
  Write `public/js/charts.js` declaring modular helper methods to initialize or update Weather (line/bar), NDVI (smooth curve), and FAOSTAT yield comparisons.
- [ ] **Step 2: Implement main frontend state coordinator (`app.js`)**
  Create `public/js/app.js` to coordinate loading saved farms, tracking the active selected user/farm, querying server proxy APIs, updating cards, handling language toggles, and populating Chart panels.
- [ ] **Step 3: End-to-end verification**
  Run server, add a user, draw a farm, click save, verify weather, crop historical data, and vegetation charts populate immediately.
- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add public/js/charts.js public/js/app.js
  git commit -m "feat: coordinate main app state flow and chart.js widgets"
  ```

---

### Task 9: Service Worker Offline Caching & Web Manifest

**Files:**
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/sw.js`
- Create: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/manifest.json`
- Modify: `/Users/fred/Documents/VibeCoding/antigravity/ghana-farmer/public/index.html`

- [ ] **Step 1: Register Service Worker**
  Register the service worker in `public/index.html` on initial app launch.
- [ ] **Step 2: Write Service Worker Cache handlers (`sw.js`)**
  Create `public/sw.js` caching HTML, CSS, JS modules, Leaflet assets, and Google Fonts.
- [ ] **Step 3: Define Web App Manifest (`manifest.json`)**
  Create `manifest.json` defining app icons, colors, names, and standalone PWA launch behaviors. Link it in `index.html`.
- [ ] **Step 4: Verify offline behavior**
  Toggle offline mode in Chrome/Safari dev tools, reload page, verify shell assets boot successfully and local farms list displays gracefully.
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add public/sw.js public/manifest.json public/index.html
  git commit -m "feat: add pwa service worker caching and manifest for offline support"
  ```

---

## Verification Plan

### Automated Tests
Run native test files directly inside the Node runtime without external testing frame dependencies:
```bash
node tests/database.test.js
node tests/api.test.js
```

### Manual Verification
* **Premium Theme Rendering:** Assert dark glassmorphic cards are transparent, display borders, and readable.
* **Map Operations:** Click and draw a custom polygon, click "Save Farm", verify coordinates match the database GeoJSON string.
* **Charts Validation:** Verify weather charts populate (smooth temperatures, precipitation bars) and NDVI is displayed.
* **Multi-Language Toggles:** Toggle to Akan (Twi) and Ewe, confirming all panel headers translate.
* **Offline Execution:** Load the site, enable "Offline Mode" inside Chrome developer tools network pane, reload the site, verify the app continues to display local farms and cached charts.
