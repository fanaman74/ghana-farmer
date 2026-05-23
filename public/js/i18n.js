/**
 * Ghana Farmer Support Application - Multi-Language i18n System
 * Supported: English (en), Akan/Twi (ak), Ewe (ee)
 */

const TRANSLATIONS = {
  en: {
    "lbl-title": "Ghana Farmer Support",
    "lbl-status-online": "Online",
    "lbl-status-offline": "Offline",
    "lbl-user-profile": "Farmer Profile",
    "lbl-select-profile": "-- Select Profile --",
    "lbl-my-farms": "My Farms",
    "lbl-no-farms": "No saved farms yet. Draw one on the map!",
    "lbl-draw-field": "Draw New Farm",
    "lbl-draw-help": "Click on the map to draw boundaries. Complete the polygon to stop.",
    "lbl-farm-overview": "Farm Overview",
    "lbl-select-farm-hint": "Select a farm on the left or map to view details.",
    "lbl-weather-climate": "Weather & Climate",
    "lbl-soil-moisture": "Soil Moisture",
    "lbl-evap": "Evapotranspiration",
    "lbl-select-farm-hint-weather": "Select a farm to view weather.",
    "lbl-crop-health": "Crop Health (NDVI)",
    "lbl-select-farm-hint-ndvi": "Select a farm to view NDVI health.",
    "lbl-yield-benchmarks": "Ghana Yield Benchmarks",
    "btn-create-user": "Create",
    "btn-save-farm": "Save Farm",
    "placeholder-farmer": "New Farmer Name...",
    "placeholder-farm": "Farm Name...",
    "lbl-size": "Size",
    "lbl-centroid": "Location",
    "lbl-created": "Saved On",
    "lbl-olmo-advisor": "OLMO AI Advisor",
    "lbl-advisor-welcome": "Welcome! I am OLMO, your wise agricultural advisor. Ask me anything about your crops, soils, or seasons!",
    "placeholder-advisor": "Ask OLMO a question..."
  },
  ak: { // Akan (Twi)
    "lbl-title": "Ghana Kuafo Akwankyerɛ",
    "lbl-status-online": "Intanɛt Wɔ So",
    "lbl-status-offline": "Intanɛt Nni So",
    "lbl-user-profile": "Kuafo Hwebea",
    "lbl-select-profile": "-- Yi Hwebea --",
    "lbl-my-farms": "M'afuw Nnom",
    "lbl-no-farms": "Wonni afuw biara a woakora. Twetwe bi wɔ asase mfonini no so!",
    "lbl-draw-field": "Twetwe Afuw Foforo",
    "lbl-draw-help": "Mia asase mfonini no so na fa hyɛ w'afuw hyeɛ. Mia mfiase no so bio na fa to ano.",
    "lbl-farm-overview": "Afuw Ho Nsɛm",
    "lbl-select-farm-hint": "Yi afuw bi wɔ benkum so anaa mfonini no so na hwɛ ho nsɛm.",
    "lbl-weather-climate": "Wiem Tebea",
    "lbl-soil-moisture": "Dɔteɛ mu Nsuo",
    "lbl-evap": "Fie Nsuo a ɛkɔ Wiem",
    "lbl-select-farm-hint-weather": "Yi afuw bi na hwɛ wiem tebea.",
    "lbl-crop-health": "Afuw no Yiedie (NDVI)",
    "lbl-select-farm-hint-ndvi": "Yi afuw bi na hwɛ afuw yiedie (NDVI) ho nsɛm.",
    "lbl-yield-benchmarks": "Ghana Nnɔbae Twa Ho Nsenkyerɛnne",
    "btn-create-user": "Yɛ",
    "btn-save-farm": "Kora Afuw No",
    "placeholder-farmer": "Kuafo Din Foforo...",
    "placeholder-farm": "Afuw Din...",
    "lbl-size": "Kɛseɛ",
    "lbl-centroid": "Kuro/Beaeɛ",
    "lbl-created": "Woakora Wɔ",
    "lbl-olmo-advisor": "OLMO Mmoa Nyansafoɔ",
    "lbl-advisor-welcome": "Akwaaba! Meyɛ OLMO, w'agble ho mmoa nyansafoɔ. Bisa me biribiara a ɛfa nnɔbae, asase, anaa wiem tebea ho!",
    "placeholder-advisor": "Bisa OLMO afutuo bi..."
  },
  ee: { // Ewe
    "lbl-title": "Ghana Agbledela Kpekpeɖeŋu",
    "lbl-status-online": "Ka Dzi",
    "lbl-status-offline": "Ka Gblẽ",
    "lbl-user-profile": "Agbledela ƒe Nɔnɔme",
    "lbl-select-profile": "-- Ti Nɔnɔmewo --",
    "lbl-my-farms": "Nye Agblewo",
    "lbl-no-farms": "Womedzra agble aɖeke ɖo o. De liƒo le anyigbahata dzi!",
    "lbl-draw-field": "De Agble Yeye Liƒo",
    "lbl-draw-help": "Zia anyigbahata dzi ne nade agblea ƒe liƒowo. Gbugbɔ zia aƒetɔ gbãtɔ dzi ne matu anyigba.",
    "lbl-farm-overview": "Agblea Ŋuti Nyawo",
    "lbl-select-farm-hint": "Ti agble aɖe le miame alo anyigbahata dzi ne nakpɔ nu siwo le eme.",
    "lbl-weather-climate": "Ya me ƒe nɔnɔme",
    "lbl-soil-moisture": "Anyigba me Tsitsi",
    "lbl-evap": "Tsidodo yi Dzi",
    "lbl-select-farm-hint-weather": "Ti agble aɖe ne nakpɔ ya me ƒe nɔnɔme.",
    "lbl-crop-health": "Agblea ƒe Lãmesẽ (NDVI)",
    "lbl-select-farm-hint-ndvi": "Ti agble aɖe ne nakpɔ NDVI lãmesẽ.",
    "lbl-yield-benchmarks": "Ghana Nugblekpɔkpɔ Kudodo",
    "btn-create-user": "Wɔ",
    "btn-save-farm": "Dzra Agblea Ðo",
    "placeholder-farmer": "Agbledela Ƒe Ŋkɔ Yeye...",
    "placeholder-farm": "Agblea Ƒe Ŋkɔ...",
    "lbl-size": "Lolome",
    "lbl-centroid": "Kɔƒe/Afia",
    "lbl-created": "Dzra Ðo Wɔ",
    "lbl-olmo-advisor": "OLMO Agbleɖaŋuɖola",
    "lbl-advisor-welcome": "Woezɔ! Nyea OLMO wò agbleɖaŋuɖola. Bia nyagbɔwo tso nukuwo alo ya me ƒe nɔnɔmewo ŋu!",
    "placeholder-advisor": "Bia nyagbɔ aɖe OLMO..."
  }
};

