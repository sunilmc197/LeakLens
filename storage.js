/* =========================================================
   LeakLens — Storage & Data Management
   ========================================================= */

const Storage = {
  get(key, def = null) {
    try {
      const v = localStorage.getItem("eg_" + key);
      return v ? JSON.parse(v) : def;
    } catch {
      return def;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem("eg_" + key, JSON.stringify(val));
    } catch {}
  },
  remove(key) {
    localStorage.removeItem("eg_" + key);
  },
};

/* ── INR formatter ── */
function formatINR(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

function getSeedRules() {
  return [
    {
      id: 1,
      name: "Daily Meal Limit",
      condition: "Dining amount > ₹6,000",
      threshold: 6000,
      category: "Food & Dining",
      risk: "MED",
      active: true,
    },
    {
      id: 2,
      name: "Hotel Per-Night Cap",
      condition: "Hotel stay > ₹20,000/night",
      threshold: 20000,
      category: "Travel",
      risk: "HIGH",
      active: true,
    },
    {
      id: 3,
      name: "Duplicate Vendor Alert",
      condition: "Same vendor within 3 days",
      threshold: 3,
      category: "All",
      risk: "HIGH",
      active: true,
    },
    {
      id: 4,
      name: "Weekend Purchase Flag",
      condition: "Non-essential on weekends",
      threshold: 0,
      category: "All",
      risk: "LOW",
      active: true,
    },
    {
      id: 5,
      name: "Round Number Fraud",
      condition: "Exact round numbers > ₹50,000",
      threshold: 50000,
      category: "All",
      risk: "MED",
      active: false,
    },
    {
      id: 6,
      name: "After-Hours Transaction",
      condition: "Purchases 10PM–6AM",
      threshold: 0,
      category: "All",
      risk: "MED",
      active: true,
    },
    {
      id: 7,
      name: "Business Class Policy",
      condition: "Business class > ₹1,00,000",
      threshold: 100000,
      category: "Travel",
      risk: "HIGH",
      active: true,
    },
    {
      id: 8,
      name: "Software Subscription Dup",
      condition: "Same software vendor ≤30 days",
      threshold: 30,
      category: "Software",
      risk: "MED",
      active: true,
    },
  ];
}

/* ── Bootstrap data — NO seed expenses, start fresh ── */
function bootstrapData() {
  // Always start with empty expenses so user adds their own
  if (!Storage.get("expenses_initialised")) {
    Storage.set("expenses", []);
    Storage.set("expenses_initialised", true);
  }
  if (!Storage.get("rules")) Storage.set("rules", getSeedRules());
  if (!Storage.get("model"))
    Storage.set("model", { trained: false, accuracy: 0, version: 0 });

  const users = Storage.get("users", []);
  Storage.set("users", users);
}

bootstrapData();
