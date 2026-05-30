/**
 * Ghana Farmer Support Application - Main App State Coordinator
 */

import { 
  initMap, 
  displayFarms, 
  focusFarm, 
  highlightFarm, 
  clearDrawnLayers,
  invalidateMapSize,
  flyToCoords
} from './map.js';

import { 
  renderWeatherChart, 
  renderNdviChart, 
  renderBenchmarkChart 
} from './charts.js';

// Pre-defined local Ghanaian agricultural hubs for offline-resilient location search
const LOCAL_GHANA_PLACES = {
  kumasi: { lat: 6.6885, lon: -1.6244, zoom: 15 },
  accra: { lat: 5.6037, lon: -0.1870, zoom: 15 },
  tamale: { lat: 9.4008, lon: -0.8393, zoom: 15 },
  sunyani: { lat: 7.3399, lon: -2.3263, zoom: 15 },
  techiman: { lat: 7.5833, lon: -1.9333, zoom: 15 },
  ejura: { lat: 7.3833, lon: -1.3667, zoom: 15 },
  koforidua: { lat: 6.0945, lon: -0.2591, zoom: 15 },
  ho: { lat: 6.6000, lon: 0.4700, zoom: 15 },
  wa: { lat: 10.0600, lon: -2.5000, zoom: 15 },
  bolgatanga: { lat: 10.7856, lon: -0.8514, zoom: 15 },
  wenchi: { lat: 7.7333, lon: -2.1000, zoom: 15 },
  berekum: { lat: 7.4534, lon: -2.5842, zoom: 15 },
  ejisu: { lat: 6.7167, lon: -1.5000, zoom: 15 },
  nsawam: { lat: 5.8078, lon: -0.3503, zoom: 15 },
  obuasi: { lat: 6.2000, lon: -1.6667, zoom: 15 }
};

// Application State
let activeUserId = null;
let activeFarmId = null;
let drawnGeometry = null;
let drawnLayer = null;

let users = [];
let farms = [];

// Geodesic Polygon Area Calculation (Approximation in Hectares)
function calculatePolygonArea(geometryStr) {
  try {
    const geo = JSON.parse(geometryStr);
    let coords = [];
    if (geo.geometry && geo.geometry.coordinates) {
      coords = geo.geometry.coordinates[0];
    } else if (geo.coordinates) {
      coords = geo.coordinates[0];
    }

    if (!coords || coords.length < 3) return 0;

    // Shoelace formula with spatial degrees to meters scaling
    let area = 0;
    const numPoints = coords.length;
    const factor = 111300; // ~meters per degree

    for (let i = 0; i < numPoints; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % numPoints];
      
      const x1 = p1[0] * factor * Math.cos(p1[1] * Math.PI / 180);
      const y1 = p1[1] * factor;
      const x2 = p2[0] * factor * Math.cos(p2[1] * Math.PI / 180);
      const y2 = p2[1] * factor;

      area += (x1 * y2) - (x2 * y1);
    }

    const areaInSqMeters = Math.abs(area / 2);
    const areaInHectares = areaInSqMeters / 10000; // 1 Hectare = 10,000 sq meters
    return parseFloat(areaInHectares.toFixed(2));
  } catch (e) {
    return 0;
  }
}

// Centroid Coordinate Calculation
function calculatePolygonCentroid(geometryStr) {
  try {
    const geo = JSON.parse(geometryStr);
    let coords = [];
    if (geo.geometry && geo.geometry.coordinates) {
      coords = geo.geometry.coordinates[0];
    } else if (geo.coordinates) {
      coords = geo.coordinates[0];
    }

    if (!coords || coords.length === 0) return { lat: 6.6885, lon: -1.6244 };

    let sumLat = 0;
    let sumLon = 0;
    coords.forEach(pt => {
      sumLon += pt[0];
      sumLat += pt[1];
    });

    return {
      lat: parseFloat((sumLat / coords.length).toFixed(4)),
      lon: parseFloat((sumLon / coords.length).toFixed(4))
    };
  } catch (e) {
    return { lat: 6.6885, lon: -1.6244 };
  }
}

