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
let activeTtsAudio = null;

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
  toggleTtsButtons('en');

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

    // Toggle speech button visibility depending on active language
    toggleTtsButtons(e.detail.language);
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

  document.getElementById('btn-go-weather').addEventListener('click', () => navigateToView('dashboard', 'weather'));
  document.getElementById('btn-go-ndvi').addEventListener('click', () => navigateToView('dashboard', 'ndvi'));
  document.getElementById('btn-go-yield').addEventListener('click', () => navigateToView('dashboard', 'yield'));
  document.getElementById('btn-go-advisor').addEventListener('click', () => navigateToView('dashboard', 'advisor'));

  // Ghana location search triggers
  const searchInput = document.getElementById('map-search-input');
  searchInput.addEventListener('input', handleSearchInput);
  searchInput.addEventListener('keydown', handleSearchKeydown);
  document.getElementById('btn-map-search').addEventListener('click', handleMapSearch);

  // Dashboard Tab Switching click handlers
  document.querySelectorAll('.map-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // NDVI Anomaly AI Consultation CTA button
  const ndviCtaBtn = document.getElementById('btn-ndvi-anomaly-cta');
  if (ndviCtaBtn) {
    ndviCtaBtn.addEventListener('click', () => {
      const activeLang = window.currentLanguage || 'en';
      let promptText = "I noticed a vegetation crop vigor NDVI anomaly during the peak wet season on my farm. What are the recommended diagnostics and treatments for Fall Armyworm or water-logging?";
      if (activeLang === 'ak') {
        promptText = "Mahu sɛ wiem nsakyerae nnɔbae yiedie kɔ fam wɔ m'afuw so wiem asutɔ bere yi mu. Afutuo bɛn na wode bɛma me fa Fall Armyworm anaa asase mu nsuo dodo ho?";
      } else if (activeLang === 'ee') {
        promptText = "Mede dzesi be nye agble nukuwo le gbegblẽm le tsidodo ƒe nɔnɔme sia me. Aɖaŋuɖoɖo kawo le wò si tso nuku dɔlelewo alo Fall Armyworm gbegblẽnuwo ŋuti?";
      }
      sendAdvisorMessage(promptText);
    });
  }

  // Yield Gap Calculator trigger
  const calcYieldBtn = document.getElementById('btn-calculate-yield-gap');
  if (calcYieldBtn) {
    calcYieldBtn.addEventListener('click', () => {
      calculateYieldGap();
    });
  }
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

  // Reset yield gap calculations when switching farms
  const inputEl = document.getElementById('input-farmer-yield');
  if (inputEl) inputEl.value = '';
  const resultsContainer = document.getElementById('yield-estimator-results');
  if (resultsContainer) resultsContainer.classList.add('hidden');

  // Default switch to weather tab on selecting a new farm
  switchTab('weather');

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
    const rainForecastList = data.daily.precipitation_sum;

    document.getElementById('val-soil-moisture').textContent = latestMoisture !== undefined ? `${latestMoisture} m³/m³` : '--';
    document.getElementById('val-evap').textContent = latestEvap !== undefined ? `${latestEvap} mm` : '--';

    calculateSowingSuitability(latestMoisture, rainForecastList);

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

    analyzeNDVI(latestNDVI, data);

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

  // Reset yield calculator inputs and results
  const inputEl = document.getElementById('input-farmer-yield');
  if (inputEl) inputEl.value = '';
  const resultsContainer = document.getElementById('yield-estimator-results');
  if (resultsContainer) resultsContainer.classList.add('hidden');

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
      const isEnglish = (window.currentLanguage === 'en');
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-message bot';
      botMsg.innerHTML = `
        <p>${data.reply}</p>
        ${isEnglish ? '' : '<button class="chat-speech-btn" onclick="speakMessage(this)" title="Speak response">🔊</button>'}
      `;
      chatHistory.appendChild(botMsg);
    } else {
      const err = await res.json();
      const isEnglish = (window.currentLanguage === 'en');
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-message bot';
      botMsg.innerHTML = `
        <p style="color: var(--color-danger)">Error: ${err.error || 'Failed to fetch AI advice.'}</p>
        ${isEnglish ? '' : '<button class="chat-speech-btn" onclick="speakMessage(this)" title="Speak response">🔊</button>'}
      `;
      chatHistory.appendChild(botMsg);
    }
  } catch (err) {
    if (thinkingMsg.parentNode) {
      chatHistory.removeChild(thinkingMsg);
    }
    const isEnglish = (window.currentLanguage === 'en');
    const botMsg = document.createElement('div');
    botMsg.className = 'chat-message bot';
    botMsg.innerHTML = `
      <p style="color: var(--color-danger)">Offline: Unable to contact AI Advisor.</p>
      ${isEnglish ? '' : '<button class="chat-speech-btn" onclick="speakMessage(this)" title="Speak response">🔊</button>'}
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
 * Displays a premium custom floating notification banner.
 */
function showNotification(message, type = 'info') {
  const existing = document.getElementById('app-toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'app-toast-notification';
  toast.className = `toast-banner toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">💡</span>
    <span class="toast-message">${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

/**
 * Focuses and smoothly scrolls the user interface to a specific dashboard section,
 * flashing the container with a premium spotlight glow.
 */
function handleSectionFocus(target) {
  // Clear any existing active glows
  document.querySelectorAll('.highlight-glow').forEach(el => {
    el.classList.remove('highlight-glow');
  });

  if (target === 'advisor') {
    const advisorCard = document.querySelector('.advisor-card');
    const advisorInput = document.getElementById('advisor-input-text');
    if (advisorCard) {
      advisorCard.classList.add('highlight-glow');
      advisorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        advisorCard.classList.remove('highlight-glow');
      }, 4000);
    }
    if (advisorInput) {
      setTimeout(() => advisorInput.focus(), 600);
    }
    return;
  }

  // If selecting a bottom-card panel feature, verify if a farm boundary is active
  if (!activeFarmId) {
    // Scroll and pulse highlight the Farms management card to alert the user
    const farmsCard = document.querySelector('.farms-card');
    if (farmsCard) {
      farmsCard.classList.add('highlight-glow');
      farmsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        farmsCard.classList.remove('highlight-glow');
      }, 4000);
    }

    // Display a beautiful translated instruction toast matching the query
    const translationKey = `toast-select-farm-${target}`;
    const msg = window.translate(translationKey) || "Please select or draw a farm first!";
    showNotification(msg, 'info');
    return;
  }

  // Farm is active, scroll to the designated card block
  let selector = '';
  if (target === 'weather') {
    selector = '.weather-card';
  } else if (target === 'ndvi') {
    selector = '.vegetation-card';
  } else if (target === 'yield') {
    selector = '.benchmark-card';
  }

  const targetCard = document.querySelector(selector);
  if (targetCard) {
    targetCard.classList.add('highlight-glow');
    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      targetCard.classList.remove('highlight-glow');
    }, 4000);
  }
}

