import { useState, useEffect, useRef } from "react";
import { trackChorePoints } from "../api/dmnApi";
import { loadChoreData, updateKidChoreData, exportAllData, importData } from "../api/storage";

const KIDS = ["Rory", "Addy", "Elly"];

const TASKS = {
  Rory: [
    { name: "Make bed", points: 2 },
    { name: "Clean up room", points: 3 },
    { name: "Pack school stuff", points: 2 },
    { name: "Homework / reading", points: 4 },
    { name: "Help with dishes", points: 3 },
    { name: "Pick up trash", points: 2 },
    { name: "Take out trash", points: 2 },
    { name: "Laundry", points: 3 },
    { name: "Screen time check", points: 1 },
    { name: "Help cook dinner", points: 3, bonus: true },
    { name: "Do something nice", points: 3, bonus: true },
  ],
  Addy: [
    { name: "Make bed", points: 2 },
    { name: "Clean up room", points: 2 },
    { name: "Get dressed and ready", points: 1 },
    { name: "Pack school stuff", points: 2 },
    { name: "Homework or reading", points: 3 },
    { name: "Help with dishes", points: 2 },
    { name: "Pick up trash", points: 2 },
    { name: "Help take out trash", points: 2 },
    { name: "Put away laundry", points: 2 },
    { name: "Screen time check", points: 1 },
    { name: "Help cook dinner", points: 3, bonus: true },
    { name: "Do something nice", points: 2, bonus: true },
  ],
  Elly: [
    { name: "Make bed", points: 2 },
    { name: "Clean up room", points: 2 },
    { name: "Get dressed and ready", points: 1 },
    { name: "Pack school stuff", points: 2 },
    { name: "Homework or reading", points: 3 },
    { name: "Help with dishes", points: 2 },
    { name: "Pick up trash", points: 2 },
    { name: "Help take out trash", points: 2 },
    { name: "Put away laundry", points: 2 },
    { name: "Screen time check", points: 1 },
    { name: "Help cook dinner", points: 3, bonus: true },
    { name: "Do something nice", points: 2, bonus: true },
  ],
};