/**
 * -------------------------------------------------------------
 * INITIALIZATION & CONTEXT SEEDING
 * -------------------------------------------------------------
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize UI language
  window.setLanguage('en');

  // Initialize TTS Speech Synthesis
  if ('speechSynthesis' in window) {
    populateVoices();
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }

  // Initialize Map
  initMap('map', handlePolygonDrawn);

  // Initial Sync from Backend APIs
  await loadUsers();
  await loadFAOSTATBenchmarks();

  // Event Listeners for profile operations
  document.getElementById('user-select').addEventListener('change', handleUserChange);
  document.getElementById('btn-create-user').addEventListener('click', handleCreateUser);
  
  // Farm draw toggles
  document.getElementById('btn-draw-farm').addEventListener('click', toggleDrawMode);
  document.getElementById('btn-save-farm').addEventListener('click', handleSaveFarm);

  // FAOSTAT crop select changes
  document.getElementById('crop-select').addEventListener('change', (e) => {
    loadFAOSTATBenchmarks(e.target.value);
  });

  // Listen for language swaps to rebuild labels and re-render charts
  window.addEventListener('languageChanged', (e) => {
    if (activeFarmId) {
      const activeFarm = farms.find(f => f.id === activeFarmId);
      if (activeFarm) updateFarmDetailsCard(activeFarm);
    }
    // Re-trigger FAOSTAT render with updated labels
    const activeCrop = document.getElementById('crop-select').value;
    loadFAOSTATBenchmarks(activeCrop);
  });

  // Register online/offline browser state listeners
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
  updateNetworkStatus();

  // AI Advisor Event Listeners
  document.getElementById('btn-send-advisor').addEventListener('click', () => {
    const input = document.getElementById('advisor-input-text');
    sendAdvisorMessage(input.value.trim());
  });

  document.getElementById('advisor-input-text').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendAdvisorMessage(e.target.value.trim());
    }
  });

  document.querySelectorAll('.quick-question-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const query = e.currentTarget.getAttribute('data-query');
      sendAdvisorMessage(query);
    });
  });

  // Phase 2: Navigation event listeners
  document.getElementById('btn-header-home').addEventListener('click', () => navigateToView('home'));
  document.getElementById('btn-back-home').addEventListener('click', () => navigateToView('home'));

  document.getElementById('btn-go-weather').addEventListener('click', () => navigateToView('dashboard'));
  document.getElementById('btn-go-ndvi').addEventListener('click', () => navigateToView('dashboard'));
  document.getElementById('btn-go-yield').addEventListener('click', () => navigateToView('dashboard'));
  document.getElementById('btn-go-advisor').addEventListener('click', () => navigateToView('dashboard'));

  // Ghana location search triggers
  const searchInput = document.getElementById('map-search-input');
  searchInput.addEventListener('input', handleSearchInput);
  searchInput.addEventListener('keydown', handleSearchKeydown);
  document.getElementById('btn-map-search').addEventListener('click', handleMapSearch);
});

/**
 * -------------------------------------------------------------
 * PROFILE MANAGEMENT FLOW
 * -------------------------------------------------------------
 */
async function loadUsers() {
  try {
    const res = await fetch('/api/users');
    users = await res.json();
    
    // Save to local storage for offline booting
    localStorage.setItem('cached_users', JSON.stringify(users));
    populateUserDropdown(users);
  } catch (err) {
    console.warn('Network query for users failed. Reading offline cache...');
    const localUsers = localStorage.getItem('cached_users');
    if (localUsers) {
      users = JSON.parse(localUsers);
      populateUserDropdown(users);
    }
  }
}

function populateUserDropdown(usersList) {
  const select = document.getElementById('user-select');
  
  // Reset all options except select profile label
  const placeholderText = window.translate('lbl-select-profile');
  select.innerHTML = `<option value="">${placeholderText}</option>`;

  usersList.forEach(user => {
    const opt = document.createElement('option');
    opt.value = user.id;
    opt.textContent = user.username;
    select.appendChild(opt);
  });

  if (activeUserId) {
    select.value = activeUserId;
  }
}

async function handleCreateUser() {
  const input = document.getElementById('username-input');
  const username = input.value.trim();

  if (!username) return;

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });

    if (res.ok) {
      const newUser = await res.json();
      input.value = '';
      activeUserId = newUser.id;
      await loadUsers();
      await loadFarms(newUser.id);
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create profile');
    }
  } catch (err) {
    alert('Failed to register farmer profile. Network is unavailable.');
  }
}

