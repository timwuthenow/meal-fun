import { useState, useEffect, useCallback } from "react";

const INITIAL_WEEKS = {
  1: {
    Monday: {
      meal: "Honey Garlic Chicken Thighs",
      method: "Sheet pan, 25 min",
      prep: "Chicken thighs + honey, soy sauce, garlic glaze. 400F for 22 min. Broil 2 min.",
      notes: "Serve with rice and steamed broccoli. Great leftover lunch.",
      type: "sheet-pan",
    },
    Tuesday: {
      meal: "Beef Tacos",
      method: "Stovetop, 20 min",
      prep: "Brown ground beef with taco seasoning. Set out toppings bar.",
      notes: "TACO TUESDAY. Cheese, lettuce, salsa, sour cream.",
      type: "stovetop",
      locked: true,
    },
    Wednesday: {
      meal: "Crockpot Italian Chicken",
      method: "Crockpot, 10 min prep",
      prep: "Chicken breasts + jar marinara + Italian seasoning. Low 6 hrs. Shred.",
      notes: "Serve over pasta or on rolls. Doubles as Thu lunch.",
      type: "crockpot",
    },
    Thursday: {
      meal: "Chicken Stir Fry",
      method: "Stovetop, 25 min",
      prep: "Slice chicken thighs. Stir fry with frozen veggies. Soy sauce + garlic.",
      notes: "Serve over rice. Cook extra rice for the week.",
      type: "stovetop",
    },
    Friday: {
      meal: "Grilled Italian Sausages",
      method: "Grill, 20 min",
      prep: "Grill sausages + zucchini and peppers on the side.",
      notes: "Easy Friday. Serve with leftover rice or rolls.",
      type: "grill",
    },
    Saturday: {
      meal: "LEFTOVER NIGHT",
      method: "Reheat",
      prep: "Clean out the fridge. Everyone picks what's left.",
      notes: "No cooking. No guilt. Reduce waste.",
      type: "leftover",
    },
    Sunday: {
      meal: "Sheet Pan Sausage + Potatoes",
      method: "Sheet pan, 30 min",
      prep: "Cube potatoes, slice kielbasa, olive oil + seasoning. 400F 25 min.",
      notes: "Cook while filling out next week's meal plan.",
      type: "sheet-pan",
    },
  },
  2: {
    Monday: {
      meal: "Crockpot Chicken Tacos",
      method: "Crockpot, 5 min prep",
      prep: "Chicken breasts + salsa + cumin + chili powder. Low 6 hrs. Shred.",
      notes: "Tortillas, cheese, sour cream. Leftovers = quesadillas.",
      type: "crockpot",
    },
    Tuesday: {
      meal: "Beef Tacos",
      method: "Stovetop, 20 min",
      prep: "Brown ground beef with taco seasoning. Set out toppings bar.",
      notes: "TACO TUESDAY. Always.",
      type: "stovetop",
      locked: true,
    },
    Wednesday: {
      meal: "Pasta with Meat Sauce",
      method: "Stovetop, 25 min",
      prep: "Brown ground beef, add jar marinara, simmer. Boil pasta.",
      notes: "Classic. No complaints. Reheats perfectly.",
      type: "stovetop",
    },
    Thursday: {
      meal: "Teriyaki Chicken Thighs",
      method: "Sheet pan, 25 min",
      prep: "Chicken thighs + bottled teriyaki. 400F 22 min. Broil 2 min.",
      notes: "Serve with rice and steamed broccoli.",
      type: "sheet-pan",
    },
    Friday: {
      meal: "Grilled Burgers",
      method: "Grill, 20 min",
      prep: "Form patties. Salt, pepper, garlic powder. Grill corn alongside.",
      notes: "Buns, lettuce, tomato, cheese. Simple Friday.",
      type: "grill",
    },
    Saturday: {
      meal: "LEFTOVER NIGHT",
      method: "Reheat",
      prep: "Clean out the fridge. Use up what's there.",
      notes: "No cooking. No waste.",
      type: "leftover",
    },
    Sunday: {
      meal: "Breakfast for Dinner",
      method: "Stovetop, 20 min",
      prep: "Scrambled eggs, bacon or sausage, toast.",
      notes: "Kids love it. You love it. Everyone wins.",
      type: "stovetop",
    },
  },
};

