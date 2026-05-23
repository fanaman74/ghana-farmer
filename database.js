import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve default database location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultDbDir = path.join(__dirname, 'data');
const defaultDbPath = path.join(defaultDbDir, 'ghana_farmer.db');

let db = null;

/**
 * Initializes the SQLite database and creates the tables if they don't exist.
 * @param {string} dbPath - Custom path to the database file.
 */
export function initDb(dbPath = defaultDbPath) {
  const dbDir = path.dirname(dbPath);
  
  // Ensure the directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Instantiate native node:sqlite synchronous database client
  db = new DatabaseSync(dbPath);

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Create core schema tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS farms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      geometry TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS weather_cache (
      farm_id INTEGER PRIMARY KEY,
      daily_data TEXT NOT NULL,
      hourly_data TEXT NOT NULL,
      cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (farm_id) REFERENCES farms(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS faostat_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_name TEXT UNIQUE NOT NULL,
      data_payload TEXT NOT NULL,
      cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

/**
 * Ensures the database is initialized before running operations.
 */
function ensureDb() {
  if (!db) {
    initDb();
  }
}

/**
 * Creates a new user in the database.
 * @param {string} username 
 * @returns {object} - The newly created user
 */
export function createUser(username) {
  ensureDb();
  const insert = db.prepare('INSERT INTO users (username) VALUES (?)');
  insert.run(username);
  
  // Query and return the inserted user
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

/**
 * Retrieves all users.
 * @returns {array}
 */
export function getUsers() {
  ensureDb();
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

/**
 * Creates a new farm.
 * @param {number} userId 
 * @param {string} name 
 * @param {string} geometry - GeoJSON string of the boundary polygon
 * @returns {object} - The newly created farm
 */
export function createFarm(userId, name, geometry) {
  ensureDb();
  const insert = db.prepare('INSERT INTO farms (user_id, name, geometry) VALUES (?, ?, ?)');
  const info = insert.run(userId, name, geometry);
  
  // Query and return the newly created farm by rowid
  return db.prepare('SELECT * FROM farms WHERE rowid = ?').get(info.lastInsertRowid);
}

/**
 * Retrieves all saved farms for a user.
 * @param {number} userId 
 * @returns {array}
 */
export function getFarms(userId) {
  ensureDb();
  return db.prepare('SELECT * FROM farms WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

/**
 * Retrieves a single farm by its ID.
 * @param {number} farmId 
 * @returns {object|undefined}
 */
export function getFarm(farmId) {
  ensureDb();
  return db.prepare('SELECT * FROM farms WHERE id = ?').get(farmId);
}

/**
 * Deletes a farm from the database.
 * @param {number} farmId 
 */
export function deleteFarm(farmId) {
  ensureDb();
  const remove = db.prepare('DELETE FROM farms WHERE id = ?');
  remove.run(farmId);
}

/**
 * Gets cached weather data for a farm if it exists.
 * @param {number} farmId 
 * @returns {object|undefined}
 */
export function getWeatherCache(farmId) {
  ensureDb();
  return db.prepare('SELECT * FROM weather_cache WHERE farm_id = ?').get(farmId);
}

/**
 * Sets or updates cached weather data for a farm.
 * @param {number} farmId 
 * @param {string} dailyData - Cached JSON payload
 * @param {string} hourlyData - Cached JSON payload
 */
export function setWeatherCache(farmId, dailyData, hourlyData) {
  ensureDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO weather_cache (farm_id, daily_data, hourly_data, cached_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `);
  insert.run(farmId, dailyData, hourlyData);
}

/**
 * Gets cached FAOSTAT crop stats.
 * @param {string} cropName 
 * @returns {object|undefined}
 */
export function getFaostatCache(cropName) {
  ensureDb();
  return db.prepare('SELECT * FROM faostat_cache WHERE crop_name = ?').get(cropName);
}

/**
 * Sets or updates cached FAOSTAT crop stats.
 * @param {string} cropName 
 * @param {string} dataPayload - Cached JSON payload
 */
export function setFaostatCache(cropName, dataPayload) {
  ensureDb();
  const insert = db.prepare(`
    INSERT OR REPLACE INTO faostat_cache (crop_name, data_payload, cached_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `);
  insert.run(cropName, dataPayload);
}