async function handleUserChange(e) {
  const val = e.target.value;
  activeUserId = val ? Number(val) : null;
  activeFarmId = null;

  // Reset details panels
  resetDetailsPanels();

  if (activeUserId) {
    await loadFarms(activeUserId);
  } else {
    farms = [];
    displayFarms([], null);
    renderFarmsList([]);
  }
}

/**
 * -------------------------------------------------------------
 * FARM & GEOMETRY BOUNDARIES FLOW
 * -------------------------------------------------------------
 */
async function loadFarms(userId) {
  try {
    const res = await fetch(`/api/farms?user_id=${userId}`);
    farms = await res.json();
    
    // Cache farms locally for offline listings
    localStorage.setItem(`cached_farms_${userId}`, JSON.stringify(farms));
    renderFarmsList(farms);
    displayFarms(farms, handleFarmSelection);
  } catch (err) {
    console.warn(`Failed to retrieve farms for user ${userId}. Loading browser cache...`);
    const cached = localStorage.getItem(`cached_farms_${userId}`);
    if (cached) {
      farms = JSON.parse(cached);
      renderFarmsList(farms);
      displayFarms(farms, handleFarmSelection);
    }
  }
}

function renderFarmsList(farmsList) {
  const container = document.getElementById('farms-list');
  container.innerHTML = '';

  if (farmsList.length === 0) {
    container.innerHTML = `<div class="no-farms" id="lbl-no-farms">${window.translate('lbl-no-farms')}</div>`;
    return;
  }

  farmsList.forEach(farm => {
    const item = document.createElement('div');
    item.className = `farm-item ${farm.id === activeFarmId ? 'active' : ''}`;
    
    const info = document.createElement('div');
    info.className = 'farm-item-info';
    
    const name = document.createElement('span');
    name.className = 'farm-item-name';
    name.textContent = farm.name;
    
    const dateStr = new Date(farm.created_at).toLocaleDateString();
    const date = document.createElement('span');
    date.className = 'farm-item-date';
    date.textContent = `${window.translate('lbl-created')}: ${dateStr}`;

    info.appendChild(name);
    info.appendChild(date);
    
    // Delete farm button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete Farm';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteFarm(farm.id);
    });

    item.appendChild(info);
    item.appendChild(deleteBtn);

    item.addEventListener('click', () => handleFarmSelection(farm));
    container.appendChild(item);
  });
}

function toggleDrawMode() {
  if (!activeUserId) {
    alert('Please select or create a Farmer Profile first!');
    return;
  }
  
  // Clear any existing drawings
  clearDrawnLayers();
  drawnGeometry = null;
  drawnLayer = null;

  document.getElementById('draw-instructions').classList.remove('hidden');
  document.getElementById('save-farm-container').classList.add('hidden');
}

function handlePolygonDrawn(geojson, layer) {
  drawnGeometry = geojson;
  drawnLayer = layer;

  if (geojson) {
    document.getElementById('draw-instructions').classList.add('hidden');
    document.getElementById('save-farm-container').classList.remove('hidden');
  } else {
    document.getElementById('save-farm-container').classList.add('hidden');
  }
}

async function handleSaveFarm() {
  const input = document.getElementById('farm-name-input');
  const name = input.value.trim();

  if (!name || !drawnGeometry) return;

  try {
    const res = await fetch('/api/farms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: activeUserId,
        name,
        geometry: JSON.stringify(drawnGeometry)
      })
    });

    if (res.ok) {
      const newFarm = await res.json();
      input.value = '';
      document.getElementById('save-farm-container').classList.add('hidden');
      
      // Clean up map draw states
      clearDrawnLayers();
      
      activeFarmId = newFarm.id;
      await loadFarms(activeUserId);
      handleFarmSelection(newFarm);
    }
  } catch (err) {
    alert('Failed to save farm boundary. Check internet connection.');
  }
}

async function handleDeleteFarm(farmId) {
  const confirmDelete = confirm('Are you sure you want to delete this farm boundary? All cached datasets will be removed.');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`/api/farms/${farmId}`, { method: 'DELETE' });
    if (res.ok) {
      if (activeFarmId === farmId) {
        activeFarmId = null;
        resetDetailsPanels();
      }
      await loadFarms(activeUserId);
    }
  } catch (err) {
    alert('Failed to delete farm boundary. Check network availability.');
  }
}

/**
 * -------------------------------------------------------------
 * ANALYTICS & INGESTION STATE FLOW
 * -------------------------------------------------------------
 */