const SWAP_OPTIONS = [
  { meal: "Lemon Herb Chicken Thighs", method: "Sheet pan, 25 min", prep: "Chicken thighs + lemon juice, olive oil, herbs. 400F 22 min.", notes: "Serve with roasted potatoes or rice.", type: "sheet-pan" },
  { meal: "BBQ Chicken Drumsticks", method: "Grill, 25 min", prep: "Brush drumsticks with BBQ sauce. Grill indirect heat 20 min.", notes: "Cheap cut, big flavor. Serve with corn and coleslaw.", type: "grill" },
  { meal: "Black Bean Quesadillas", method: "Stovetop, 15 min", prep: "Tortillas + cheese + canned black beans + salsa. Pan crisp.", notes: "Fastest dinner in the rotation. Kids can build their own.", type: "stovetop" },
  { meal: "Crockpot Pulled Pork", method: "Crockpot, 10 min prep", prep: "Pork shoulder + BBQ sauce + onion. Low 8 hrs. Shred.", notes: "Serve on buns. Feeds an army. Freezes great.", type: "crockpot" },
  { meal: "Garlic Butter Shrimp + Rice", method: "Stovetop, 20 min", prep: "Sear shrimp in garlic butter. Serve over rice with lemon.", notes: "Quick, high protein, feels fancy.", type: "stovetop" },
  { meal: "Sheet Pan Greek Chicken", method: "Sheet pan, 30 min", prep: "Chicken + potatoes + red onion + Greek seasoning. 400F 25 min.", notes: "Serve with pita and tzatziki.", type: "sheet-pan" },
  { meal: "Sloppy Joes", method: "Stovetop, 20 min", prep: "Brown ground beef, add sloppy joe sauce. Serve on buns.", notes: "Kids always eat this. Quick and easy.", type: "stovetop" },
  { meal: "Grilled Chicken Caesar Wraps", method: "Grill + assemble, 20 min", prep: "Grill chicken, slice. Wrap with romaine, parmesan, Caesar dressing.", notes: "Light but filling. Good for warmer nights.", type: "grill" },
  { meal: "One Pot Chili", method: "Stovetop, 30 min", prep: "Ground beef, beans, tomatoes, chili seasoning. Simmer 20 min.", notes: "Top with cheese and sour cream. Leftovers for days.", type: "stovetop" },
  { meal: "Baked Ziti", method: "Oven, 30 min", prep: "Cook ziti. Mix with ricotta + marinara + mozzarella. Bake 375F 20 min.", notes: "Comfort food. Makes tons of leftovers.", type: "sheet-pan" },
  { meal: "Breakfast for Dinner", method: "Stovetop, 20 min", prep: "Scrambled eggs, bacon or sausage, toast.", notes: "Everyone loves it. Zero complaints.", type: "stovetop" },
  { meal: "Chicken Alfredo", method: "Stovetop, 25 min", prep: "Cook pasta. Pan sear chicken. Jar alfredo sauce.", notes: "Not the healthiest but sometimes you need comfort.", type: "stovetop" },
];

