import { useState } from "react";
import SimpleMealPlanner from "./components/SimpleMealPlanner";
import WeekPlanner from "./components/WeekPlanner";
import ChoreTracker from "./components/ChoreTracker";

export default function App() {
  const [activeView, setActiveView] = useState("today");

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f1a" }}>
      {/* Navigation Tabs */}
      <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", borderBottom: "1px solid #ffffff10", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "12px 20px" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setActiveView("today")}
              style={{
                flex: 1,
                padding: "10px",
                background: activeView === "today" ? "#e94560" : "#ffffff10",
                color: activeView === "today" ? "white" : "#888",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              🍽️ Today
            </button>
            <button
              onClick={() => setActiveView("week")}
              style={{
                flex: 1,
                padding: "10px",
                background: activeView === "week" ? "#e94560" : "#ffffff10",
                color: activeView === "week" ? "white" : "#888",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              📅 Week Plan
            </button>
            <button
              onClick={() => setActiveView("chores")}
              style={{
                flex: 1,
                padding: "10px",
                background: activeView === "chores" ? "#e94560" : "#ffffff10",
                color: activeView === "chores" ? "white" : "#888",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              ⭐ Chores
            </button>
          </div>
        </div>
      </div>

      {/* Active View */}
      {activeView === "today" && <SimpleMealPlanner />}
      {activeView === "week" && <WeekPlanner />}
      {activeView === "chores" && <ChoreTracker />}
    </div>
  );
}