/**
 * Transitions layout states between Home screen and Dashboard map view.
 * Integrates native SPA View Transitions API if supported.
 * @param {string} viewName - 'home' | 'dashboard'
 * @param {string|null} targetFocus - Target dashboard element to spotlight
 */
function navigateToView(viewName, targetFocus = null) {
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
        
        // Execute premium focus and spotlight highlighting
        if (targetFocus) {
          handleSectionFocus(targetFocus);
        }
      }, 100);
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
 * Text-to-Speech (TTS) Speak / Stop toggle function.
 * Integrates premium GhanaNLP speech APIs for local Twi/Ewe.
 */
async function speakMessage(btnElement) {
  const msgContainer = btnElement.closest('.chat-message');
  if (!msgContainer) return;
  const p = msgContainer.querySelector('p');
  if (!p) return;
  
  const text = p.textContent;
  
  // If clicking an already speaking button, cancel speech and reset
  if (btnElement.classList.contains('speaking')) {
    if (activeTtsAudio) {
      activeTtsAudio.pause();
      activeTtsAudio = null;
    }
    btnElement.classList.remove('speaking');
    btnElement.innerHTML = '🔊';
    return;
  }
  
  // Cancel any ongoing speech
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
          btnElement.classList.remove('speaking');
          btnElement.innerHTML = '🔊';
          activeTtsAudio = null;
        };
        
        await activeTtsAudio.play();
      } else {
        btnElement.classList.remove('speaking');
        btnElement.innerHTML = '🔊';
      }
    } catch (err) {
      btnElement.classList.remove('speaking');
      btnElement.innerHTML = '🔊';
    }
  }
}

