import { useState, useEffect } from "react";
import { getMealSuggestion } from "../api/dmnApi";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TYPE_COLORS = {
  "sheet-pan": { bg: "#fef3c7", text: "#92400e", label: "Sheet Pan" },
  stovetop: { bg: "#dbeafe", text: "#1e40af", label: "Stovetop" },
  crockpot: { bg: "#f3e8ff", text: "#6b21a8", label: "Crockpot" },
  grill: { bg: "#dcfce7", text: "#166534", label: "Grill" },
  none: { bg: "#f1f5f9", text: "#475569", label: "Leftovers" },
};

export default function WeekPlanner() {
  const [activeWeek, setActiveWeek] = useState(1);
  const [weekMeals, setWeekMeals] = useState({});
  const [loading, setLoading] = useState(false);

  // Get today's day of week
  const today = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Load week when component mounts or week changes
  useEffect(() => {
    loadFullWeek();
  }, [activeWeek]);

  const loadFullWeek = async () => {
    setLoading(true);
    try {
      const meals = {};
      for (const day of DAYS) {
        // Use medium energy and normal schedule for planning view
        const meal = await getMealSuggestion(day, "medium", "normal", activeWeek);
        meals[day] = meal;
      }
      setWeekMeals(meals);
    } catch (error) {
      console.error("Error loading week:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#0f0f1a", color: "#e8e8f0", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", padding: "0 0 40px 0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: white !important; }

          /* Hide navigation and controls */
          [data-print-hide] { display: none !important; }

          /* Show all content */
          div { background: white !important; color: black !important; }

          /* Compact layout */
          .week-planner-container {
            max-width: 100% !important;
            padding: 10px !important;
          }

          /* Header */
          .week-planner-header {
            background: white !important;
            color: black !important;
            border-bottom: 2px solid #333 !important;
            padding: 10px 0 !important;
          }

          .week-planner-title {
            font-size: 18pt !important;
            font-weight: bold !important;
            margin: 0 !important;
          }

          /* Day cards */
          .day-card {
            border: 1px solid #333 !important;
            margin-bottom: 8px !important;
            padding: 8px !important;
            page-break-inside: avoid;
          }

          .day-header {
            font-size: 11pt !important;
            font-weight: bold !important;
            margin-bottom: 4px !important;
          }

          .meal-name {
            font-size: 10pt !important;
            font-weight: bold !important;
          }

          .meal-details {
            font-size: 9pt !important;
            color: #333 !important;
          }

          /* Shopping list */
          .shopping-list {
            border: 2px solid #333 !important;
            padding: 10px !important;
            margin-top: 10px !important;
            page-break-before: auto;
            background: #f5f5f5 !important;
          }

          .shopping-list-title {
            font-size: 12pt !important;
            font-weight: bold !important;
            margin-bottom: 8px !important;
          }

          .shopping-item {
            font-size: 9pt !important;
            line-height: 1.3 !important;
          }

          /* Expand all details */
          details { display: block !important; }
          details summary { display: none !important; }
          details > div { display: block !important; }

          /* Remove backgrounds and colors */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="week-planner-header" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", padding: "20px 20px 24px", borderBottom: "1px solid #ffffff10" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1 className="week-planner-title" style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px 0" }}>Weekly Meal Plan - Week {activeWeek}</h1>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }} data-print-hide>Your full week at a glance - plan ahead, shop smart</p>
        </div>
      </div>

      <div className="week-planner-container" style={{ maxWidth: 700, margin: "0 auto", padding: "20px" }}>
        {/* Week Toggle */}
        <div data-print-hide style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[1, 2].map((wk) => (
            <button
              key={wk}
              onClick={() => setActiveWeek(wk)}
              style={{
                flex: 1,
                padding: "12px",
                background: activeWeek === wk ? "#e94560" : "#ffffff10",
                color: activeWeek === wk ? "white" : "#888",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Week {wk}
            </button>
          ))}
        </div>

        {/* Info Banner */}
        <div data-print-hide style={{ background: "#2d8a4e20", border: "1px solid #2d8a4e40", borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, color: "#2d8a4e" }}>📅 Planning Mode:</span> This shows default meals with medium energy and normal schedule.
            Use the <strong>"Today"</strong> tab to adjust for your actual energy level each day.
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🔄</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#888" }}>Loading week...</div>
          </div>
        )}

        {/* Week Overview */}
        {!loading && Object.keys(weekMeals).length > 0 && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: "#ddd", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>📋</span>
                Week {activeWeek} Menu
              </h3>

              {DAYS.map((day) => {
                const meal = weekMeals[day];
                if (!meal) return null;

                const isToday = day === today;
                const typeStyle = TYPE_COLORS[meal.cookingMethod] || TYPE_COLORS.stovetop;

                return (
                  <div
                    key={day}
                    className="day-card"
                    style={{
                      background: isToday ? "#ffffff15" : "#ffffff08",
                      border: isToday ? "2px solid #e94560" : "1px solid #ffffff08",
                      borderRadius: 12,
                      padding: "16px",
                      marginBottom: 10,
                    }}
                  >
                    {/* Day Header */}
                    <div className="day-header" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div
                        style={{
                          background: isToday ? "#e94560" : "#334155",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "6px 10px",
                          borderRadius: 6,
                          minWidth: 50,
                          textAlign: "center",
                        }}
                      >
                        {day.slice(0, 3).toUpperCase()}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="meal-name" style={{ fontSize: 16, fontWeight: 600, color: isToday ? "#e94560" : "#ddd", marginBottom: 4 }}>
                          {meal.mealName}
                        </div>
                        <div className="meal-details" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span
                            style={{
                              background: typeStyle.bg,
                              color: typeStyle.text,
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "3px 8px",
                              borderRadius: 4,
                            }}
                          >
                            {typeStyle.label}
                          </span>
                          <span style={{ color: "#888", fontSize: 13 }}>⏱️ {meal.activeTime}</span>
                          {meal.cookingMethod === "crockpot" && (
                            <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>⚠️ Start by 10am</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prep Instructions */}
                    <div style={{ background: "#ffffff08", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#d97706", marginBottom: 4 }}>How to Make:</div>
                      <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5 }}>{meal.prepInstructions}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#2d8a4e", marginTop: 8, marginBottom: 4 }}>Serving:</div>
                      <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.5 }}>{meal.servingNotes}</div>
                    </div>

                    {/* Grocery Items - Collapsible */}
                    {meal.groceryItems && meal.groceryItems.length > 0 && (
                      <details style={{ marginTop: 10 }}>
                        <summary
                          style={{
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#888",
                            userSelect: "none",
                            padding: "6px 0",
                          }}
                        >
                          🛒 Shopping List ({meal.groceryItems.length} items)
                        </summary>
                        <div
                          style={{
                            marginTop: 8,
                            paddingLeft: 8,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "6px 12px",
                          }}
                        >
                          {meal.groceryItems.map((item, i) => (
                            <div key={i} style={{ fontSize: 13, color: "#aaa" }}>
                              • {item}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Aggregate Grocery List */}
            <div className="shopping-list" style={{ background: "linear-gradient(135deg, #2d8a4e20 0%, #16a34a20 100%)", border: "2px solid #2d8a4e", borderRadius: 12, padding: 20, marginTop: 24 }}>
              <h4 className="shopping-list-title" style={{ fontSize: 18, fontWeight: 700, color: "#2d8a4e", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>🛒</span>
                Full Week Shopping List
              </h4>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 16 }} data-print-hide>Everything you need for Week {activeWeek}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                {[...new Set(Object.values(weekMeals).flatMap((m) => m.groceryItems || []))]
                  .sort()
                  .map((item, i) => (
                    <div key={i} className="shopping-item" style={{ fontSize: 14, color: "#ddd", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "#2d8a4e", fontSize: 16 }}>☐</span> {item}
                    </div>
                  ))}
              </div>
            </div>

            {/* Print Button */}
            <button
              data-print-hide
              onClick={() => window.print()}
              style={{
                width: "100%",
                marginTop: 20,
                padding: "14px",
                background: "#e94560",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#d93552")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#e94560")}
            >
              🖨️ Print Week Plan
            </button>
          </>
        )}

        {/* Tips */}
        <div data-print-hide style={{ background: "#ffffff05", borderRadius: 10, padding: 16, fontSize: 13, color: "#888", lineHeight: 1.6, marginTop: 20 }}>
          <div style={{ fontWeight: 600, color: "#aaa", marginBottom: 8 }}>💡 Planning Tips:</div>
          <div style={{ marginBottom: 4 }}>• Week 1 and Week 2 rotate different meals to keep things interesting</div>
          <div style={{ marginBottom: 4 }}>• Tuesday is always Tacos, Saturday is always Leftovers (hard constraints)</div>
          <div style={{ marginBottom: 4 }}>• Crockpot meals need to be started by 10am for dinner time</div>
          <div style={{ marginBottom: 4 }}>• Use the "Today" tab to adjust meals based on your actual energy each day</div>
          <div>• Click "Print Week Plan" to get a clean one-page printout with shopping list</div>
        </div>
      </div>
    </div>
  );
}
