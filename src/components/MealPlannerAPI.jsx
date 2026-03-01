import { useState, useEffect } from "react";
import { getWeeklyMeals, getDailyEnergyDefaults, getScheduleDefaults } from "../api/dmnApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ENERGY_LEVELS = [
  { value: "high", label: "High", color: "#2d8a4e" },
  { value: "medium", label: "Medium", color: "#d97706" },
  { value: "low", label: "Low", color: "#888" },
  { value: "crashed", label: "Crashed", color: "#e94560" },
];

const SCHEDULE_OPTIONS = [
  { value: "light", label: "Light", icon: "☀️" },
  { value: "normal", label: "Normal", icon: "📅" },
  { value: "packed", label: "Packed", icon: "🔥" },
];

const TYPE_COLORS = {
  "sheet-pan": { bg: "#fef3c7", text: "#92400e", label: "Sheet Pan" },
  stovetop: { bg: "#dbeafe", text: "#1e40af", label: "Stovetop" },
  crockpot: { bg: "#f3e8ff", text: "#6b21a8", label: "Crockpot" },
  grill: { bg: "#dcfce7", text: "#166534", label: "Grill" },
  none: { bg: "#f1f5f9", text: "#475569", label: "Leftovers" },
};

export default function MealPlannerAPI() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [weeklyMeals, setWeeklyMeals] = useState({});
  const [energyLevels, setEnergyLevels] = useState(getDailyEnergyDefaults());
  const [scheduleSettings, setScheduleSettings] = useState(getScheduleDefaults());
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [printMode, setPrintMode] = useState(false);

  // Load meals on mount and when week changes
  useEffect(() => {
    loadWeeklyMeals();
  }, [activeWeek]);

  const loadWeeklyMeals = async () => {
    setLoading(true);
    try {
      const dailySettings = DAYS.map((day) => ({
        energyLevel: energyLevels[day],
        scheduleBusyness: scheduleSettings[day],
      }));

      const meals = await getWeeklyMeals(dailySettings, activeWeek);
      setWeeklyMeals(meals);
    } catch (error) {
      console.error("Error loading meals:", error);
      alert("Failed to load meals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMeals = () => {
    loadWeeklyMeals();
  };

  const handleEnergyChange = (day, level) => {
    setEnergyLevels({ ...energyLevels, [day]: level });
  };

  const handleScheduleChange = (day, schedule) => {
    setScheduleSettings({ ...scheduleSettings, [day]: schedule });
  };

  const generateGroceryList = () => {
    const allItems = {};

    Object.values(weeklyMeals).forEach((meal) => {
      if (meal.groceryItems && Array.isArray(meal.groceryItems)) {
        meal.groceryItems.forEach((item) => {
          allItems[item] = true;
        });
      }
    });

    return Object.keys(allItems).sort();
  };

  const groceryList = generateGroceryList();

  const crockpotDays = DAYS.filter((day) => {
    const meal = weeklyMeals[day];
    return meal && meal.cookingMethod === "crockpot";
  });

  if (printMode) {
    return (
      <div style={{ background: "white", color: "#1a1a2e", padding: "20px", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
        <style>{`@media print { .no-print { display: none !important; } body { margin: 0; } }`}</style>
        <button
          className="no-print"
          onClick={() => setPrintMode(false)}
          style={{ marginBottom: 16, padding: "8px 16px", background: "#1a1a2e", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
        >
          Back to App
        </button>
        <button
          className="no-print"
          onClick={() => window.print()}
          style={{ marginBottom: 16, marginLeft: 8, padding: "8px 16px", background: "#e94560", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}
        >
          Print
        </button>

        <h2 style={{ fontSize: 20, marginBottom: 12, borderBottom: "2px solid #1a1a2e", paddingBottom: 6 }}>
          Week {activeWeek} Meal Plan
        </h2>

        {crockpotDays.length > 0 && (
          <div style={{ background: "#f3e8ff", padding: 12, borderRadius: 6, marginBottom: 16, border: "2px solid #6b21a8" }}>
            <strong>🔔 Crockpot Alert Days:</strong> {crockpotDays.join(", ")} - Start by 10am!
          </div>
        )}

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 24 }}>
          <thead>
            <tr style={{ background: "#1a1a2e", color: "white" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", width: 80 }}>Day</th>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>Meal</th>
              <th style={{ padding: "6px 8px", textAlign: "left", width: 110 }}>Method</th>
              <th style={{ padding: "6px 8px", textAlign: "left" }}>Prep Notes</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, i) => {
              const meal = weeklyMeals[day];
              if (!meal) return null;
              return (
                <tr key={day} style={{ background: i % 2 === 0 ? "#f8f9fa" : "white", borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ padding: "5px 8px", fontWeight: 700, fontSize: 11 }}>{day.slice(0, 3).toUpperCase()}</td>
                  <td style={{ padding: "5px 8px", fontWeight: 600 }}>{meal.mealName}</td>
                  <td style={{ padding: "5px 8px", color: "#666", fontSize: 11 }}>{meal.activeTime}</td>
                  <td style={{ padding: "5px 8px", fontSize: 11 }}>{meal.prepInstructions}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={{ fontSize: 16, marginBottom: 8 }}>Week {activeWeek} Grocery List</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", padding: "4px 8px" }}>
          {groceryList.map((item) => (
            <div key={item} style={{ fontSize: 11, padding: "2px 0" }}>
              ☐ {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0f0f1a", color: "#e8e8f0", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "0 0 40px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "24px 20px 20px", borderBottom: "1px solid #ffffff10" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>Meal Command Center</h1>
              <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>AI-powered meal planning based on your energy & schedule</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{ background: showSettings ? "#2563eb" : "#ffffff10", color: showSettings ? "white" : "#888", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {showSettings ? "Hide" : "Settings"}
              </button>
              <button
                onClick={() => setPrintMode(true)}
                style={{ background: "#e94560", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                Print View
              </button>
            </div>
          </div>

          {/* Week tabs */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[1, 2].map((wk) => (
              <button
                key={wk}
                onClick={() => setActiveWeek(wk)}
                style={{ flex: 1, padding: "10px", background: activeWeek === wk ? "#e94560" : "#ffffff10", color: activeWeek === wk ? "white" : "#888", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Week {wk}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 20px" }}>
        {/* Crockpot Alerts */}
        {crockpotDays.length > 0 && (
          <div style={{ background: "#6b21a820", border: "1px solid #6b21a8", borderRadius: 8, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", marginBottom: 4 }}>🔔 Crockpot Alert!</div>
            <div style={{ fontSize: 12, color: "#c4b5fd" }}>
              Start crockpot by 10am on: <strong>{crockpotDays.join(", ")}</strong>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div style={{ background: "#ffffff08", borderRadius: 10, padding: 16, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Weekly Settings</h3>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
              Adjust your energy level and schedule for each day. Changes apply when you click Refresh Meals.
            </p>

            {DAYS.map((day) => (
              <div key={day} style={{ marginBottom: 12, padding: 12, background: "#ffffff05", borderRadius: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{day}</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Energy Level</div>
                    <select
                      value={energyLevels[day]}
                      onChange={(e) => handleEnergyChange(day, e.target.value)}
                      style={{ width: "100%", padding: "6px 8px", background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 4, color: "white", fontSize: 12 }}
                    >
                      {ENERGY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Schedule</div>
                    <select
                      value={scheduleSettings[day]}
                      onChange={(e) => handleScheduleChange(day, e.target.value)}
                      style={{ width: "100%", padding: "6px 8px", background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 4, color: "white", fontSize: 12 }}
                    >
                      {SCHEDULE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.icon} {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleRefreshMeals}
              disabled={loading}
              style={{ width: "100%", padding: 12, background: loading ? "#333" : "#2d8a4e", color: "white", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}
            >
              {loading ? "Loading..." : "Refresh Meals with New Settings"}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && Object.keys(weeklyMeals).length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Loading your personalized meal plan...</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Analyzing energy levels and schedule</div>
          </div>
        )}

        {/* Meal List */}
        {!loading && Object.keys(weeklyMeals).length > 0 && (
          <div>
            {DAYS.map((day) => {
              const meal = weeklyMeals[day];
              if (!meal) return null;

              const typeStyle = TYPE_COLORS[meal.cookingMethod] || TYPE_COLORS.stovetop;
              const isEditing = editingDay === day;

              return (
                <div key={day} style={{ background: "#ffffff06", borderRadius: 10, marginBottom: 8, overflow: "hidden", border: "1px solid #ffffff08" }}>
                  {/* Day header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                      <div style={{ background: meal.cookingMethod === "none" ? "#334155" : "#e94560", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 4, width: 36, textAlign: "center" }}>
                        {day.slice(0, 3).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{meal.mealName}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                          <span style={{ background: typeStyle.bg, color: typeStyle.text, fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3 }}>
                            {typeStyle.label}
                          </span>
                          <span style={{ color: "#666", fontSize: 12 }}>{meal.activeTime}</span>
                          {scheduleSettings[day] === "packed" && <span style={{ fontSize: 10, color: "#d97706" }}>🔥 Packed</span>}
                          {energyLevels[day] === "crashed" && <span style={{ fontSize: 10, color: "#e94560" }}>😴 Crashed</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingDay(isEditing ? null : day)}
                      style={{ background: isEditing ? "#2563eb" : "#ffffff10", color: isEditing ? "white" : "#888", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}
                    >
                      {isEditing ? "Close" : "Details"}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isEditing && (
                    <div style={{ padding: "0 14px 14px", fontSize: 13, lineHeight: 1.5 }}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ color: "#d97706", fontWeight: 600 }}>Prep:</span>
                        <div style={{ color: "#aaa", marginTop: 4 }}>{meal.prepInstructions}</div>
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ color: "#2d8a4e", fontWeight: 600 }}>Serving:</span>
                        <div style={{ color: "#aaa", marginTop: 4 }}>{meal.servingNotes}</div>
                      </div>
                      {meal.leftoverPotential && (
                        <div>
                          <span style={{ color: "#888", fontWeight: 600 }}>Leftover Potential:</span>
                          <span style={{ marginLeft: 8, color: meal.leftoverPotential === "high" ? "#2d8a4e" : meal.leftoverPotential === "medium" ? "#d97706" : "#888" }}>
                            {meal.leftoverPotential.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Grocery List */}
        {groceryList.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Grocery List ({groceryList.length} items)</h3>
            <div style={{ background: "#ffffff08", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {groceryList.map((item) => (
                  <div key={item} style={{ fontSize: 13, padding: "4px 0", color: "#ddd" }}>
                    ☐ {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
