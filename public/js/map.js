/**
 * Ghana Farmer Support Application - Interactive Mapping (Leaflet & Geoman)
 */

let map = null;
let drawnItems = null;
let savedFarmLayers = {}; // Map of farmId -> Leaflet Layer
let onPolygonDrawnCallback = null;

/**
 * Initializes the Leaflet map and drawing controls.
 * @param {string} containerId - DOM container ID for the map
 * @param {function} onPolygonDrawn - Callback when a new boundary polygon is drawn
 */
export function initMap(containerId = 'map', onPolygonDrawn) {
  onPolygonDrawnCallback = onPolygonDrawn;

  // Initialize Leaflet Map centered on Kumasi (central node of Ghanaian agriculture)
  map = L.map(containerId, {
    center: [6.6885, -1.6244],
    zoom: 7,
    zoomControl: true
  });

  // Base Tile Layers (Street View and High-Definition Satellite Imagery)
  const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  });

  const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

  // Default to satellite tiles for agricultural visual context
  satelliteTiles.addTo(map);

  // Add layer controls toggle
  const baseMaps = {
    "Satellite Imagery": satelliteTiles,
    "Street Map": streetTiles
  };
  L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

  // Layer group for drawing boundaries
  drawnItems = L.featureGroup().addTo(map);

  // Configure premium Leaflet Geoman drawing controls
  map.pm.addControls({
    position: 'topleft',
    drawMarker: false,
    drawCircleMarker: false,
    drawPolyline: false,
    drawRectangle: false,
    drawCircle: false,
    drawPolygon: true, // Allow custom polygon drawing
    editMode: true,
    dragMode: true,
    removalMode: true
  });

  // Set translation language for Geoman controls (fallback to English)
  map.pm.setLang('en');

  // Handle Geoman polygon creation events
  map.on('pm:create', (e) => {
    const layer = e.layer;
    
    // Clear any previous temporary drawn shapes
    drawnItems.clearLayers();
    drawnItems.addLayer(layer);

    // Grab geometry as GeoJSON
    const geojson = layer.toGeoJSON();

    if (onPolygonDrawnCallback) {
      onPolygonDrawnCallback(geojson, layer);
    }
  });

  // Handle Geoman delete/removal events
  map.on('pm:remove', (e) => {
    // If user deletes the active drawn shape before saving
    if (onPolygonDrawnCallback) {
      onPolygonDrawnCallback(null, null);
    }
  });
}

/**
 * Renders multiple saved farm boundaries on the map.
 * @param {array} farms - Array of farm objects from SQLite
 * @param {function} onFarmClicked - Callback when a farm polygon is clicked on the map
 */
export function displayFarms(farms, onFarmClicked) {
  // Clear any existing layers
  Object.keys(savedFarmLayers).forEach(id => {
    map.removeLayer(savedFarmLayers[id]);
  });
  savedFarmLayers = {};
  drawnItems.clearLayers();

  // Plot each farm's polygon boundary
  farms.forEach(farm => {
    try {
      const geo = JSON.parse(farm.geometry);
      
      const layer = L.geoJSON(geo, {
        style: {
          color: '#10b981', // Emerald green
          weight: 3,
          fillColor: '#10b981',
          fillOpacity: 0.25
        }
      }).addTo(map);

      // Add popup tooltip
      layer.bindPopup(`<strong>${farm.name}</strong>`);

      // Bind click handler
      layer.on('click', () => {
        if (onFarmClicked) {
          onFarmClicked(farm);
        }
      });

      savedFarmLayers[farm.id] = layer;
    } catch (err) {
      console.error(`Failed to parse geometry for farm: ${farm.name}`, err);
    }
  });
}

/**
 * Focuses / flies the map view to a specific farm's boundary polygon.
 * @param {number} farmId 
 */
export function focusFarm(farmId) {
  const layer = savedFarmLayers[farmId];
  if (layer) {
    const bounds = layer.getBounds();
    map.fitBounds(bounds, { maxZoom: 16, padding: [50, 50] });
    layer.openPopup();
  }
}

/**
 * Highlights a farm's boundary on the map.
 * @param {number} farmId 
 */
export function highlightFarm(farmId) {
  // Reset all other layers first
  Object.keys(savedFarmLayers).forEach(id => {
    savedFarmLayers[id].setStyle({
      color: '#10b981',
      fillOpacity: 0.25,
      weight: 3
    });
  });

  // Highlight selected layer
  const layer = savedFarmLayers[farmId];
  if (layer) {
    layer.setStyle({
      color: '#84cc16', // Lime green highlight
      fillOpacity: 0.4,
      weight: 5
    });
  }
}

/**
 * Clears any active temporary drawn layers from the map.
 */
export function clearDrawnLayers() {
  if (drawnItems) {
    drawnItems.clearLayers();
  }
}