/**
 * Toggles visibility of all chat speech buttons depending on language.
 * Speech synthesis is restricted to premium local languages (Twi, Ewe) supported by GhanaNLP.
 */
function toggleTtsButtons(lang) {
  const isEnglish = (lang === 'en');
  document.querySelectorAll('.chat-speech-btn').forEach(btn => {
    if (isEnglish) {
      btn.classList.add('hidden');
    } else {
      btn.classList.remove('hidden');
    }
  });
}

window.speakMessage = speakMessage;
window.toggleTtsButtons = toggleTtsButtons;
window.switchTab = switchTab;

/**
 * Switches the active dashboard tab pane.
 * @param {string} tabId - 'weather' | 'ndvi' | 'yield'
 */
function switchTab(tabId) {
  // 1. Update tab buttons active classes
  document.querySelectorAll('.map-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 2. Show only the corresponding card pane
  document.querySelectorAll('.bottom-card[data-tab]').forEach(card => {
    if (card.getAttribute('data-tab') === tabId) {
      card.classList.add('active-tab-pane');
    } else {
      card.classList.remove('active-tab-pane');
    }
  });

  // Trigger Leaflet map resize re-evaluation in case bounding boxes changed
  invalidateMapSize();
}

/**
 * Calculates sowing suitability based on soil moisture and upcoming rainfall.
 */
function calculateSowingSuitability(soilMoisture, dailyRainfallList) {
  if (soilMoisture === undefined || isNaN(soilMoisture)) return;

  // Sowing suitability base calculation
  let score = 30; // base score

  // 1. Soil moisture contribution
  if (soilMoisture >= 0.25 && soilMoisture <= 0.45) {
    score += 40; // Optimal range
  } else if (soilMoisture > 0.15 && soilMoisture < 0.25) {
    score += 15; // Moderate/dryish
  } else if (soilMoisture > 0.45 && soilMoisture <= 0.55) {
    score += 15; // Slightly too wet
  } // Very dry (<0.15) or saturated (>0.55) gives 0 extra points

  // 2. Next 3 days rainfall forecast sum
  const next3DaysRain = dailyRainfallList ? dailyRainfallList.slice(0, 3).reduce((a, b) => a + b, 0) : 0;
  if (next3DaysRain >= 5 && next3DaysRain <= 25) {
    score += 30; // Perfect light-to-moderate rain forecast to nurture seeds
  } else if (next3DaysRain > 25 && next3DaysRain <= 45) {
    score += 10; // Slightly heavy rain, could cause minor runoff
  } else if (next3DaysRain > 45) {
    score -= 20; // Heavy rains forecasted! Warning: danger of seed washout!
  } else {
    // No rain
    score += 5; // Dry but safe
  }

  // Constrain between 10% and 95%
  score = Math.min(Math.max(score, 10), 95);

  // Update UI circular progress bar
  const valueEl = document.getElementById('sowing-gauge-value');
  const fillEl = document.getElementById('sowing-gauge-fill');
  const badgeEl = document.getElementById('sowing-suitability-badge');
  const textEl = document.getElementById('sowing-advisory-text');

  if (valueEl) valueEl.textContent = `${score}%`;
  if (fillEl) {
    const deg = (score / 100) * 360 - 45;
    fillEl.style.transform = `rotate(${deg}deg)`;
  }

  // Get status level and colors
  let status = 'optimal';
  let badgeText = 'Optimal';
  if (score < 40) {
    status = 'critical';
    badgeText = 'Poor';
  } else if (score < 70) {
    status = 'warning';
    badgeText = 'Fair';
  }

  if (badgeEl) {
    badgeEl.className = `sowing-score-badge ${status}`;
    // Localize status
    let localizedBadgeText = badgeText;
    if (window.currentLanguage === 'ak') {
      localizedBadgeText = status === 'optimal' ? 'Pa Pa Pa' : (status === 'warning' ? 'Bɔkɔɔ' : 'Nnyɛ Koraa');
    } else if (window.currentLanguage === 'ee') {
      localizedBadgeText = status === 'optimal' ? 'Enyo Ŋutɔ' : (status === 'warning' ? 'Enyo' : 'Vɔ̃ɖi');
    }
    badgeEl.textContent = localizedBadgeText;
  }

  // Formulate dynamic agronomic recommendation advisory texts
  let advisoryText = '';
  if (window.currentLanguage === 'ak') { // Twi
    if (status === 'optimal') {
      advisoryText = `Dɔteɛ mu nsuo (${soilMoisture} m³/m³) ne wiem tebea yɛ pa kɛseɛ ma nnɔbae dua! April/May asutɔ bere yi mu yɛ bere pa a wode bɛdua aburo anaa nnɔbae foforo. Osu a ɛbɛtɔ bɔkɔɔ nso bɛboa mma nnɔbae no fifi ntɛm.`;
    } else if (status === 'warning') {
      advisoryText = `Asase no tebea yɛ bɔkɔɔ. Dɔteɛ no yɛ kyeneee kakra anaa osu a ɛbɛtɔ no dɔɔso. Sɛ wodua a, hwɛ spacing no yie anaa twɛn nna kakra na asase no mu nsuo ahotew pa ara.`;
    } else {
      advisoryText = `Asiane! Dɔteɛ no yɛ kyeneee dodo (${soilMoisture} m³/m³) anaa osu kɛseɛ a ɛbɛtɔ bɛsɛe aba no. Yɛsrɛ wo, twɛn kosi sɛ dɔteɛ no bɛyɛ mmerɛw anaa wiem ahotew pa ara ansa na woadua.`;
    }
  } else if (window.currentLanguage === 'ee') { // Ewe
    if (status === 'optimal') {
      advisoryText = `Anyigba me tsitsi (${soilMoisture} m³/m³) sɔ kplikpa na nugbledodo! Dame ya me nɔnɔmewo le nyuie nutɔ na bli dodo. Tsidodo si le gbɔgblɔm la akpe ɖe nukuwo ŋu ne woagblẽ kaba.`;
    } else if (status === 'warning') {
      advisoryText = `Anyigba ƒe nɔnɔme sɔ va se ɖe aƒe aɖe me. Anyigba la ƒu kura alo tsidodo nɔ gbɔgblɔm. Ne de nukuwo la, le ŋku ɖe wo lolome ŋuti alo lalã vie na anyigba nafa nyuie.`;
    } else {
      advisoryText = `Nuxɔxlɔ̃! Anyigba ƒe tsitsi sɔbɔ ɖe anyi gblẽ (${soilMoisture} m³/m³) alo tsidodo kpli tsi kɛsewo le nugblẽm na nuku dodo. Mia lalã tsitsitsi na ya me nɔnɔme naɖɔ ɖo.`;
    }
  } else { // English
    if (status === 'optimal') {
      advisoryText = `Soil moisture (${soilMoisture} m³/m³) and upcoming moderate rain are optimal for planting! This is an ideal sowing window to maximize seed germination rates.`;
    } else if (status === 'warning') {
      advisoryText = `Planting conditions are fair. Soil moisture is slightly dry or excessive rainfall is expected. Plant with care or consider waiting 2-3 days for more stable soil conditions.`;
    } else {
      advisoryText = `Planting is not recommended. Soil moisture is extremely low (${soilMoisture} m³/m³) or upcoming heavy rainfall poses a severe risk of washing away seeds. Wait for better weather.`;
    }
  }

  if (textEl) textEl.textContent = advisoryText;
}

/**
 * Analyzes vegetation health indices and triggers anomaly warnings.
 */
function analyzeNDVI(latestNDVI, historicalData) {
  if (latestNDVI === undefined || isNaN(latestNDVI)) return;

  const alertContainer = document.getElementById('ndvi-anomaly-alert');
  const iconEl = document.getElementById('ndvi-anomaly-icon');
  const titleEl = document.getElementById('lbl-ndvi-status-title');
  const descEl = document.getElementById('val-ndvi-status-desc');
  const ctaBtn = document.getElementById('btn-ndvi-anomaly-cta');

  // Classification & Anomaly thresholds
  let vigorState = 'optimal';
  let titleText = 'Optimal Vigor';
  let descText = 'Crop leaf density is at peak healthy vegetative stages.';
  let iconText = '🌿';

  if (latestNDVI < 0.2) {
    vigorState = 'bare';
    titleText = 'Bare Soil / Unvegetated';
    descText = 'Field is recently harvested, plowed, or cleared of all crop residues.';
    iconText = '🚜';
  } else if (latestNDVI < 0.45) {
    vigorState = 'stressed';
    titleText = 'Moderate to Stressed Vigor';
    descText = 'Crops show sparse foliage. Could indicate low nutrient levels or moisture stress.';
    iconText = '🍂';
  }

  // Anomaly Detection: check if there's a drop compared to historical average or wet-season average
  const today = new Date();
  const currentMonth = today.getMonth(); // 0 - 11
  const isWetSeason = (currentMonth >= 4 && currentMonth <= 9); // May to October

  let isAnomaly = false;
  if (isWetSeason && latestNDVI < 0.45) {
    isAnomaly = true;
    vigorState = 'anomaly';
    titleText = '⚠️ Wet-Season Crop Vigor Anomaly!';
    descText = 'Alert: Crop leaf coverage is critically low during peak tropical wet season! This indicates severe localized crop stress, possible Fall Armyworm infestation, or heavy water-logging.';
    iconText = '⚠️';
  }

  // Localize text output
  if (window.currentLanguage === 'ak') { // Twi
    if (vigorState === 'optimal') {
      titleText = 'Nnɔbae Yiedie Pa';
      descText = 'W\'afuw nnɔbae ahaban mu yɛ kɛseɛ na ɛyɛ green pa ara. Wiem tebea ne asase aduane nso yɛ kɛseɛ.';
      iconText = '🌿';
    } else if (vigorState === 'bare') {
      titleText = 'Asase Kyeneee / Asase Ahotew';
      descText = 'Asase no so nnɔbae koraa. Ɛbɛtumi ayɛ sɛ woatwa nnɔbae anaa woaprow asase no foforo.';
      iconText = '🚜';
    } else if (vigorState === 'stressed') {
      titleText = 'Nnɔbae Ahaban mu Yɛ Mmerɛw';
      descText = 'Nnɔbae ahaban no bi refi ase reyɛ yellow na ɛnfififi ntɛm. Hwɛ asase mu aduane anaa nsuo yie.';
      iconText = '🍂';
    } else if (vigorState === 'anomaly') {
      titleText = '⚠️ Wiem Nsakyerae Nnɔbae Asia!';
      descText = 'Kokobrane! Osu tɔ bere yi mu nso w\'afuw yiedie su yɛ mmerɛw dodo! Ɛbɛtumi ayɛ Fall Armyworm mmoawaɔsɛe anaa nsuo a ɛkora dodo wɔ asase mu.';
      iconText = '⚠️';
    }
  } else if (window.currentLanguage === 'ee') { // Ewe
    if (vigorState === 'optimal') {
      titleText = 'Nugble Lãmesẽ Kplikpa';
      descText = 'Nukuwo le lãmesẽ kple nuku aɖaŋu me nyuie ŋutɔ. Anyigba me nsuo sɔ kplikpa na wo lolome.';
      iconText = '🌿';
    } else if (vigorState === 'bare') {
      titleText = 'Anyigba Ƒuƒu / Harvest Wɔwɔ';
      descText = 'Nuku aɖeke le anyigba dzi o. Anyigbahata ƒo anyi kpoo alo Harvest nya wɔwɔ vɔ.';
      iconText = '🚜';
    } else if (vigorState === 'stressed') {
      titleText = 'Nuku Lãmesẽ Le Gbegblẽm';
      descText = 'Nuku ahabanwo le yellow-m alo tsidodo le anyigba me gbegblẽm na wo kaba.';
      iconText = '🍂';
    } else if (vigorState === 'anomaly') {
      titleText = '⚠️ Agble Nuku Gbegblẽ Kɛsewo!';
      descText = 'Nuxɔxlɔ̃! Le tsidodo ƒe agblenɔnɔme me na nukuwo ƒe lãmesẽ gblẽ dodo! Mate ŋu anye nuku dɔlelewo alo Fall Armyworm mmoawawo ƒe agblenugblẽ.';
      iconText = '⚠️';
    }
  }

  // Update UI Elements
  if (iconEl) iconEl.textContent = iconText;
  if (titleEl) titleEl.textContent = titleText;
  if (descEl) descEl.textContent = descText;

  if (alertContainer) {
    if (vigorState === 'optimal') {
      alertContainer.className = 'ndvi-anomaly-alert healthy';
      alertContainer.style.background = '';
      alertContainer.style.borderColor = '';
    } else if (vigorState === 'anomaly') {
      alertContainer.className = 'ndvi-anomaly-alert';
      alertContainer.style.background = 'rgba(239, 68, 68, 0.08)';
      alertContainer.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    } else {
      alertContainer.className = 'ndvi-anomaly-alert';
      alertContainer.style.background = 'rgba(234, 179, 8, 0.06)';
      alertContainer.style.borderColor = 'rgba(234, 179, 8, 0.2)';
    }
  }

  // Enable/Disable AI CTA
  if (ctaBtn) {
    if (vigorState === 'anomaly' || vigorState === 'stressed') {
      ctaBtn.classList.remove('hidden');
    } else {
      ctaBtn.classList.add('hidden');
    }
  }
}

/**
 * Calculates Yield Gap and Profitability Returns in Ghana Cedis.
 */
function calculateYieldGap() {
  const inputEl = document.getElementById('input-farmer-yield');
  const unitEl = document.getElementById('select-harvest-unit');
  const resultsContainer = document.getElementById('yield-estimator-results');
  const gapEl = document.getElementById('val-result-yield-gap');
  const valueEl = document.getElementById('val-result-est-value');
  const adviceEl = document.getElementById('yield-estimator-advice');

  if (!inputEl || !activeFarmId) return;

  const rawVal = parseFloat(inputEl.value);
  if (isNaN(rawVal) || rawVal < 0) return;

  const activeFarm = farms.find(f => f.id === activeFarmId);
  if (!activeFarm) return;

  const crop = document.getElementById('crop-select').value;
  
  // 1. Get 2024 Benchmark Yield
  const benchmarks = { maize: 2.32, rice: 3.15, cassava: 22.4, cocoa: 0.58 };
  const benchmarkYield = benchmarks[crop] || 2.3;

  // 2. Convert Farmer yield to Tonnes per Hectare
  let farmerYieldTonnesHa = rawVal;
  if (unitEl.value === 'bags_acre') {
    // 1 bag = 0.1 tonnes. 1 hectare = 2.471 acres.
    farmerYieldTonnesHa = rawVal * 0.1 * 2.471;
  }

  // 3. Compute Yield Gap
  const yieldGap = benchmarkYield - farmerYieldTonnesHa;

  // 4. Compute Estimated Revenue in Ghana Cedis (GHS)
  // Average crop wholesale market value per tonne in Ghana GHS
  const cropPricesGHS = { maize: 4500, rice: 8000, cassava: 2200, cocoa: 48000 };
  const pricePerTonne = cropPricesGHS[crop] || 4000;

  const farmAreaHectares = calculatePolygonArea(activeFarm.geometry);
  const totalTonnesHarvested = farmerYieldTonnesHa * farmAreaHectares;
  const estimatedMarketValue = totalTonnesHarvested * pricePerTonne;

  // 5. Render results
  if (resultsContainer) resultsContainer.classList.remove('hidden');

  if (gapEl) {
    gapEl.textContent = `${yieldGap.toFixed(2)} t/ha`;
    if (yieldGap > 0) {
      gapEl.className = 'yield-result-val highlight-red';
    } else {
      gapEl.className = 'yield-result-val highlight-green';
    }
  }

  if (valueEl) {
    valueEl.textContent = `GHS ${estimatedMarketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  // 6. Localized agronomic profitability advisor text
  let advisoryAdvice = '';
  if (window.currentLanguage === 'ak') { // Twi
    if (yieldGap > 0) {
      const lostRevenue = yieldGap * farmAreaHectares * pricePerTonne;
      advisoryAdvice = `💡 W'afuw Yield Gap yɛ ${yieldGap.toFixed(2)} t/ha compared to Ghana nsenkyerɛnne. Sɛ wode hybrid nnɔbae aba ne spacing pa di dwuma na woasi yield gap yi ano a, wobe nya **GHS ${lostRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}** foforo wɔ w'afuw (${farmAreaHectares} ha) so!`;
    } else {
      advisoryAdvice = `🏆 Incredibly done! W'afuw abupuo sɔso sen Ghana FAOSTAT average yield. Woyɛ smallholder kuafoɔ pa ara! Kora w'asase yiedie ne nnɔbae kora pa no so.`;
    }
  } else if (window.currentLanguage === 'ee') { // Ewe
    if (yieldGap > 0) {
      const lostRevenue = yieldGap * farmAreaHectares * pricePerTonne;
      advisoryAdvice = `💡 Wò Nugblekpɔkpɔ kpoɖodo yɛ ${yieldGap.toFixed(2)} t/ha sɔsɔ kple national benchmark. Ne de hybrid nukuwo ne spacing nyuie le agblea (${farmAreaHectares} ha) dzi la, àkpɔ **GHS ${lostRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}** foforo le viɖe me!`;
    } else {
      advisoryAdvice = `🏆 Incredibly done! Wò nugblekpɔkpɔ sɔbɔ wu national average yield. Enye agbledela gã nutɔ! Dzra anyigba lãmesẽ sia ɖo daadaa.`;
    }
  } else { // English
    if (yieldGap > 0) {
      const lostRevenue = yieldGap * farmAreaHectares * pricePerTonne;
      advisoryAdvice = `💡 Your yield gap is ${yieldGap.toFixed(2)} t/ha below the national average. By using certified hybrid seeds and optimal crop spacing, you could unlock an additional **GHS ${lostRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}** in total revenue on your ${farmAreaHectares} ha farm!`;
    } else {
      advisoryAdvice = `🏆 Outstanding! Your farm yields exceed the national FAOSTAT average benchmark by ${Math.abs(yieldGap).toFixed(2)} t/ha! You are performing at peak smallholder efficiency.`;
    }
  }

  if (adviceEl) adviceEl.innerHTML = advisoryAdvice;
}
