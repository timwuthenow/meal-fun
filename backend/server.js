require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

app.use(express.json());

// PostgreSQL connection
// Railway automatically provides DATABASE_URL environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize database table
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chore_data (
        kid_name VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

initDatabase();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all chore data
app.get('/api/chores', async (req, res) => {
  try {
    const result = await pool.query('SELECT kid_name, data FROM chore_data');

    // Convert array to object keyed by kid_name
    const choreData = {};
    result.rows.forEach(row => {
      choreData[row.kid_name] = row.data;
    });

    // If no data, return default structure
    if (Object.keys(choreData).length === 0) {
      return res.json({
        Rory: {
          kidName: 'Rory',
          previousStreakDays: 0,
          weeklyPointsSoFar: 0,
          lastUpdated: null,
          history: [],
        },
        Addy: {
          kidName: 'Addy',
          previousStreakDays: 0,
          weeklyPointsSoFar: 0,
          lastUpdated: null,
          history: [],
        },
        Elly: {
          kidName: 'Elly',
          previousStreakDays: 0,
          weeklyPointsSoFar: 0,
          lastUpdated: null,
          history: [],
        },
      });
    }

    res.json(choreData);
  } catch (error) {
    console.error('Error fetching chore data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Get chore data for specific kid
app.get('/api/chores/:kidName', async (req, res) => {
  try {
    const { kidName } = req.params;
    const result = await pool.query(
      'SELECT data FROM chore_data WHERE kid_name = $1',
      [kidName]
    );

    if (result.rows.length === 0) {
      // Return default data for this kid
      return res.json({
        kidName,
        previousStreakDays: 0,
        weeklyPointsSoFar: 0,
        lastUpdated: null,
        history: [],
      });
    }

    res.json(result.rows[0].data);
  } catch (error) {
    console.error('Error fetching kid data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Save all chore data
app.post('/api/chores', async (req, res) => {
  try {
    const choreData = req.body;

    // Use transaction to update all kids atomically
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [kidName, data] of Object.entries(choreData)) {
        await client.query(
          `INSERT INTO chore_data (kid_name, data, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (kid_name)
           DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
          [kidName, JSON.stringify(data)]
        );
      }

      await client.query('COMMIT');
      res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error saving chore data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Update specific kid's data
app.put('/api/chores/:kidName', async (req, res) => {
  try {
    const { kidName } = req.params;
    const data = req.body;

    await pool.query(
      `INSERT INTO chore_data (kid_name, data, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (kid_name)
       DO UPDATE SET data = $2, updated_at = CURRENT_TIMESTAMP`,
      [kidName, JSON.stringify(data)]
    );

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating kid data:', error);
    res.status(500).json({ error: 'Failed to update data' });
  }
});

// Delete all data (use with caution!)
app.delete('/api/chores', async (req, res) => {
  try {
    await pool.query('DELETE FROM chore_data');
    res.json({ success: true, message: 'All data deleted' });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Not configured'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
  });
});