async function handleFarmSelection(farm) {
  activeFarmId = farm.id;
  
  // Highlight card list active selection
  document.querySelectorAll('.farm-item').forEach(item => {
    item.classList.remove('active');
  });
  renderFarmsList(farms);

  // Map highlights and focus
  highlightFarm(farm.id);
  focusFarm(farm.id);

  // Populate dynamic cards
  updateFarmDetailsCard(farm);

  // Show bottom details panel below Leaflet map
  const bottomDetails = document.getElementById('map-bottom-details');
  if (bottomDetails) {
    bottomDetails.classList.remove('hidden');
  }

  document.querySelector('.map-pane')?.classList.add('farm-selected');

  // Force Leaflet map resize re-calculation due to shrunken dimensions
  invalidateMapSize();

  // Trigger cache proxies ingestion for all aggregated dossiers
  await fetchWeather(farm.id);
  await fetchNDVI(farm.id);
  
  // Load standard yield benchmark matching crop selector
  const crop = document.getElementById('crop-select').value;
  await loadFAOSTATBenchmarks(crop);
}

function updateFarmDetailsCard(farm) {
  const container = document.getElementById('overview-content');
  const area = calculatePolygonArea(farm.geometry);
  const centroid = calculatePolygonCentroid(farm.geometry);

  container.innerHTML = `
    <div class="farm-props">
      <div class="farm-prop-item">
        <span class="farm-prop-label">${window.translate('lbl-size')}</span>
        <span class="farm-prop-value">${area} Hectares (ha)</span>
      </div>
      <div class="farm-prop-item">
        <span class="farm-prop-label">${window.translate('lbl-centroid')}</span>
        <span class="farm-prop-value">${centroid.lat}°N, ${centroid.lon}°W</span>
      </div>
    </div>
  `;
}

async function fetchWeather(farmId) {
  const selectorHint = document.getElementById('lbl-select-farm-hint-weather');
  if (selectorHint) selectorHint.classList.add('hidden');

  const content = document.getElementById('weather-content');
  content.classList.remove('hidden');

  try {
    const res = await fetch(`/api/farms/${farmId}/weather`);
    const data = await res.json();

    // Set soil moisture and evapotranspiration text values
    const latestMoisture = data.hourly.soil_moisture_0_to_1cm[0];
    const latestEvap = data.hourly.et0_fao_evapotranspiration[0];

    document.getElementById('val-soil-moisture').textContent = latestMoisture !== undefined ? `${latestMoisture} m³/m³` : '--';
    document.getElementById('val-evap').textContent = latestEvap !== undefined ? `${latestEvap} mm` : '--';

    renderWeatherChart(data.daily);
  } catch (err) {
    document.getElementById('val-soil-moisture').textContent = 'Offline';
    document.getElementById('val-evap').textContent = 'Offline';
  }
}

async function fetchNDVI(farmId) {
  const selectorHint = document.getElementById('lbl-select-farm-hint-ndvi');
  if (selectorHint) selectorHint.classList.add('hidden');

  const content = document.getElementById('ndvi-content');
  content.classList.remove('hidden');

  try {
    const res = await fetch(`/api/farms/${farmId}/satellite`);
    const data = await res.json();

    // Get current NDVI index (latest entry in time series)
    const latestNDVI = data[data.length - 1].ndvi;
    document.getElementById('val-ndvi').textContent = latestNDVI;

    // Slide NDVI indicator gauge
    const sliderIndicator = document.getElementById('ndvi-gauge-indicator');
    if (sliderIndicator) {
      // Scale from 0.0 -> 1.0 translates to 0% -> 100% position
      const percentagePosition = Math.min(Math.max(latestNDVI * 100, 0), 100);
      sliderIndicator.style.left = `${percentagePosition}%`;
    }

    renderNdviChart(data);
  } catch (err) {
    document.getElementById('val-ndvi').textContent = 'N/A';
  }
}

async function loadFAOSTATBenchmarks(crop = 'maize') {
  try {
    const res = await fetch(`/api/faostat/${crop}`);
    const data = await res.json();
    
    // Capitalize crop name for label
    const cropName = crop.charAt(0).toUpperCase() + crop.slice(1);
    renderBenchmarkChart(data, cropName);
  } catch (err) {
    console.warn('Failed to load yield benchmarks:', err);
  }
}

