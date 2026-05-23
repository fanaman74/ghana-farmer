import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Import database methods
import { 
  initDb, 
  createUser, 
  getUsers, 
  createFarm, 
  getFarms, 
  deleteFarm 
} from './database.js';

// Auto-initialize default database if in production or standard mode
if (process.env.NODE_ENV !== 'test') {
  initDb();
}

// Serve JSON body parsing and static assets
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * -------------------------------------------------------------
 * CORE ROUTING: USER ENDPOINTS
 * -------------------------------------------------------------
 */

// Retrieve all profiles
app.get('/api/users', (req, res) => {
  try {
    const users = getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Create user profile
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }
  try {
    const newUser = createUser(username);
    res.status(201).json(newUser);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

/**
 * -------------------------------------------------------------
 * CORE ROUTING: FARM ENDPOINTS
 * -------------------------------------------------------------
 */

// Retrieve all farms belonging to a user
app.get('/api/farms', (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: 'user_id query parameter is required' });
  }
  try {
    const farms = getFarms(Number(user_id));
    res.json(farms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve farms' });
  }
});

// Save farm polygon boundary coordinates
app.post('/api/farms', (req, res) => {
  const { user_id, name, geometry } = req.body;
  if (!user_id || !name || !geometry) {
    return res.status(400).json({ error: 'user_id, name, and geometry are required' });
  }
  try {
    const newFarm = createFarm(Number(user_id), name, geometry);
    res.status(201).json(newFarm);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save farm boundary' });
  }
});

// Delete farm boundary and associated cache records
app.delete('/api/farms/:id', (req, res) => {
  const { id } = req.params;
  try {
    deleteFarm(Number(id));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete farm' });
  }
});

// Spin up HTTP listener
const serverInstance = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`Ghana Farmer Server is running on port ${PORT}`);
  }
});

// Export both the app and the server instance for test harness isolation
export { app, serverInstance as server };