export default function ChoreTracker() {
  const [selectedKid, setSelectedKid] = useState("Rory");
  const [completedTasks, setCompletedTasks] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedData, setSavedData] = useState({});
  const [showDataMenu, setShowDataMenu] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load saved data for all kids
    loadChoreData().then(data => {
      setSavedData(data);
    });
  }, []);

  const handleTaskToggle = (taskName) => {
    if (completedTasks.includes(taskName)) {
      setCompletedTasks(completedTasks.filter((t) => t !== taskName));
    } else {
      setCompletedTasks([...completedTasks, taskName]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const kidData = savedData[selectedKid] || {
        previousStreakDays: 0,
        weeklyPointsSoFar: 0,
      };

      const choreResult = await trackChorePoints({
        kidName: selectedKid,
        completedTasks,
        previousStreakDays: kidData.previousStreakDays,
        weeklyPointsSoFar: kidData.weeklyPointsSoFar,
      });

      setResult(choreResult);

      // Save updated data with history
      const updatedKidData = await updateKidChoreData(selectedKid, {
        streakDays: choreResult.streakDays,
        weeklyPointsTotal: choreResult.weeklyPointsTotal,
        dailyPoints: choreResult.dailyPoints,
        completedTasks,
      });

      // Update local state
      setSavedData({
        ...savedData,
        [selectedKid]: updatedKidData,
      });
    } catch (error) {
      console.error("Error tracking chores:", error);
      alert("Failed to track chores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    await exportAllData();
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const importedData = await importData(file);
      setSavedData(importedData.choreData);
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    }
  };

  const handleReset = () => {
    setCompletedTasks([]);
    setResult(null);
  };

  const dailyThreshold = selectedKid === "Rory" ? 15 : 10;
  const weeklyThreshold = selectedKid === "Rory" ? 80 : 60;
  const currentPoints = completedTasks.reduce((sum, taskName) => {
    const task = TASKS[selectedKid].find((t) => t.name === taskName);
    return sum + (task?.points || 0);
  }, 0);

  return (
    <div style={{ background: "#0f0f1a", color: "#e8e8f0", minHeight: "100vh", padding: "20px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Chore Tracker</h1>
            <p style={{ color: "#888", fontSize: 13, margin: 0 }}>
              Track daily tasks and earn screen time + weekly bonuses
            </p>
          </div>
          <button
            onClick={() => setShowDataMenu(!showDataMenu)}
            style={{
              padding: "8px 12px",
              background: "#ffffff10",
              color: "#888",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ⚙️ Data
          </button>
        </div>

        {/* Data Management Menu */}
        {showDataMenu && (
          <div style={{ background: "#ffffff08", borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Backup & Restore</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={handleExport}
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "10px",
                  background: "#2d8a4e",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📥 Export Data
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  flex: 1,
                  minWidth: 120,
                  padding: "10px",
                  background: "#d97706",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📤 Import Data
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: "none" }}
              />
            </div>
            <p style={{ fontSize: 11, color: "#666", marginTop: 12, marginBottom: 0 }}>
              Export: Download all chore data as JSON file<br />
              Import: Restore data from a previous export
            </p>
          </div>
        )}

        {/* Kid Selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {KIDS.map((kid) => (
            <button
              key={kid}
              onClick={() => {
                setSelectedKid(kid);
                setCompletedTasks([]);
                setResult(null);
              }}
              style={{
                flex: 1,
                padding: "12px",
                background: selectedKid === kid ? "#e94560" : "#ffffff10",
                color: selectedKid === kid ? "white" : "#888",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {kid}
            </button>
          ))}
        </div>

        {/* Current Stats */}
        <div style={{ background: "#ffffff08", borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, textAlign: "center" }}>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Current Streak</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2d8a4e" }}>
                {savedData[selectedKid]?.previousStreakDays || 0} days
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Weekly Points</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#d97706" }}>
                {savedData[selectedKid]?.weeklyPointsSoFar || 0}/{weeklyThreshold}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Today's Points</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: currentPoints >= dailyThreshold ? "#2d8a4e" : "#888" }}>
                {currentPoints}/{dailyThreshold}
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Daily Tasks</h3>
          <div style={{ background: "#ffffff08", borderRadius: 10, padding: 12 }}>
            {TASKS[selectedKid].map((task) => {
              const isChecked = completedTasks.includes(task.name);
              return (
                <div
                  key={task.name}
                  onClick={() => handleTaskToggle(task.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    cursor: "pointer",
                    borderRadius: 6,
                    marginBottom: 4,
                    background: isChecked ? "#ffffff10" : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: isChecked ? "none" : "2px solid #444",
                      background: isChecked ? "#2d8a4e" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {isChecked && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, textDecoration: isChecked ? "line-through" : "none" }}>
                    {task.name}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: task.bonus ? "#d97706" : "#666",
                      background: task.bonus ? "#d9770620" : "transparent",
                      padding: task.bonus ? "2px 6px" : 0,
                      borderRadius: 3,
                    }}
                  >
                    {task.points} pt{task.bonus ? " BONUS" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || completedTasks.length === 0}
          style={{
            width: "100%",
            padding: 14,
            background: loading || completedTasks.length === 0 ? "#333" : "#2d8a4e",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading || completedTasks.length === 0 ? "not-allowed" : "pointer",
            marginBottom: 12,
          }}
        >
          {loading ? "Calculating..." : "Check Results"}
        </button>

        {result && (
          <div>
            <button
              onClick={handleReset}
              style={{
                width: "100%",
                padding: 10,
                background: "#ffffff10",
                color: "#888",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 20,
              }}
            >
              Reset for New Entry
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ background: "#ffffff08", borderRadius: 10, padding: 20, marginTop: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {result.screenTimeUnlocked ? (
                <div>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>🎮</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#2d8a4e", marginBottom: 8 }}>
                    Screen Time Unlocked!
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>💪</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: "#d97706", marginBottom: 8 }}>
                    {result.pointsNeeded} more {result.pointsNeeded === 1 ? "point" : "points"} needed
                  </div>
                </div>
              )}
              <div style={{ fontSize: 14, color: "#aaa", fontStyle: "italic" }}>
                {result.encouragement}
              </div>
            </div>

            <div style={{ borderTop: "1px solid #ffffff15", paddingTop: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
                <div>
                  <span style={{ color: "#888" }}>Daily Points:</span>
                  <span style={{ float: "right", fontWeight: 600 }}>{result.dailyPoints}</span>
                </div>
                <div>
                  <span style={{ color: "#888" }}>Streak Days:</span>
                  <span style={{ float: "right", fontWeight: 600 }}>{result.streakDays}</span>
                </div>
                <div>
                  <span style={{ color: "#888" }}>Weekly Total:</span>
                  <span style={{ float: "right", fontWeight: 600 }}>
                    {result.weeklyPointsTotal}/{weeklyThreshold}
                  </span>
                </div>
                <div>
                  <span style={{ color: "#888" }}>Weekly Bonus:</span>
                  <span style={{ float: "right", fontWeight: 600, color: result.weeklyBonusEarned ? "#2d8a4e" : "#888" }}>
                    {result.weeklyBonusEarned ? "✓ Earned!" : "Not Yet"}
                  </span>
                </div>
              </div>

              {result.consistencyBonus && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    background: "#d9770620",
                    borderRadius: 6,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#d97706",
                  }}
                >
                  🔥 CONSISTENCY BONUS UNLOCKED! 5+ Day Streak!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
