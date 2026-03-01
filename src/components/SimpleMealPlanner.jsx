import { useState, useEffect } from "react";
import { getMealSuggestion } from "../api/dmnApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ENERGY_OPTIONS = [
  { value: "high", label: "Great!", icon: "😄", color: "#2d8a4e", description: "Lots of energy" },
  { value: "medium", label: "Good", icon: "😊", color: "#d97706", description: "Normal energy" },
  { value: "low", label: "Tired", icon: "😌", color: "#888", description: "Low energy" },
  { value: "crashed", label: "Exhausted", icon: "😴", color: "#e94560", description: "Need something EASY" },
];

const SCHEDULE_OPTIONS = [
  { value: "light", label: "Chill Day", icon: "☀️", color: "#2d8a4e", description: "Plenty of time" },
  { value: "normal", label: "Regular Day", icon: "📅", color: "#d97706", description: "Normal schedule" },
  { value: "packed", label: "Crazy Busy", icon: "🔥", color: "#e94560", description: "Back-to-back meetings" },
];

const TYPE_COLORS = {
  "sheet-pan": { bg: "#fef3c7", text: "#92400e", label: "Sheet Pan" },
  stovetop: { bg: "#dbeafe", text: "#1e40af", label: "Stovetop" },
  crockpot: { bg: "#f3e8ff", text: "#6b21a8", label: "Crockpot" },
  grill: { bg: "#dcfce7", text: "#166534", label: "Grill" },
  none: { bg: "#f1f5f9", text: "#475569", label: "Leftovers" },
};

export default function SimpleMealPlanner() {
  const [todayEnergy, setTodayEnergy] = useState("medium");
  const [todaySchedule, setTodaySchedule] = useState("normal");
  const [todayMeal, setTodayMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);

  // Get today's day of week
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]; // 0=Sunday, adjust to Monday=0

  // Load today's meal when energy/schedule changes
  useEffect(() => {
    loadTodaysMeal();
  }, [todayEnergy, todaySchedule, activeWeek]);

  const loadTodaysMeal = async () => {
    setLoading(true);
    try {
      const meal = await getMealSuggestion(today, todayEnergy, todaySchedule, activeWeek);
      setTodayMeal(meal);
    } catch (error) {
      console.error("Error loading meal:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentEnergy = ENERGY_OPTIONS.find((e) => e.value === todayEnergy);
  const currentSchedule = SCHEDULE_OPTIONS.find((s) => s.value === todaySchedule);

  return (
    <div style={{ background: "#0f0f1a", color: "#e8e8f0", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "0 0 40px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "20px 20px 24px", borderBottom: "1px solid #ffffff10" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px 0" }}>What's for Dinner?</h1>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Tell me how you're feeling, I'll handle the rest</p>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        {/* Today Badge */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>Today is</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#e94560" }}>{today}</div>
        </div>

        {/* Energy Selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#aaa" }}>How are you feeling?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {ENERGY_OPTIONS.map((option) => {
              const isSelected = todayEnergy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTodayEnergy(option.value)}
                  style={{
                    padding: "14px",
                    background: isSelected ? option.color : "#ffffff08",
                    color: isSelected ? "white" : "#aaa",
                    border: isSelected ? `2px solid ${option.color}` : "2px solid transparent",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{option.icon}</span>
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div>{option.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{option.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule Selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#aaa" }}>What's your schedule like?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {SCHEDULE_OPTIONS.map((option) => {
              const isSelected = todaySchedule === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTodaySchedule(option.value)}
                  style={{
                    padding: "12px 8px",
                    background: isSelected ? option.color : "#ffffff08",
                    color: isSelected ? "white" : "#aaa",
                    border: isSelected ? `2px solid ${option.color}` : "2px solid transparent",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{option.icon}</div>
                  <div>{option.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#888" }}>Finding the perfect meal...</div>
          </div>
        )}

        {/* Today's Meal Card */}
        {!loading && todayMeal && (
          <div style={{ background: "linear-gradient(135deg, #e94560 0%, #d93552 100%)", borderRadius: 16, padding: "24px", marginBottom: 20, boxShadow: "0 4px 20px rgba(233, 69, 96, 0.3)" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Tonight's Dinner
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 16px 0", color: "white", lineHeight: 1.2 }}>{todayMeal.mealName}</h2>

            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, color: "white" }}>
                ⏱️ {todayMeal.activeTime}
              </div>
              <div style={{ background: "rgba(255,255,255,0.2)", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, color: "white" }}>
                🍳 {TYPE_COLORS[todayMeal.cookingMethod]?.label || todayMeal.cookingMethod}
              </div>
              {todayMeal.cookingMethod === "crockpot" && (
                <div style={{ background: "rgba(255,255,255,0.3)", padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, color: "white" }}>
                  ⚠️ Start by 10am!
                </div>
              )}
            </div>

            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>How to Make It:</div>
              <div style={{ fontSize: 14, color: "white", lineHeight: 1.5, marginBottom: 12 }}>{todayMeal.prepInstructions}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.9)", marginBottom: 8 }}>Serving:</div>
              <div style={{ fontSize: 14, color: "white", lineHeight: 1.5 }}>{todayMeal.servingNotes}</div>
            </div>

            {todayMeal.groceryItems && todayMeal.groceryItems.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: 16, marginTop: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>🛒</span>
                  Make sure you have these on hand:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                  {todayMeal.groceryItems.map((item, i) => (
                    <div key={i} style={{ fontSize: 14, color: "white", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>✓</span> {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Context Display */}
        <div style={{ background: "#ffffff08", borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>Based on your input:</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{currentEnergy?.icon}</span>
              <span style={{ fontSize: 14, color: "#ddd" }}>{currentEnergy?.label}</span>
            </div>
            <div style={{ fontSize: 20, color: "#444" }}>+</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{currentSchedule?.icon}</span>
              <span style={{ fontSize: 14, color: "#ddd" }}>{currentSchedule?.label}</span>
            </div>
            <div style={{ fontSize: 20, color: "#444" }}>=</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#e94560" }}>
              {todayMeal?.mealName || "Loading..."}
            </div>
          </div>
        </div>

        {/* Week Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[1, 2].map((wk) => (
            <button
              key={wk}
              onClick={() => setActiveWeek(wk)}
              style={{
                flex: 1,
                padding: "10px",
                background: activeWeek === wk ? "#e94560" : "#ffffff10",
                color: activeWeek === wk ? "white" : "#888",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Week {wk}
            </button>
          ))}
        </div>

        {/* Tips */}
        <div style={{ background: "#ffffff05", borderRadius: 10, padding: 16, fontSize: 13, color: "#888", lineHeight: 1.6 }}>
          <div style={{ fontWeight: 600, color: "#aaa", marginBottom: 8 }}>💡 Pro Tips:</div>
          <div style={{ marginBottom: 4 }}>• Tuesday is always Tacos (non-negotiable!)</div>
          <div style={{ marginBottom: 4 }}>• Saturday is always Leftovers (clean out the fridge)</div>
          <div style={{ marginBottom: 4 }}>• Feeling exhausted? You'll get a super easy 15-min meal</div>
          <div>• Crazy busy day? You'll get crockpot meals (start by 10am)</div>
        </div>
      </div>
    </div>
  );
}
