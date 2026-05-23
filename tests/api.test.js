import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testDbPath = path.join(__dirname, '../data/ghana_farmer_api_test.db');

// 1. Set environment variables FIRST before importing database/server
process.env.PORT = '3005';
process.env.NODE_ENV = 'test';

// 2. Use dynamic imports to prevent ESM import hoisting issues
const { initDb, createUser } = await import('../database.js');

// Setup fresh DB for API tests
if (fs.existsSync(testDbPath)) {
  try {
    fs.unlinkSync(testDbPath);
  } catch (e) {}
}
initDb(testDbPath);

// Create a test user
const defaultUser = createUser('FredAPI');

// Dynamically import server so it reads the correct process.env.PORT
const { server } = await import('../server.js');

const API_BASE = 'http://localhost:3005';

test('Express API Integration Tests', async (t) => {
  
  await t.test('POST /api/users - Create User', async () => {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'JohnAPI' })
    });
    
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.username, 'JohnAPI');
    assert.ok(data.id);
  });

  await t.test('GET /api/users - List Users', async () => {
    const res = await fetch(`${API_BASE}/api/users`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length >= 2, 'Should have FredAPI and JohnAPI');
  });

  await t.test('POST & GET /api/farms - Create & List Farms', async () => {
    const farmGeoJson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[ -0.2059, 5.6148 ], [ -0.2050, 5.6148 ], [ -0.2050, 5.6140 ], [ -0.2059, 5.6148 ]]]
      }
    };

    // Create Farm
    const postRes = await fetch(`${API_BASE}/api/farms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: defaultUser.id,
        name: 'Fred API Farm',
        geometry: JSON.stringify(farmGeoJson)
      })
    });

    assert.equal(postRes.status, 201);
    const newFarm = await postRes.json();
    assert.equal(newFarm.name, 'Fred API Farm');
    assert.equal(newFarm.user_id, defaultUser.id);

    // List Farms
    const getRes = await fetch(`${API_BASE}/api/farms?user_id=${defaultUser.id}`);
    assert.equal(getRes.status, 200);
    const farms = await getRes.json();
    assert.equal(farms.length, 1);
    assert.equal(farms[0].name, 'Fred API Farm');

    // Delete Farm
    const delRes = await fetch(`${API_BASE}/api/farms/${newFarm.id}`, {
      method: 'DELETE'
    });
    assert.equal(delRes.status, 200);
    const delResult = await delRes.json();
    assert.equal(delResult.success, true);

    // Verify Delete
    const postDelRes = await fetch(`${API_BASE}/api/farms?user_id=${defaultUser.id}`);
    const postDelFarms = await postDelRes.json();
    assert.equal(postDelFarms.length, 0);
  });

  await t.test('GET /api/farms/:id/weather - Fetch & Cache Weather', async () => {
    // 1. Create a dummy farm for weather testing
    const farmGeoJson = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[ -0.2059, 5.6148 ], [ -0.2050, 5.6148 ], [ -0.2050, 5.6140 ], [ -0.2059, 5.6148 ]]]
      }
    };
    const postRes = await fetch(`${API_BASE}/api/farms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: defaultUser.id,
        name: 'Weather Test Farm',
        geometry: JSON.stringify(farmGeoJson)
      })
    });
    const farm = await postRes.json();

    // 2. Fetch weather for the farm (first hit - queries network)
    const weatherRes = await fetch(`${API_BASE}/api/farms/${farm.id}/weather`);
    assert.equal(weatherRes.status, 200);
    const weatherData = await weatherRes.json();
    
    assert.ok(weatherData.daily, 'Should contain daily weather payload');
    assert.ok(weatherData.hourly, 'Should contain hourly weather payload');
    
    // 3. Fetch weather again (second hit - MUST serve from SQLite cache instantly)
    const start = Date.now();
    const weatherCachedRes = await fetch(`${API_BASE}/api/farms/${farm.id}/weather`);
    const duration = Date.now() - start;
    
    assert.equal(weatherCachedRes.status, 200);
    const weatherCachedData = await weatherCachedRes.json();
    assert.deepEqual(weatherCachedData.daily, weatherData.daily, 'Cached weather daily payload should match exactly');
    assert.ok(duration < 50, 'Cached read should be served in under 50ms from local SQLite');
  });

  await t.test('GET /api/faostat/:crop - Fetch & Cache FAOSTAT yields', async () => {
    // 1. Query maize stats (first hit - network)
    const cropRes = await fetch(`${API_BASE}/api/faostat/maize`);
    assert.equal(cropRes.status, 200);
    const cropData = await cropRes.json();
    assert.ok(Array.isArray(cropData), 'FAOSTAT payload should be an array of crop stats');
    
    // 2. Query maize stats again (second hit - cache)
    const start = Date.now();
    const cropCachedRes = await fetch(`${API_BASE}/api/faostat/maize`);
    const duration = Date.now() - start;
    
    assert.equal(cropCachedRes.status, 200);
    const cropCachedData = await cropCachedRes.json();
    assert.deepEqual(cropCachedData, cropData, 'Cached crop data should match exactly');
    assert.ok(duration < 50, 'Cached read should be served in under 50ms from local SQLite');
  });

  // Teardown: close Express server and delete test db
  server.close(() => {
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
      }
    } catch (e) {}
  });
});
