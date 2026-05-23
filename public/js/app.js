/**
 * Ghana Farmer Support Application - Main App State Coordinator
 */

import { 
  initMap, 
  displayFarms, 
  focusFarm, 
  highlightFarm, 
  clearDrawnLayers 
} from './map.js';

import { 
  renderWeatherChart, 
  renderNdviChart, 
  renderBenchmarkChart 
} from './charts.js';

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

  // Trigger cache proxies ingestion
  await fetchWeather(farm.id);
  await fetchNDVI(farm.id);
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