let currentLanguage = 'en';

/**
 * Changes the active UI language and updates all translatable DOM elements.
 * @param {string} lang - 'en' | 'ak' | 'ee'
 */
function setLanguage(lang) {
  if (!TRANSLATIONS[lang]) return;
  currentLanguage = lang;
  
  // 1. Update text content for elements with ID matching the translation keys
  Object.keys(TRANSLATIONS[lang]).forEach(key => {
    const el = document.getElementById(key);
    if (el) {
      // If it's an input or select, handle placeholders or specific choices
      if (el.tagName === 'INPUT') {
        el.placeholder = TRANSLATIONS[lang][key];
      } else {
        el.textContent = TRANSLATIONS[lang][key];
      }
    }
  });

  // 2. Specific placeholder updates
  const farmerInput = document.getElementById('username-input');
  if (farmerInput) {
    farmerInput.placeholder = TRANSLATIONS[lang]['placeholder-farmer'];
  }
  const farmInput = document.getElementById('farm-name-input');
  if (farmInput) {
    farmInput.placeholder = TRANSLATIONS[lang]['placeholder-farm'];
  }
  const advisorInput = document.getElementById('advisor-input-text');
  if (advisorInput) {
    advisorInput.placeholder = TRANSLATIONS[lang]['placeholder-advisor'];
  }

  // 3. Keep active class highlighted on selector buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Dispatch global event for other modules to listen to language changes (e.g. charts)
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * Translates a specific token string.
 * @param {string} token 
 * @returns {string}
 */
function translate(token) {
  return TRANSLATIONS[currentLanguage][token] || token;
}

// Bind to window to share with other scripts
window.setLanguage = setLanguage;
window.translate = translate;
window.currentLanguage = currentLanguage;

// Bind listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.target.getAttribute('data-lang');
      setLanguage(lang);
    });
  });
});
