/**
 * Storage Service
 *
 * This module handles data persistence for chore tracking.
 * Currently uses localStorage, but can be easily swapped to a backend API
 * when deploying to Railway or another hosting platform.
 *
 * To switch to backend:
 * 1. Replace localStorage calls with fetch() to your API
 * 2. Update the BASE_URL to your Railway deployment
 * 3. Add authentication if needed
 */

// Configuration
// Auto-detect backend URL from environment or use localhost for dev
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

// Use backend if VITE_BACKEND_URL is set, otherwise use localStorage
const USE_BACKEND = !!import.meta.env.VITE_BACKEND_URL;

// Storage keys
const STORAGE_KEYS = {
  CHORE_DATA: 'choreData',
  ENERGY_DEFAULTS: 'dailyEnergyDefaults',
  SCHEDULE_DEFAULTS: 'scheduleDefaults',
};

/**
 * Save chore data for all kids
 */
export async function saveChoreData(choreData) {
  if (USE_BACKEND) {
    try {
      const response = await fetch(`${BACKEND_URL}/chores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(choreData),
      });
      if (!response.ok) throw new Error('Failed to save to backend');
      return await response.json();
    } catch (error) {
      console.error('Backend save failed, falling back to localStorage:', error);
      // Fallback to localStorage
      localStorage.setItem(STORAGE_KEYS.CHORE_DATA, JSON.stringify(choreData));
    }
  } else {
    // Use localStorage
    localStorage.setItem(STORAGE_KEYS.CHORE_DATA, JSON.stringify(choreData));
  }
}

/**
 * Load chore data for all kids
 */
export async function loadChoreData() {
  if (USE_BACKEND) {
    try {
      const response = await fetch(`${BACKEND_URL}/chores`);
      if (!response.ok) throw new Error('Failed to load from backend');
      return await response.json();
    } catch (error) {
      console.error('Backend load failed, falling back to localStorage:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEYS.CHORE_DATA);
      return stored ? JSON.parse(stored) : getDefaultChoreData();
    }
  } else {
    // Use localStorage
    const stored = localStorage.getItem(STORAGE_KEYS.CHORE_DATA);
    return stored ? JSON.parse(stored) : getDefaultChoreData();
  }
}

/**
 * Get default chore data structure
 */
function getDefaultChoreData() {
  return {
    Rory: {
      kidName: 'Rory',
      previousStreakDays: 0,
      weeklyPointsSoFar: 0,
      lastUpdated: null,
      history: [], // Array of {date, points, tasks[]}
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
  };
}

/**
 * Update chore data for a specific kid
 */
export async function updateKidChoreData(kidName, data) {
  const allData = await loadChoreData();

  // Add history entry
  const historyEntry = {
    date: new Date().toISOString(),
    points: data.dailyPoints || 0,
    tasks: data.completedTasks || [],
    weeklyTotal: data.weeklyPointsTotal || 0,
    streak: data.streakDays || 0,
  };

  allData[kidName] = {
    ...allData[kidName],
    kidName,
    previousStreakDays: data.streakDays || 0,
    weeklyPointsSoFar: data.weeklyPointsTotal || 0,
    lastUpdated: new Date().toISOString(),
    history: [
      ...(allData[kidName]?.history || []),
      historyEntry,
    ].slice(-30), // Keep last 30 entries
  };

  await saveChoreData(allData);
  return allData[kidName];
}

/**
 * Get chore data for a specific kid
 */
export async function getKidChoreData(kidName) {
  const allData = await loadChoreData();
  return allData[kidName] || getDefaultChoreData()[kidName];
}

/**
 * Reset weekly points for all kids (call on Sunday night)
 */
export async function resetWeeklyPoints() {
  const allData = await loadChoreData();

  Object.keys(allData).forEach(kidName => {
    allData[kidName].weeklyPointsSoFar = 0;
  });

  await saveChoreData(allData);
  return allData;
}

/**
 * Export all data as JSON (for backup)
 */
export async function exportAllData() {
  const choreData = await loadChoreData();
  const energyDefaults = localStorage.getItem(STORAGE_KEYS.ENERGY_DEFAULTS);
  const scheduleDefaults = localStorage.getItem(STORAGE_KEYS.SCHEDULE_DEFAULTS);

  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    choreData,
    energyDefaults: energyDefaults ? JSON.parse(energyDefaults) : null,
    scheduleDefaults: scheduleDefaults ? JSON.parse(scheduleDefaults) : null,
  };

  // Download as JSON file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `household-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import data from JSON file
 */
export async function importData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target.result);

        // Validate data structure
        if (!importData.version || !importData.choreData) {
          throw new Error('Invalid data format');
        }

        // Save imported data
        await saveChoreData(importData.choreData);

        if (importData.energyDefaults) {
          localStorage.setItem(STORAGE_KEYS.ENERGY_DEFAULTS, JSON.stringify(importData.energyDefaults));
        }

        if (importData.scheduleDefaults) {
          localStorage.setItem(STORAGE_KEYS.SCHEDULE_DEFAULTS, JSON.stringify(importData.scheduleDefaults));
        }

        resolve(importData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Clear all stored data (use with caution!)
 */
export async function clearAllData() {
  if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
    localStorage.removeItem(STORAGE_KEYS.CHORE_DATA);
    localStorage.removeItem(STORAGE_KEYS.ENERGY_DEFAULTS);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE_DEFAULTS);
    return true;
  }
  return false;
}
