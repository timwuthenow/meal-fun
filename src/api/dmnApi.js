/**
 * DMN API Integration
 * Connects to decision-control deployed models
 */

// Use proxy in development to avoid CORS, direct URL in production
const IS_DEV = import.meta.env.DEV;
const API_BASE_URL = IS_DEV
  ? '/api/runtime/0/dmn/latest'  // Proxied through Vite
  : 'https://dev.aletyx.solutions/api/runtime/0/dmn/latest';

// Enable fallback mode if API is unavailable
let USE_FALLBACK = false;

/**
 * Call the Meal Selector DMN model
 * @param {string} dayOfWeek - Monday through Sunday
 * @param {string} energyLevel - high, medium, low, crashed
 * @param {string} scheduleBusyness - light, normal, packed
 * @param {number} weekNumber - 1 or 2
 * @returns {Promise<Object>} Meal details with groceryItems
 */
export async function getMealSuggestion(dayOfWeek, energyLevel, scheduleBusyness, weekNumber) {
  // If fallback mode is already enabled, use static data
  if (USE_FALLBACK) {
    return getFallbackMeal(dayOfWeek, energyLevel, scheduleBusyness, weekNumber);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/Meal%20Selector`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dayOfWeek,
        energyLevel,
        scheduleBusyness,
        weekNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data['Select Meal'];
  } catch (error) {
    console.warn('⚠️ API unavailable, switching to fallback mode:', error.message);
    USE_FALLBACK = true; // Enable fallback for subsequent calls
    return getFallbackMeal(dayOfWeek, energyLevel, scheduleBusyness, weekNumber);
  }
}

/**
 * Get meal suggestions for an entire week
 * @param {Array} dailySettings - Array of {day, energyLevel, scheduleBusyness} for 7 days
 * @param {number} weekNumber - 1 or 2
 * @returns {Promise<Object>} Object with day keys and meal values
 */
export async function getWeeklyMeals(dailySettings, weekNumber) {
  try {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Call API for each day in parallel
    const mealPromises = days.map(async (day, index) => {
      const settings = dailySettings[index] || {
        energyLevel: 'medium',
        scheduleBusyness: 'normal'
      };

      const meal = await getMealSuggestion(
        day,
        settings.energyLevel,
        settings.scheduleBusyness,
        weekNumber
      );

      return { day, meal };
    });

    const results = await Promise.all(mealPromises);

    // Convert array to object keyed by day
    const weeklyMeals = {};
    results.forEach(({ day, meal }) => {
      weeklyMeals[day] = meal;
    });

    return weeklyMeals;
  } catch (error) {
    console.error('Error fetching weekly meals:', error);
    throw error;
  }
}

/**
 * Generate grocery list from selected meals
 * @param {Array<Object>} meals - Array of meal objects with groceryItems
 * @returns {Promise<Object>} Organized grocery list by section
 */
export async function generateGroceryList(meals) {
  try {
    const response = await fetch(`${API_BASE_URL}/Grocery%20List%20Generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selectedMeals: meals,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data['Generate Grocery List'];
  } catch (error) {
    console.error('Error generating grocery list:', error);
    throw error;
  }
}

/**
 * Optimize weekly schedule based on calendar
 * @param {Array} dailySchedule - 7 days with {dayOfWeek, workLoad, kidsActivities, eveningFree}
 * @param {number} weekNumber - 1 or 2
 * @returns {Promise<Object>} Optimized plan with crockpotAlertDays
 */
export async function optimizeWeeklySchedule(dailySchedule, weekNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/Weekly%20Schedule%20Optimizer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dailySchedule,
        weekNumber,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data['Optimize Weekly Schedule'];
  } catch (error) {
    console.error('Error optimizing schedule:', error);
    throw error;
  }
}

/**
 * Track kid chore points
 * @param {Object} choreData - {kidName, completedTasks, previousStreakDays, weeklyPointsSoFar}
 * @returns {Promise<Object>} Chore tracking results with screenTimeUnlocked, points, etc.
 */