function resetDetailsPanels() {
  // Clear Overview Card
  document.getElementById('overview-content').innerHTML = `
    <p class="select-hint" id="lbl-select-farm-hint">${window.translate('lbl-select-farm-hint')}</p>
  `;

  // Clear Weather
  document.getElementById('weather-content').classList.add('hidden');
  const wHint = document.getElementById('lbl-select-farm-hint-weather');
  if (wHint) wHint.classList.remove('hidden');
  document.getElementById('val-soil-moisture').textContent = '--';
  document.getElementById('val-evap').textContent = '--';

  // Clear NDVI
  document.getElementById('ndvi-content').classList.add('hidden');
  const nHint = document.getElementById('lbl-select-farm-hint-ndvi');
  if (nHint) nHint.classList.remove('hidden');
  document.getElementById('val-ndvi').textContent = '--';
  const sliderIndicator = document.getElementById('ndvi-gauge-indicator');
  if (sliderIndicator) sliderIndicator.style.left = `0%`;

  // Hide bottom details below the map
  const bottomDetails = document.getElementById('map-bottom-details');
  if (bottomDetails) {
    bottomDetails.classList.add('hidden');
  }

  document.querySelector('.map-pane')?.classList.remove('farm-selected');

  // Restore Leaflet dimensions to full height
  invalidateMapSize();
}

/**
 * -------------------------------------------------------------
 * AI AGRICULTURAL CONSULTATION FLOW (OLMO ADVISOR)
 * -------------------------------------------------------------
 */
async function sendAdvisorMessage(messageText) {
  if (!messageText) return;

  const chatHistory = document.getElementById('advisor-chat-history');
  const inputEl = document.getElementById('advisor-input-text');
  const sendBtn = document.getElementById('btn-send-advisor');

  // 1. Append User Message to UI
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerHTML = `<p>${messageText}</p>`;
  chatHistory.appendChild(userMsg);
  
  // Clear input and scroll
  inputEl.value = '';
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // 2. Disable input & show thinking status
  inputEl.disabled = true;
  sendBtn.disabled = true;

  const thinkingMsg = document.createElement('div');
  thinkingMsg.className = 'chat-message thinking';
  thinkingMsg.innerHTML = `<span>⏳</span> <span>OLMO is thinking...</span>`;
  chatHistory.appendChild(thinkingMsg);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // 3. Extract current active farm context to enrich prompt
  let farmContext = null;
  if (activeFarmId) {
    const activeFarm = farms.find(f => f.id === activeFarmId);
    if (activeFarm) {
      const area = calculatePolygonArea(activeFarm.geometry);
      const centroid = calculatePolygonCentroid(activeFarm.geometry);
      const soilMoisture = document.getElementById('val-soil-moisture').textContent;
      const evap = document.getElementById('val-evap').textContent;
      const crop = document.getElementById('crop-select').value;

      farmContext = {
        name: activeFarm.name,
        size: area,
        centroid: `${centroid.lat}°N, ${centroid.lon}°W`,
        crop: crop,
        soilMoisture: soilMoisture,
        evap: evap
      };
    }
  }

  // 4. Query Express API Advisor proxy
  try {
    const res = await fetch('/api/advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: messageText,
        language: window.currentLanguage,
        farmContext: farmContext
      })
    });

    // Remove thinking message
    if (thinkingMsg.parentNode) {
      chatHistory.removeChild(thinkingMsg);
    }

    if (res.ok) {
      const data = await res.json();
      
      // Append Bot response
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-message bot';
      botMsg.innerHTML = `
        <p>${data.reply}</p>
        <button class="chat-speech-btn" onclick="speakMessage(this)" title="Speak response">🔊</button>
      `;
      chatHistory.appendChild(botMsg);
    } else {
      const err = await res.json();
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-message bot';
      botMsg.innerHTML = `
        <p style="color: var(--color-danger)">Error: ${err.error || 'Failed to fetch AI advice.'}</p>
        <button class="chat-speech-btn" onclick="speakMessage(this)" title="Speak response">🔊</button>
      `;
      chatHistory.appendChild(botMsg);
    }
  } catch (err) {
    if (thinkingMsg.parentNode) {
      chatHistory.removeChild(thinkingMsg);
    }
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot';
    botMsg.innerHTML = `
      <p style="color: var(--color-danger)">Offline: Unable to contact AI Advisor.</p>
      <button class="chat-speech-btn" onclick="speakMessage(this)" title="Speak response">🔊</button>
    `;
    chatHistory.appendChild(botMsg);
  } finally {
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}

