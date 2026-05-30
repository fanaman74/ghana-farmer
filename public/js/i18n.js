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
    "placeholder-advisor": "Ask OLMO a question...",
    // Phase 2 additions
    "lbl-hero-title": "Empowering Ghanaian Agriculture",
    "lbl-hero-subtitle": "Interactive mapping, satellite crop tracking, climate analytics, and AI advisor localized in English, Akan (Twi), and Ewe.",
    "lbl-resources-title": "Our Resources",
    "lbl-feature-weather-title": "Weather & Soil Health",
    "lbl-feature-weather-desc": "6-hour cached forecasts, soil moisture, and transpiration curves.",
    "lbl-feature-ndvi-title": "Satellite Crop Health",
    "lbl-feature-ndvi-desc": "Sentinel Hub NDVI vegetative indices and seasonal curves.",
    "lbl-feature-faostat-title": "National Yield Benchmarks",
    "lbl-feature-faostat-desc": "FAOSTAT crop statistics and local yield comparisons.",
    "lbl-feature-advisor-title": "AI Farm Advisor",
    "lbl-feature-advisor-desc": "Instant agri advice in English, Twi, and Ewe with farm context.",
    "btn-back-home": "Home",
    "placeholder-search": "Search any town or region in Ghana...",
    "btn-search": "Search",
    "btn-tab-weather": "🌦️ Weather",
    "btn-tab-ndvi": "🛰️ Crop Health",
    "btn-tab-yield": "📊 Benchmarks",
    "btn-tab-advisor": "🤖 AI Advisor",
    // Premium Santorini-style Card Keys (English)
    "lbl-badge-weather-1": "🌦️ Forecast",
    "lbl-badge-weather-2": "6h Cached",
    "lbl-badge-ndvi-1": "🛰️ NDVI",
    "lbl-badge-ndvi-2": "Sentinel Hub",
    "lbl-badge-yield-1": "📊 FAOSTAT",
    "lbl-badge-yield-2": "Benchmarks",
    "lbl-badge-advisor-1": "🤖 OLMO AI",
    "lbl-badge-advisor-2": "Wise Agent",
    "btn-label-weather": "Explore now",
    "btn-label-ndvi": "Explore now",
    "btn-label-yield": "Explore now",
    "btn-label-advisor": "Explore now",
    "lbl-tts-select-voice": "Loading System Speech Voices...",
    "toast-select-farm-weather": "Please select or draw a farm first to view weather data!",
    "toast-select-farm-ndvi": "Please select or draw a farm first to track Sentinel satellite crop health!",
    "toast-select-farm-yield": "Please select or draw a farm first to compare yield benchmarks!"
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
    "placeholder-advisor": "Bisa OLMO afutuo bi...",
    // Phase 2 additions
    "lbl-hero-title": "Yɛma Ghana Kuafoɔ Daakye So",
    "lbl-hero-subtitle": "Asase ho nsɛm mfonini, wiem tebea, nnɔbae yiedie ne OLMO AI mmoa nyansafoɔ wɔ Twi, Ewe ne Borɔfo mu.",
    "lbl-resources-title": "Nneɛma a yɛwɔ",
    "lbl-feature-weather-title": "Wiem Tebea & Dɔteɛ",
    "lbl-feature-weather-desc": "Osu, wiem hyew ne dɔteɛ mu nsuo afutuo a ɛba dɔnhwerew 6 biara.",
    "lbl-feature-ndvi-title": "Satellite Nnɔbae Yiedie",
    "lbl-feature-ndvi-desc": "Sentinel Hub mfonini ne nnɔbae yiedie ho nsenkyerɛnne daadaa.",
    "lbl-feature-faostat-title": "Ghana Nnɔbae Twa Nsɛso",
    "lbl-feature-faostat-desc": "FAOSTAT aburo, kokoo ne nnɔbae twa ho nsɛso mfe ahorow mu.",
    "lbl-feature-advisor-title": "OLMO Kuafo Mmoa Nyansafoɔ",
    "lbl-feature-advisor-desc": "Bisa nnɔbae ne afuw yiedie ho nsɛm wɔ Twi mu ntɛm ara.",
    "btn-back-home": "Fie",
    "placeholder-search": "Hwehwɛ beaeɛ biara wɔ Ghana...",
    "btn-search": "Hwehwɛ",
    "btn-tab-weather": "🌦️ Wiem Tebea",
    "btn-tab-ndvi": "🛰️ Nnɔbae Yiedie",
    "btn-tab-yield": "📊 Nsenkyerɛnne",
    "btn-tab-advisor": "🤖 AI Advisor",
    // Premium Santorini-style Card Keys (Akan)
    "lbl-badge-weather-1": "🌦️ Osu/Wiem",
    "lbl-badge-weather-2": "Dɔnhwerew 6",
    "lbl-badge-ndvi-1": "🛰️ NDVI",
    "lbl-badge-ndvi-2": "Sentinel Hub",
    "lbl-badge-yield-1": "📊 FAOSTAT",
    "lbl-badge-yield-2": "Nsɛso",
    "lbl-badge-advisor-1": "🤖 OLMO AI",
    "lbl-badge-advisor-2": "Nyansafoɔ",
    "btn-label-weather": "Hwehwɛ mu",
    "btn-label-ndvi": "Hwehwɛ mu",
    "btn-label-yield": "Hwehwɛ mu",
    "btn-label-advisor": "Hwehwɛ mu",
    "lbl-tts-select-voice": "Rehwehwɛ Wiem Kasa...",
    "toast-select-farm-weather": "Kyerɛ afuw bi anaa twetwe afuw hyeɛ ansa na woatumi ahwɛ wiem tebea!",
    "toast-select-farm-ndvi": "Kyerɛ afuw bi anaa twetwe afuw hyeɛ ansa na woatumi ahwɛ afuw yiedie (NDVI) ho nsɛm!",
    "toast-select-farm-yield": "Kyerɛ afuw bi anaa twetwe afuw hyeɛ ansa na woatumi ahwɛ nnɔbae twa ho nsɛso!"
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
    "placeholder-advisor": "Bia nyagbɔ aɖe OLMO...",
    // Phase 2 additions
    "lbl-hero-title": "Wɔakpe Ðe Ghana Agbledelawo Ŋu",
    "lbl-hero-subtitle": "Anyigbahata kpɔkpɔ, ya me ƒe nɔnɔmewo, nukuwo ƒe lãmesẽ kple OLMO AI ŋuti nufiame le Ewegbe, Twigbe kple Eŋlisigbe me.",
    "lbl-resources-title": "Míaƒe Nufiameɖoɖowo",
    "lbl-feature-weather-title": "Ya me ƒe Nɔnɔme & Anyigba",
    "lbl-feature-weather-desc": "Tsidodo, ya ƒe dzoxoxowo kple anyigba me nsuo ƒe liƒowo le gafo 6 me.",
    "lbl-feature-ndvi-title": "Satellite Nuku Lãmesẽ",
    "lbl-feature-ndvi-desc": "Sentinel Hub nukuwo ƒe lãmesẽ liƒowo kple ya me ƒe nuku dɔlelewo.",
    "lbl-feature-faostat-title": "Ghana Nuku Kudodo",
    "lbl-feature-faostat-desc": "FAOSTAT bli, kokoo kple nukuwo ƒe lãmesẽ sɔsɔ le ƒewo me.",
    "lbl-feature-advisor-title": "OLMO Agbleɖaŋuɖola AI",
    "lbl-feature-advisor-desc": "Bia nyagbɔwo tso nukuwo ne agbleawo ŋuti le Ewegbe me enumake.",
    "btn-back-home": "Aƒeme",
    "placeholder-search": "Dii teƒe aɖe le Ghana...",
    "btn-search": "Dii",
    "btn-tab-weather": "🌦️ Ya me ƒe Nɔnɔme",
    "btn-tab-ndvi": "🛰️ Nuku Lãmesẽ",
    "btn-tab-yield": "📊 Nugblekpɔkpɔ",
    "btn-tab-advisor": "🤖 AI Advisor",
    // Premium Santorini-style Card Keys (Ewe)
    "lbl-badge-weather-1": "🌦️ Forecast",
    "lbl-badge-weather-2": "Gafo 6",
    "lbl-badge-ndvi-1": "🛰️ NDVI",
    "lbl-badge-ndvi-2": "Sentinel Hub",
    "lbl-badge-yield-1": "📊 FAOSTAT",
    "lbl-badge-yield-2": "Sɔsɔ",
    "lbl-badge-advisor-1": "🤖 OLMO AI",
    "lbl-badge-advisor-2": "Agbleɖaŋuɖola",
    "btn-label-weather": "Dii tsitotsito",
    "btn-label-ndvi": "Dii tsitotsito",
    "btn-label-yield": "Dii tsitotsito",
    "btn-label-advisor": "Dii tsitotsito",
    "lbl-tts-select-voice": "Le Gbe Lalam...",
    "toast-select-farm-weather": "Ti agble aɖe alo de liƒo na agble aɖe kpɔ gbã ne nakpɔ ya me ƒe nɔnɔme!",
    "toast-select-farm-ndvi": "Ti agble aɖe alo de liƒo na agble aɖe kpɔ gbã ne nakpɔ NDVI nuku lãmesẽ!",
    "toast-select-farm-yield": "Ti agble aɖe alo de liƒo na agble aɖe kpɔ gbã ne nakpɔ nuku sɔsɔwo!"
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
  const searchInput = document.getElementById('map-search-input');
  if (searchInput) {
    searchInput.placeholder = TRANSLATIONS[lang]['placeholder-search'];
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