export async function trackChorePoints(choreData) {
  try {
    const response = await fetch(`${API_BASE_URL}/Kid%20Chore%20Point%20Tracker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dailyChores: choreData,
      }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    return data['Track Chore Points'];
  } catch (error) {
    console.error('Error tracking chore points:', error);
    throw error;
  }
}

/**
 * Helper: Get daily energy level based on user preference
 * Uses localStorage to remember user's typical energy patterns
 */
export function getDailyEnergyDefaults() {
  const stored = localStorage.getItem('dailyEnergyDefaults');
  if (stored) {
    return JSON.parse(stored);
  }

  // Default energy patterns (can be customized)
  return {
    Monday: 'medium',
    Tuesday: 'medium',
    Wednesday: 'medium',
    Thursday: 'low', // Late week fatigue
    Friday: 'medium',
    Saturday: 'high', // Weekend energy
    Sunday: 'medium',
  };
}

/**
 * Helper: Save energy defaults
 */
export function saveDailyEnergyDefaults(defaults) {
  localStorage.setItem('dailyEnergyDefaults', JSON.stringify(defaults));
}

/**
 * Helper: Get schedule busyness defaults
 */
export function getScheduleDefaults() {
  const stored = localStorage.getItem('scheduleDefaults');
  if (stored) {
    return JSON.parse(stored);
  }

  return {
    Monday: 'normal',
    Tuesday: 'normal',
    Wednesday: 'normal',
    Thursday: 'normal',
    Friday: 'normal',
    Saturday: 'light',
    Sunday: 'light',
  };
}

/**
 * Helper: Save schedule defaults
 */
export function saveScheduleDefaults(defaults) {
  localStorage.setItem('scheduleDefaults', JSON.stringify(defaults));
}

/**
 * Helper: Get stored chore data for a kid
 */
export function getKidChoreData(kidName) {
  const stored = localStorage.getItem(`choreData_${kidName}`);
  if (stored) {
    return JSON.parse(stored);
  }

  return {
    kidName,
    previousStreakDays: 0,
    weeklyPointsSoFar: 0,
    lastUpdated: null,
  };
}

/**
 * Helper: Save chore data for a kid
 */
export function saveKidChoreData(kidName, data) {
  localStorage.setItem(`choreData_${kidName}`, JSON.stringify({
    ...data,
    lastUpdated: new Date().toISOString(),
  }));
}

// ========================================
// FALLBACK MODE - Static Meal Data
// Used when API is unavailable due to CORS or network issues
// ========================================

const FALLBACK_MEALS = {
  Monday: {
    week1: {
      mealName: "Honey Garlic Chicken Thighs",
      cookingMethod: "sheet-pan",
      activeTime: "25 min",
      prepInstructions: "Chicken thighs + honey, soy sauce, garlic glaze. 400F for 22 min. Broil 2 min.",
      servingNotes: "Serve with rice and steamed broccoli. Great leftover lunch.",
      leftoverPotential: "high",
      groceryItems: ["Chicken thighs (boneless)", "Honey", "Soy sauce", "Garlic", "Rice", "Broccoli"]
    },
    week2: {
      mealName: "Crockpot Chicken Tacos",
      cookingMethod: "crockpot",
      activeTime: "5 min prep",
      prepInstructions: "Chicken breasts + salsa + cumin + chili powder. Low 6 hrs. Shred.",
      servingNotes: "Tortillas, cheese, sour cream. Leftovers = quesadillas.",
      leftoverPotential: "high",
      groceryItems: ["Chicken breasts (boneless)", "Salsa", "Cumin", "Chili powder", "Flour tortillas", "Shredded Mexican cheese", "Sour cream"]
    }
  },
  Tuesday: {
    mealName: "Beef Tacos",
    cookingMethod: "stovetop",
    activeTime: "20 min",
    prepInstructions: "Brown ground beef with taco seasoning. Set out toppings bar.",
    servingNotes: "Cheese, lettuce, salsa, sour cream, tortillas",
    leftoverPotential: "medium",
    groceryItems: ["Ground beef (80/20)", "Taco seasoning", "Flour tortillas", "Shredded Mexican cheese", "Lettuce", "Tomatoes", "Salsa", "Sour cream"]
  },
  Wednesday: {
    week1: {
      mealName: "Crockpot Italian Chicken",
      cookingMethod: "crockpot",
      activeTime: "10 min prep",
      prepInstructions: "Chicken breasts + jar marinara + Italian seasoning. Low 6 hrs. Shred.",
      servingNotes: "Serve over pasta or on rolls. Doubles as Thu lunch.",
      leftoverPotential: "high",
      groceryItems: ["Chicken breasts (boneless)", "Marinara sauce (jar)", "Italian seasoning", "Pasta (1 lb)", "Buns or rolls"]
    },
    week2: {
      mealName: "Pasta with Meat Sauce",
      cookingMethod: "stovetop",
      activeTime: "25 min",
      prepInstructions: "Brown ground beef, add jar marinara, simmer. Boil pasta.",
      servingNotes: "Classic. No complaints. Reheats perfectly.",
      leftoverPotential: "high",
      groceryItems: ["Ground beef (80/20)", "Marinara sauce (jar)", "Pasta (1 lb)"]
    }
  },
  Thursday: {
    week1: {
      mealName: "Chicken Stir Fry",
      cookingMethod: "stovetop",
      activeTime: "25 min",
      prepInstructions: "Slice chicken thighs. Stir fry with frozen veggies. Soy sauce + garlic.",
      servingNotes: "Serve over rice. Cook extra rice for the week.",
      leftoverPotential: "medium",
      groceryItems: ["Chicken thighs (boneless)", "Frozen stir fry veggies", "Soy sauce", "Garlic", "Rice"]
    },
    week2: {
      mealName: "Teriyaki Chicken Thighs",
      cookingMethod: "sheet-pan",
      activeTime: "25 min",
      prepInstructions: "Chicken thighs + bottled teriyaki. 400F 22 min. Broil 2 min.",
      servingNotes: "Serve with rice and steamed broccoli.",
      leftoverPotential: "medium",
      groceryItems: ["Chicken thighs (boneless)", "Teriyaki sauce", "Rice", "Broccoli"]
    }
  },
  Friday: {
    mealName: "Grilled Italian Sausages",
    cookingMethod: "grill",
    activeTime: "20 min",
    prepInstructions: "Grill sausages + zucchini and peppers on the side.",
    servingNotes: "Easy Friday. Serve with leftover rice or rolls.",
    leftoverPotential: "medium",
    groceryItems: ["Italian sausage links", "Zucchini", "Bell peppers", "Rice", "Buns or rolls"]
  },
  Saturday: {
    mealName: "LEFTOVER NIGHT",
    cookingMethod: "none",
    activeTime: "5 min reheat",
    prepInstructions: "Clean out the fridge. Everyone picks what's left.",
    servingNotes: "No cooking. No guilt. Reduce waste.",
    leftoverPotential: "low",
    groceryItems: []
  },
  Sunday: {
    week1: {
      mealName: "Sheet Pan Sausage and Potatoes",
      cookingMethod: "sheet-pan",
      activeTime: "30 min",
      prepInstructions: "Cube potatoes, slice kielbasa, olive oil + seasoning. 400F 25 min.",
      servingNotes: "Cook while filling out next week's meal plan.",
      leftoverPotential: "medium",
      groceryItems: ["Kielbasa", "Potatoes", "Olive oil"]
    },
    week2: {
      mealName: "Breakfast for Dinner",
      cookingMethod: "stovetop",
      activeTime: "20 min",
      prepInstructions: "Scrambled eggs, bacon or sausage, toast.",
      servingNotes: "Kids love it. You love it. Everyone wins.",
      leftoverPotential: "low",
      groceryItems: ["Eggs (1 dozen)", "Bacon", "Bread"]
    }
  }
};

// Energy-based meal overrides for fallback
const FALLBACK_OVERRIDES = {
  crashed: {
    mealName: "Black Bean Quesadillas",
    cookingMethod: "stovetop",
    activeTime: "15 min",
    prepInstructions: "Tortillas + cheese + canned black beans + salsa. Pan crisp.",
    servingNotes: "Fastest dinner in the rotation. Kids can build their own.",
    leftoverPotential: "low",
    groceryItems: ["Flour tortillas", "Shredded Mexican cheese", "Canned black beans", "Salsa"]
  }
};

/**
 * Get fallback meal data when API is unavailable
 */
function getFallbackMeal(dayOfWeek, energyLevel, scheduleBusyness, weekNumber) {
  console.warn(`⚠️ Using fallback mode for ${dayOfWeek} - API unavailable`);
  
  // Hard constraint: Tuesday is always Tacos
  if (dayOfWeek === "Tuesday") {
    return FALLBACK_MEALS.Tuesday;
  }
  
  // Hard constraint: Saturday is always Leftovers
  if (dayOfWeek === "Saturday") {
    return FALLBACK_MEALS.Saturday;
  }
  
  // Energy override: crashed = quesadillas
  if (energyLevel === "crashed") {
    return FALLBACK_OVERRIDES.crashed;
  }
  
  // Get day-specific meal
  const dayMeal = FALLBACK_MEALS[dayOfWeek];
  if (!dayMeal) {
    return FALLBACK_OVERRIDES.crashed; // Safe fallback
  }
  
  // Check if day has week-specific meals
  if (dayMeal.week1 && dayMeal.week2) {
    return weekNumber === 1 ? dayMeal.week1 : dayMeal.week2;
  }
  
  // Day has same meal for both weeks
  return dayMeal;
}