/**
 * -------------------------------------------------------------
 * OFFLINE / PWA SYSTEM CONNECTIVITY MONITORS
 * -------------------------------------------------------------
 */
function updateNetworkStatus() {
  const badge = document.getElementById('connection-badge');
  const badgeText = document.getElementById('lbl-status-online');

  if (navigator.onLine) {
    badge.className = 'badge online';
    badgeText.textContent = window.translate('lbl-status-online');
  } else {
    badge.className = 'badge offline';
    badgeText.textContent = window.translate('lbl-status-offline');
  }
}

/**
 * -------------------------------------------------------------
 * PHASE 2 STATE ROUTER & NOMINATIM GEOLOCATION SEARCH ENGINE
 * -------------------------------------------------------------
 */

/**
 * Transitions layout states between Home screen and Dashboard map view.
 * Integrates native SPA View Transitions API if supported.
 * @param {string} viewName - 'home' | 'dashboard'
 */
function navigateToView(viewName) {
  const updateDOM = () => {
    const homeView = document.getElementById('home-view');
    const dashboardView = document.getElementById('dashboard-view');
    const backHomeBtn = document.getElementById('btn-back-home');

    if (viewName === 'home') {
      homeView.classList.remove('hidden');
      dashboardView.classList.add('hidden');
      backHomeBtn.classList.add('hidden');
    } else {
      homeView.classList.add('hidden');
      dashboardView.classList.remove('hidden');
      backHomeBtn.classList.remove('hidden');

      // Trigger map resize invalidate size to ensure Leaflet renders correctly
      setTimeout(() => {
        invalidateMapSize();
      }, 80);
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(() => updateDOM());
  } else {
    updateDOM();
  }
}

/**
 * Asynchronously searches for regions / towns in Ghana.
 * Integrates OSM Nominatim lookup with robust offline preset hub fallback.
 */
async function handleMapSearch() {
  const input = document.getElementById('map-search-input');
  const query = input.value.trim().toLowerCase();
  if (!query) return;

  // 1. Online Nominatim geocoding check
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=Ghana+${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lon = parseFloat(first.lon);
        
        flyToCoords(lat, lon, 15);
        return;
      }
    }
  } catch (err) {
    console.warn('Nominatim API geocoder failed, attempting local catalog fallback:', err.message);
  }

  // 2. Offline presets lookup matching query string
  let matchedPlace = null;
  Object.keys(LOCAL_GHANA_PLACES).forEach(key => {
    if (query.includes(key) || key.includes(query)) {
      matchedPlace = LOCAL_GHANA_PLACES[key];
    }
  });

  if (matchedPlace) {
    flyToCoords(matchedPlace.lat, matchedPlace.lon, matchedPlace.zoom);
  } else {
    const isTwi = window.currentLanguage === 'ak';
    const isEwe = window.currentLanguage === 'ee';
    
    let alertMsg = 'Location not found. Try searching Kumasi, Techiman, Tamale, or Accra.';
    if (isTwi) {
      alertMsg = 'Yɛantumi anhu beaeɛ no. Hwehwɛ Kumasi, Techiman, Tamale anaa Accra.';
    } else if (isEwe) {
      alertMsg = 'Womedze teƒea ɖo o. Dii Kumasi, Techiman, Tamale alo Accra kpɔ.';
    }
    
    alert(alertMsg);
  }
}

// Bind to window to allow global trigger calls if needed
window.navigateToView = navigateToView;
window.handleMapSearch = handleMapSearch;

/**
 * -------------------------------------------------------------
 * PHASE 2 AUTOCOMPLETE SUGGESTIONS ENGINE
 * -------------------------------------------------------------
 */

let autocompleteTimeout = null;
let activeSuggestionIndex = -1;

/**
 * Triggers autocomplete search on typing
 */
function handleSearchInput(e) {
  const query = e.target.value.trim().toLowerCase();
  clearTimeout(autocompleteTimeout);
  activeSuggestionIndex = -1;

  if (query.length < 2) {
    hideSuggestions();
    return;
  }

  autocompleteTimeout = setTimeout(async () => {
    await showSuggestions(query);
  }, 250);
}

