import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbDir = path.join(__dirname, '../data');

// Import database handlers (which doesn't exist yet)
import { 
  initDb, 
  createUser, 
  getUsers, 
  createFarm, 
  getFarms, 
  deleteFarm, 
  getWeatherCache, 
  setWeatherCache, 
  getFaostatCache, 
  setFaostatCache 
} from '../database.js';

test('Database Operations Suite', async (t) => {
  // Ensure data directory exists for testing
  if (!fs.existsSync(testDbDir)) {
    fs.mkdirSync(testDbDir);
  }

  // Initialize DB in test file mode (or in-memory if supported, but file is great)
  const dbPath = path.join(testDbDir, 'ghana_farmer_test.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  // Initialize DB once for the entire suite
  initDb(dbPath);

  await t.test('Initialization & Core Schema', () => {
    const db = initDb(dbPath);
    assert.ok(db, 'Database should initialize successfully');
    
    // Check if tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const tableNames = tables.map(t => t.name);
    
    assert.ok(tableNames.includes('users'), 'users table should exist');
    assert.ok(tableNames.includes('farms'), 'farms table should exist');
    assert.ok(tableNames.includes('weather_cache'), 'weather_cache table should exist');
    assert.ok(tableNames.includes('faostat_cache'), 'faostat_cache table should exist');
  });

  await t.test('User Management Operations', () => {
    const user1 = createUser('Fred');
    assert.equal(user1.username, 'Fred', 'Should insert user and return user object');
    assert.ok(user1.id, 'Should have auto-incremented ID');

    const users = getUsers();
    assert.ok(users.length >= 1, 'Should return users list');
    assert.equal(users[0].username, 'Fred');
  });

  await t.test('Farm Operations', () => {
    const users = getUsers();
    const userId = users[0].id;

    const farmGeoJson = JSON.stringify({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[ -0.2059, 5.6148 ], [ -0.2050, 5.6148 ], [ -0.2050, 5.6140 ], [ -0.2059, 5.6148 ]]]
      }
    });

    const farm = createFarm(userId, 'Fred Accra Farm', farmGeoJson);
    assert.equal(farm.name, 'Fred Accra Farm');
    assert.equal(farm.geometry, farmGeoJson);

    const farms = getFarms(userId);
    assert.equal(farms.length, 1);
    assert.equal(farms[0].name, 'Fred Accra Farm');

    // Test Delete
    deleteFarm(farm.id);
    const postDeleteFarms = getFarms(userId);
    assert.equal(postDeleteFarms.length, 0, 'Farm should be successfully deleted');
  });

  await t.test('Cache Eviction and Fetching Operations', () => {
    // Recreate a user and farm for cascade test
    const user = createUser('John');
    const farmGeoJson = JSON.stringify({ type: "Feature", geometry: { type: "Polygon", coordinates: [] } });
    const farm = createFarm(user.id, 'John Farm', farmGeoJson);

    // Weather caching
    const mockDaily = JSON.stringify({ temp: 30, rain: 5 });
    const mockHourly = JSON.stringify({ temp_hourly: [25, 26] });

    setWeatherCache(farm.id, mockDaily, mockHourly);
    const cachedWeather = getWeatherCache(farm.id);
    assert.ok(cachedWeather, 'Weather cache should be retrievable');
    assert.equal(cachedWeather.daily_data, mockDaily);
    assert.equal(cachedWeather.hourly_data, mockHourly);

    // FAOSTAT caching
    const mockCropData = JSON.stringify({ yield: 1.5, crop: 'maize' });
    setFaostatCache('maize', mockCropData);
    const cachedFao = getFaostatCache('maize');
    assert.ok(cachedFao);
    assert.equal(cachedFao.data_payload, mockCropData);
  });

  // Cleanup test database
  try {
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  } catch (err) {
    // Ignore cleanup errors
  }
});