const TYPE_COLORS = {
  "sheet-pan": { bg: "#fef3c7", text: "#92400e", label: "Sheet Pan" },
  stovetop: { bg: "#dbeafe", text: "#1e40af", label: "Stovetop" },
  crockpot: { bg: "#f3e8ff", text: "#6b21a8", label: "Crockpot" },
  grill: { bg: "#dcfce7", text: "#166534", label: "Grill" },
  leftover: { bg: "#f1f5f9", text: "#475569", label: "Leftovers" },
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function generateGroceryList(weekMeals) {
  const proteins = [];
  const produce = [];
  const dairy = [];
  const pantry = [];
  const frozen = [];

  Object.values(weekMeals).forEach((m) => {
    if (m.type === "leftover") return;
    const ml = m.meal.toLowerCase();
    const pl = m.prep.toLowerCase();

    if (ml.includes("chicken thigh") || pl.includes("chicken thigh"))
      proteins.push("Chicken thighs (boneless)");
    if (ml.includes("chicken breast") || pl.includes("chicken breast"))
      proteins.push("Chicken breasts (boneless)");
    if (ml.includes("chicken drumstick") || pl.includes("drumstick"))
      proteins.push("Chicken drumsticks");
    if (ml.includes("ground beef") || pl.includes("ground beef"))
      proteins.push("Ground beef (80/20)");
    if (ml.includes("beef taco") || pl.includes("taco seasoning"))
      proteins.push("Ground beef (80/20, taco night)");
    if (ml.includes("sausage") || pl.includes("sausage"))
      proteins.push("Italian sausage links");
    if (ml.includes("kielbasa") || pl.includes("kielbasa"))
      proteins.push("Kielbasa");
    if (ml.includes("pork") || pl.includes("pork shoulder"))
      proteins.push("Pork shoulder");
    if (ml.includes("shrimp") || pl.includes("shrimp"))
      proteins.push("Shrimp (1 lb, peeled)");
    if (ml.includes("burger") || pl.includes("patties"))
      proteins.push("Ground beef (burger patties)");
    if (ml.includes("bacon") || pl.includes("bacon"))
      proteins.push("Bacon");
    if (ml.includes("egg") || pl.includes("egg")) proteins.push("Eggs (1 dozen)");

    if (pl.includes("broccoli")) produce.push("Broccoli");
    if (pl.includes("pepper")) produce.push("Bell peppers");
    if (pl.includes("onion")) produce.push("Onions");
    if (pl.includes("zucchini")) produce.push("Zucchini");
    if (pl.includes("potato")) produce.push("Potatoes");
    if (pl.includes("lemon")) produce.push("Lemons");
    if (pl.includes("lettuce") || pl.includes("romaine"))
      produce.push("Lettuce");
    if (pl.includes("tomato")) produce.push("Tomatoes");
    if (pl.includes("garlic")) produce.push("Garlic");
    if (pl.includes("corn")) produce.push("Corn on the cob");
    if (pl.includes("lime")) produce.push("Limes");

    if (
      ml.includes("taco") ||
      ml.includes("quesadilla") ||
      pl.includes("cheese")
    )
      dairy.push("Shredded Mexican cheese");
    if (pl.includes("sour cream")) dairy.push("Sour cream");
    if (pl.includes("mozzarella")) dairy.push("Mozzarella");
    if (pl.includes("ricotta")) dairy.push("Ricotta");
    if (pl.includes("parmesan")) dairy.push("Parmesan");
    if (ml.includes("burger")) dairy.push("Sliced cheese (burgers)");
    if (pl.includes("butter")) dairy.push("Butter");
    if (pl.includes("egg")) dairy.push("Eggs (1 dozen)");

    if (pl.includes("tortilla")) pantry.push("Flour tortillas");
    if (pl.includes("pasta") || pl.includes("ziti"))
      pantry.push("Pasta (1 lb)");
    if (pl.includes("rice")) pantry.push("Rice");
    if (pl.includes("marinara") || pl.includes("jar marinara"))
      pantry.push("Marinara sauce (jar)");
    if (pl.includes("salsa")) pantry.push("Salsa");
    if (pl.includes("soy sauce")) pantry.push("Soy sauce");
    if (pl.includes("teriyaki")) pantry.push("Teriyaki sauce");
    if (pl.includes("taco seasoning")) pantry.push("Taco seasoning");
    if (pl.includes("bbq")) pantry.push("BBQ sauce");
    if (pl.includes("alfredo")) pantry.push("Alfredo sauce (jar)");
    if (pl.includes("black bean") || pl.includes("beans"))
      pantry.push("Canned black beans");
    if (pl.includes("bun") || pl.includes("roll"))
      pantry.push("Buns or rolls");
    if (pl.includes("bread") || pl.includes("toast")) pantry.push("Bread");
    if (pl.includes("pita")) pantry.push("Pita bread");
    if (pl.includes("chili seasoning") || ml.includes("chili"))
      pantry.push("Chili seasoning");

    if (pl.includes("frozen")) frozen.push("Frozen stir fry veggies");
    if (pl.includes("frozen broccoli")) frozen.push("Frozen broccoli");
  });

  return {
    "Proteins (BJ's bulk)": [...new Set(proteins)],
    Produce: [...new Set(produce)],
    "Dairy / Fridge": [...new Set(dairy)],
    "Pantry (check stock)": [...new Set(pantry)],
    Frozen: [...new Set(frozen)],
  };
}

export default function MealPlanner() {
  const [weeks, setWeeks] = useState(INITIAL_WEEKS);
  const [activeWeek, setActiveWeek] = useState(1);
  const [editingDay, setEditingDay] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showSwap, setShowSwap] = useState(null);
  const [showGrocery, setShowGrocery] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const [printMode, setPrintMode] = useState(false);

  const currentWeek = weeks[activeWeek];
  const grocery = generateGroceryList(currentWeek);

  const handleEdit = (day) => {
    setEditingDay(day);
    setEditForm({ ...currentWeek[day] });
    setShowSwap(null);
  };

  const handleSave = () => {
    setWeeks((prev) => ({
      ...prev,
      [activeWeek]: { ...prev[activeWeek], [editingDay]: { ...editForm } },
    }));
    setEditingDay(null);
  };

  const handleSwap = (day, option) => {
    setWeeks((prev) => ({
      ...prev,
      [activeWeek]: { ...prev[activeWeek], [day]: { ...option } },
    }));
    setShowSwap(null);
  };

  const toggleCheck = (key) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (printMode) {
    return (
      <div style={{ background: "white", color: "#1a1a2e", padding: "20px", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
        <style>{`@media print { .no-print { display: none !important; } body { margin: 0; } }`}</style>
        <button className="no-print" onClick={() => setPrintMode(false)} style={{ marginBottom: 16, padding: "8px 16px", background: "#1a1a2e", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
          Back to App
        </button>
        <button className="no-print" onClick={() => window.print()} style={{ marginBottom: 16, marginLeft: 8, padding: "8px 16px", background: "#e94560", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
          Print
        </button>

        {[1, 2].map((wk) => (
          <div key={wk} style={{ pageBreakAfter: "always", marginBottom: 40 }}>
            <h2 style={{ fontSize: 20, marginBottom: 12, borderBottom: "2px solid #1a1a2e", paddingBottom: 6 }}>Week {wk} Meal Plan</h2>
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
                  const m = weeks[wk][day];
                  return (
                    <tr key={day} style={{ background: i % 2 === 0 ? "#f8f9fa" : "white", borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "5px 8px", fontWeight: 700, fontSize: 11 }}>{day.slice(0, 3).toUpperCase()}</td>
                      <td style={{ padding: "5px 8px", fontWeight: 600 }}>{m.meal}</td>
                      <td style={{ padding: "5px 8px", color: "#666", fontSize: 11 }}>{m.method}</td>
                      <td style={{ padding: "5px 8px", fontSize: 11 }}>{m.prep}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <h3 style={{ fontSize: 16, marginBottom: 8 }}>Week {wk} Grocery List</h3>
            {Object.entries(generateGroceryList(weeks[wk])).map(([section, items]) =>
              items.length > 0 ? (
                <div key={section} style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 11, background: "#1a1a2e", color: "white", padding: "3px 8px", borderRadius: 3 }}>{section}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 16px", padding: "4px 8px" }}>
                    {items.map((item) => (
                      <div key={item} style={{ fontSize: 11, padding: "2px 0" }}>☐ {item}</div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        ))}
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
              <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>Plan it Sunday. Follow it all week. No decisions.</p>
            </div>
            <button onClick={() => setPrintMode(true)} style={{ background: "#e94560", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Print View
            </button>
          </div>

          {/* Week tabs */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {[1, 2].map((wk) => (
              <button key={wk} onClick={() => { setActiveWeek(wk); setEditingDay(null); setShowSwap(null); setShowGrocery(false); }}
                style={{ flex: 1, padding: "10px", background: activeWeek === wk ? "#e94560" : "#ffffff10", color: activeWeek === wk ? "white" : "#888", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
                Week {wk}
              </button>
            ))}
            <button onClick={() => { setShowGrocery(!showGrocery); setEditingDay(null); setShowSwap(null); }}
              style={{ flex: 1, padding: "10px", background: showGrocery ? "#2d8a4e" : "#ffffff10", color: showGrocery ? "white" : "#888", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
              Grocery List
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 20px" }}>
        {/* Grocery List View */}
        {showGrocery ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Week {activeWeek} Grocery List</h2>
              <button onClick={() => setCheckedItems({})} style={{ background: "#ffffff10", color: "#888", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer" }}>
                Reset Checks
              </button>
            </div>
            <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>BJ's for bulk proteins and staples. Harris Teeter for produce and pantry gaps.</p>

            {Object.entries(grocery).map(([section, items]) =>
              items.length > 0 ? (
                <div key={section} style={{ marginBottom: 16 }}>
                  <div style={{ background: "#1a1a2e", padding: "8px 12px", borderRadius: "8px 8px 0 0", fontSize: 12, fontWeight: 700, color: "#aaa", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {section}
                  </div>
                  <div style={{ background: "#ffffff08", borderRadius: "0 0 8px 8px", padding: "4px 0" }}>
                    {items.map((item) => {
                      const key = `${activeWeek}-${section}-${item}`;
                      const checked = checkedItems[key];
                      return (
                        <div key={item} onClick={() => toggleCheck(key)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer", transition: "all 0.15s", opacity: checked ? 0.4 : 1 }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, border: checked ? "none" : "2px solid #444", background: checked ? "#2d8a4e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                            {checked && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 14, textDecoration: checked ? "line-through" : "none" }}>{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null
            )}
          </div>
        ) : (
          /* Meal Plan View */
          <div>
            {DAYS.map((day) => {
              const m = currentWeek[day];
              const typeStyle = TYPE_COLORS[m.type] || TYPE_COLORS.stovetop;
              const isEditing = editingDay === day;
              const isSwapping = showSwap === day;

              return (
                <div key={day} style={{ background: "#ffffff06", borderRadius: 10, marginBottom: 8, overflow: "hidden", border: "1px solid #ffffff08" }}>
                  {/* Day header row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{ background: m.type === "leftover" ? "#334155" : "#e94560", color: "white", fontSize: 11, fontWeight: 700, padding: "4px 8px", borderRadius: 4, flexShrink: 0, width: 36, textAlign: "center" }}>
                        {day.slice(0, 3).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.meal}
                          {m.locked && <span style={{ marginLeft: 6, fontSize: 11, color: "#e94560" }}>🔒</span>}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                          <span style={{ background: typeStyle.bg, color: typeStyle.text, fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3 }}>
                            {typeStyle.label}
                          </span>
                          <span style={{ color: "#666", fontSize: 12 }}>{m.method}</span>
                        </div>
                      </div>
                    </div>
                    {m.type !== "leftover" && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {!m.locked && (
                          <button onClick={() => { setShowSwap(isSwapping ? null : day); setEditingDay(null); }}
                            style={{ background: isSwapping ? "#d97706" : "#ffffff10", color: isSwapping ? "white" : "#888", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer" }}>
                            Swap
                          </button>
                        )}
                        <button onClick={() => isEditing ? setEditingDay(null) : handleEdit(day)}
                          style={{ background: isEditing ? "#2563eb" : "#ffffff10", color: isEditing ? "white" : "#888", border: "none", borderRadius: 6, padding: "5px 8px", fontSize: 11, cursor: "pointer" }}>
                          {isEditing ? "Cancel" : "Edit"}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Prep notes (collapsed view) */}
                  {!isEditing && !isSwapping && m.type !== "leftover" && (
                    <div style={{ padding: "0 14px 10px", fontSize: 13, color: "#999", lineHeight: 1.4 }}>
                      <span style={{ color: "#d97706", fontWeight: 500 }}>Prep:</span> {m.prep}
                      <br />
                      <span style={{ color: "#666", fontSize: 12 }}>{m.notes}</span>
                    </div>
                  )}

                  {/* Edit form */}
                  {isEditing && (
                    <div style={{ padding: "0 14px 14px" }}>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div>
                          <label style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>Meal Name</label>
                          <input value={editForm.meal || ""} onChange={(e) => setEditForm({ ...editForm, meal: e.target.value })}
                            style={{ width: "100%", background: "#ffffff10", border: "1px solid #ffffff15", borderRadius: 6, padding: "8px 10px", color: "white", fontSize: 14, boxSizing: "border-box" }} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div>
                            <label style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>Method</label>
                            <input value={editForm.method || ""} onChange={(e) => setEditForm({ ...editForm, method: e.target.value })}
                              style={{ width: "100%", background: "#ffffff10", border: "1px solid #ffffff15", borderRadius: 6, padding: "8px 10px", color: "white", fontSize: 13, boxSizing: "border-box" }} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>Type</label>
                            <select value={editForm.type || "stovetop"} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                              style={{ width: "100%", background: "#1a1a2e", border: "1px solid #ffffff15", borderRadius: 6, padding: "8px 10px", color: "white", fontSize: 13, boxSizing: "border-box" }}>
                              <option value="stovetop">Stovetop</option>
                              <option value="sheet-pan">Sheet Pan</option>
                              <option value="crockpot">Crockpot</option>
                              <option value="grill">Grill</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>Prep Instructions</label>
                          <textarea value={editForm.prep || ""} onChange={(e) => setEditForm({ ...editForm, prep: e.target.value })}
                            rows={2} style={{ width: "100%", background: "#ffffff10", border: "1px solid #ffffff15", borderRadius: 6, padding: "8px 10px", color: "white", fontSize: 13, resize: "vertical", boxSizing: "border-box" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 11, color: "#888", fontWeight: 600 }}>Notes</label>
                          <input value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            style={{ width: "100%", background: "#ffffff10", border: "1px solid #ffffff15", borderRadius: 6, padding: "8px 10px", color: "white", fontSize: 13, boxSizing: "border-box" }} />
                        </div>
                        <button onClick={handleSave}
                          style={{ background: "#2d8a4e", color: "white", border: "none", borderRadius: 6, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Swap panel */}
                  {isSwapping && (
                    <div style={{ padding: "0 14px 14px" }}>
                      <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Pick a replacement:</p>
                      <div style={{ display: "grid", gap: 4 }}>
                        {SWAP_OPTIONS.filter((o) => o.meal !== m.meal).map((option) => {
                          const ts = TYPE_COLORS[option.type];
                          return (
                            <div key={option.meal} onClick={() => handleSwap(day, option)}
                              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff08", borderRadius: 6, padding: "8px 10px", cursor: "pointer", transition: "background 0.15s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "#ffffff15")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "#ffffff08")}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{option.meal}</div>
                                <div style={{ fontSize: 11, color: "#888" }}>{option.method}</div>
                              </div>
                              <span style={{ background: ts.bg, color: ts.text, fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 3 }}>
                                {ts.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