/**
 * Handles keyboard navigation inside autocomplete list
 */
function handleSearchKeydown(e) {
  const listContainer = document.getElementById('search-autocomplete-list');
  if (!listContainer || listContainer.classList.contains('hidden')) return;

  const items = listContainer.querySelectorAll('.autocomplete-item');
  if (items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
    highlightActiveSuggestion(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
    highlightActiveSuggestion(items);
  } else if (e.key === 'Enter') {
    if (activeSuggestionIndex >= 0) {
      e.preventDefault();
      items[activeSuggestionIndex].click();
    } else {
      // Default Enter searches immediately
      hideSuggestions();
      handleMapSearch();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    hideSuggestions();
  }
}

/**
 * Highlights selected suggestion
 */
function highlightActiveSuggestion(items) {
  items.forEach((item, index) => {
    if (index === activeSuggestionIndex) {
      item.classList.add('active');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Performs geocoder suggestion lookup and renders options
 */
async function showSuggestions(query) {
  const listContainer = document.getElementById('search-autocomplete-list');
  listContainer.innerHTML = '';
  
  let suggestions = [];

  // 1. Gather matching local agricultural presets
  Object.keys(LOCAL_GHANA_PLACES).forEach(key => {
    if (key.includes(query)) {
      suggestions.push({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        lat: LOCAL_GHANA_PLACES[key].lat,
        lon: LOCAL_GHANA_PLACES[key].lon,
        details: 'Ghana agricultural hub preset (offline)'
      });
    }
  });

  // 2. Query Nominatim geocoder if online
  if (navigator.onLine) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=Ghana+${encodeURIComponent(query)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        data.forEach(item => {
          const shortName = item.display_name.split(',')[0];
          const addressDetails = item.display_name.split(',').slice(1, 3).join(',').trim();
          
          // Deduplicate by name
          const exists = suggestions.some(s => s.name.toLowerCase() === shortName.toLowerCase());
          if (!exists) {
            suggestions.push({
              name: shortName,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
              details: addressDetails
            });
          }
        });
      }
    } catch (err) {
      console.warn('Nominatim autocomplete suggestion query failed:', err);
    }
  }

  if (suggestions.length === 0) {
    listContainer.classList.add('hidden');
    return;
  }

  // Render suggestions dropdown
  listContainer.classList.remove('hidden');
  
  suggestions.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'autocomplete-item';
    el.dataset.index = index;
    
    el.innerHTML = `
      <span class="ac-item-name">📍 ${item.name}</span>
      ${item.details ? `<span class="ac-item-details">${item.details}</span>` : ''}
    `;
    
    el.addEventListener('click', () => {
      selectSuggestion(item);
    });
    
    listContainer.appendChild(el);
  });
}

/**
 * Selects an autocomplete suggestion and centers map
 */
function selectSuggestion(item) {
  const input = document.getElementById('map-search-input');
  input.value = item.name;
  flyToCoords(item.lat, item.lon, 15);
  hideSuggestions();
}

/**
 * Closes the suggestions dropdown panel
 */
function hideSuggestions() {
  const listContainer = document.getElementById('search-autocomplete-list');
  if (listContainer) {
    listContainer.classList.add('hidden');
  }
  activeSuggestionIndex = -1;
}

// Register document click listener to close suggestions when clicking outside
document.addEventListener('click', (e) => {
  const container = document.querySelector('.map-search-container');
  if (container && !container.contains(e.target)) {
    hideSuggestions();
  }
});

// Register keyup listeners to clear suggestions when search bar emptied
document.getElementById('map-search-input').addEventListener('keyup', (e) => {
  if (e.target.value.trim().length === 0) {
    hideSuggestions();
  }
});

window.hideSuggestions = hideSuggestions;
window.selectSuggestion = selectSuggestion;

/**
 * Populates the Text-to-Speech (TTS) voice selection dropdown.
 */
function populateVoices() {
  const voiceSelect = document.getElementById('tts-voice-select');
  if (!voiceSelect) return;
  
  const voices = window.speechSynthesis.getVoices();
  voiceSelect.innerHTML = '';
  
  if (voices.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = window.translate('lbl-tts-select-voice') || 'Loading System Speech Voices...';
    voiceSelect.appendChild(opt);
    return;
  }
  
  // Sort English voices first, then sort by language/name
  const sortedVoices = [...voices].sort((a, b) => {
    const aIsEn = a.lang.startsWith('en');
    const bIsEn = b.lang.startsWith('en');
    if (aIsEn && !bIsEn) return -1;
    if (!aIsEn && bIsEn) return 1;
    return a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name);
  });
  
  sortedVoices.forEach(voice => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    
    // Auto-select standard English or Google voices by default
    if (voice.lang.startsWith('en') && (voice.name.includes('Google') || voice.name.includes('Natural')) && !voiceSelect.value) {
      option.selected = true;
    }
    
    voiceSelect.appendChild(option);
  });
}

// Global state tracker for external audio instances (like GhanaNLP wav synthesis)
let activeTtsAudio = null;

/**
 * Text-to-Speech (TTS) Speak / Stop toggle function.
 * Integrates premium GhanaNLP speech APIs for local Twi/Ewe, falling back to browser-native synthesis.
 */
async function speakMessage(btnElement) {
  const msgContainer = btnElement.closest('.chat-message');
  if (!msgContainer) return;
  const p = msgContainer.querySelector('p');
  if (!p) return;
  
  const text = p.textContent;
  
  // If clicking an already speaking button, cancel speech and reset
  if (btnElement.classList.contains('speaking')) {
    window.speechSynthesis.cancel();
    if (activeTtsAudio) {
      activeTtsAudio.pause();
      activeTtsAudio = null;
    }
    btnElement.classList.remove('speaking');
    btnElement.innerHTML = '🔊';
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  if (activeTtsAudio) {
    activeTtsAudio.pause();
    activeTtsAudio = null;
  }
  
  // Reset all other speaking buttons
  document.querySelectorAll('.chat-speech-btn').forEach(btn => {
    btn.classList.remove('speaking');
    btn.innerHTML = '🔊';
  });
  
  // Detect active language and check if it requires GhanaNLP (Twi or Ewe)
  const activeLang = window.currentLanguage || 'en';
  
  if (activeLang === 'ak' || activeLang === 'ee') {
    // Map local codes to GhanaNLP codes: Akan/Twi -> tw, Ewe -> ee
    const mappedLang = activeLang === 'ak' ? 'tw' : 'ee';
    
    btnElement.classList.add('speaking');
    btnElement.innerHTML = '⏳'; // Thinking indicator while streaming
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: mappedLang })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
        activeTtsAudio = new Audio(audioUrl);
        
        activeTtsAudio.onplay = () => {
          btnElement.classList.add('speaking');
          btnElement.innerHTML = '⏸️';
        };
        
        activeTtsAudio.onended = () => {
          btnElement.classList.remove('speaking');
          btnElement.innerHTML = '🔊';
          activeTtsAudio = null;
        };
        
        activeTtsAudio.onerror = () => {
          activeTtsAudio = null;
          fallbackToNativeSpeech(text, btnElement);
        };
        
        await activeTtsAudio.play();
      } else {
        // Fallback on HTTP errors (e.g. key not configured)
        fallbackToNativeSpeech(text, btnElement);
      }
    } catch (err) {
      // Fallback on network errors
      fallbackToNativeSpeech(text, btnElement);
    }
  } else {
    // English default fallback to native SpeechSynthesis
    fallbackToNativeSpeech(text, btnElement);
  }
}

/**
 * Fallback controller invoking browser-native SpeechSynthesisUtterance.
 */
function fallbackToNativeSpeech(text, btnElement) {
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Apply selected voice
  const voiceSelect = document.getElementById('tts-voice-select');
  if (voiceSelect && voiceSelect.value) {
    const selectedVoiceName = voiceSelect.value;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === selectedVoiceName);
    if (voice) {
      utterance.voice = voice;
    }
  }
  
  // Interactive UI indicators (start / end / error states)
  utterance.onstart = () => {
    btnElement.classList.add('speaking');
    btnElement.innerHTML = '⏸️'; // Play -> Stop/Pause indicator
  };
  
  utterance.onend = () => {
    btnElement.classList.remove('speaking');
    btnElement.innerHTML = '🔊';
  };
  
  utterance.onerror = () => {
    btnElement.classList.remove('speaking');
    btnElement.innerHTML = '🔊';
  };
  
  window.speechSynthesis.speak(utterance);
}

window.populateVoices = populateVoices;
window.speakMessage = speakMessage;
