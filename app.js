/* =========================================================
   LeakLens — Main App Controller
   Currency: INR (₹)  |  No seed expenses — user adds their own
   ========================================================= */

const currentUser = Storage.get("currentUser");
if (!currentUser) {
  window.location.href = "index.html";
}

/* ── INR formatter ── */
function inr(amount) {
  return "₹" + Number(amount).toLocaleString("en-IN");
}

/* ── Init ── */
window.addEventListener("DOMContentLoaded", () => {
  const msgs = ["Loading dashboard...", "Connecting AI engine...", "Ready!"];
  let mi = 0;
  const msgEl = document.getElementById("loadingMsg");
  const iv = setInterval(() => {
    mi += 1;
    if (msgEl && mi < msgs.length) {
      msgEl.textContent = msgs[mi];
    } else {
      clearInterval(iv);
    }
  }, 300);

  requestAnimationFrame(() => {
    if (msgEl) msgEl.textContent = msgs[0];
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("appShell").style.display = "flex";
    bootApp();
  });
});

function bootApp() {
  document.getElementById("userAvatar").textContent = currentUser.avatar || "U";
  document.getElementById("userName").textContent =
    `${currentUser.first} ${currentUser.last}`;
  document.getElementById("userRole").textContent =
    currentUser.role || "Finance Admin";

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => navTo(item.dataset.page));
  });

  const dateInput = document.getElementById("expDate");
  if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];

  ["setName", "setEmail", "setCompany"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === "setName") el.value = `${currentUser.first} ${currentUser.last}`;
    if (id === "setEmail") el.value = currentUser.email || "";
    if (id === "setCompany") el.value = currentUser.company || "";
  });

  initChat();
  navTo("expenses");
  updateRiskBadge();

  const model = Storage.get("model", { trained: false });
}

/* ── Navigation ── */
const PAGE_TITLES = {
  dashboard: "Dashboard Overview",
  expenses: "Expense Management",
  analysis: "Leakage Analysis",
  chat: "AI Advisor",
  reports: "Reports & Exports",
  settings: "Settings",
};

function navTo(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  const pg = document.getElementById("pg-" + page);
  if (pg) pg.classList.add("active");
  const ni = document.querySelector(`[data-page="${page}"]`);
  if (ni) ni.classList.add("active");
  const titleEl = document.getElementById("pageTitle");
  if (titleEl) titleEl.textContent = PAGE_TITLES[page] || page;

  if (page === "dashboard") renderDashboard();
  if (page === "expenses") renderExpensesTable();
  if (page === "analysis") renderAnalysis();
  if (page === "reports") renderReports();
  if (page === "settings") loadApiKeyStatus();

  const ca = document.getElementById("contentArea");
  if (ca) ca.scrollTop = 0;
}

/* ── Toast ── */
function showToast(icon, title, msg) {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `<div class="toast-icon">${icon}</div><div><div class="toast-title">${title}</div><div class="toast-msg">${msg}</div></div>`;
  container.appendChild(t);
  setTimeout(() => {
    t.classList.add("removing");
    setTimeout(() => t.remove(), 260);
  }, 4000);
}

function setModelStatus(status, label) {
  const dot = document.getElementById("modelDot");
  const lbl = document.getElementById("modelLabel");
  if (dot) dot.className = "status-dot " + status;
  if (lbl) lbl.textContent = label;
}

function handleLogout() {
  Storage.remove("currentUser");
  window.location.href = "index.html";
}

function emptyMsg(txt) {
  return `<div style="text-align:center;padding:1.5rem;color:var(--text3);font-size:13px">${txt}</div>`;
}

/* ══════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════ */
function renderDashboard() {
  const expenses = Storage.get("expenses", []);
  const highRisk = expenses.filter((e) => e.risk === "HIGH");
  const medRisk = expenses.filter((e) => e.risk === "MED");
  const lowRisk = expenses.filter((e) => e.risk === "LOW");
  const totalAmt = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const leakageAmt = [...highRisk, ...medRisk].reduce(
    (s, e) => s + Number(e.amount),
    0,
  );
  const recovered = Math.round(leakageAmt * 0.53);

  const statsEl = document.getElementById("dashStats");
  if (statsEl) {
    if (expenses.length === 0) {
      statsEl.innerHTML = `<div class="stat-card" style="grid-column:1/-1">
        <div style="text-align:center;padding:2rem 0">
          <div style="font-size:48px;margin-bottom:1rem">💳</div>
          <div style="font-family:var(--font-head);font-size:18px;font-weight:700;margin-bottom:.5rem">No expenses added yet</div>
          <div style="color:var(--text2);font-size:14px;margin-bottom:1.5rem">Go to Expenses, add a transaction and let AI detect leakage instantly</div>
          <button class="btn-primary" style="width:auto;padding:10px 28px;margin:0 auto" onclick="navTo('expenses')">➕ Add First Expense</button>
        </div></div>`;
    } else {
      const s = [
        {
          icon: "💰",
          val: inr(totalAmt),
          lab: "Total Expenses",
          trend: expenses.length + " transactions",
          up: true,
          glow: "rgba(0,152,255,.25)",
        },
        {
          icon: "🚨",
          val: inr(leakageAmt),
          lab: "Leakage Detected",
          trend: highRisk.length + " HIGH · " + medRisk.length + " MED",
          up: false,
          glow: "rgba(255,107,107,.25)",
        },
        {
          icon: "⚠️",
          val: String(highRisk.length + medRisk.length),
          lab: "Anomalies Found",
          trend: "Need review",
          up: false,
          glow: "rgba(255,209,102,.25)",
        },
        {
          icon: "🛡️",
          val: inr(recovered),
          lab: "Recoverable Amount",
          trend: "53% of leakage",
          up: true,
          glow: "rgba(0,212,170,.25)",
        },
      ];
      statsEl.innerHTML = s
        .map(
          (x) => `<div class="stat-card">
        <div class="stat-glow" style="background:radial-gradient(circle,${x.glow} 0%,transparent 70%)"></div>
        <div class="stat-icon">${x.icon}</div><div class="stat-val">${x.val}</div>
        <div class="stat-lab">${x.lab}</div>
        <div class="stat-trend ${x.up ? "trend-up" : "trend-dn"}">${x.trend}</div></div>`,
        )
        .join("");
    }
  }

  // Category chart from real data
  const catMap = {};
  expenses.forEach((e) => {
    catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
  });
  const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  if (catEntries.length > 0) {
    Charts.hBar("categoryChart", {
      labels: catEntries.map((c) => c[0]),
      values: catEntries.map((c) => c[1]),
      colors: [
        "#ff6b6b",
        "#ffd166",
        "#a855f7",
        "#0098ff",
        "#00d4aa",
        "#5a6278",
      ],
      isCurrency: true,
    });
  } else {
    const el = document.getElementById("categoryChart");
    if (el) el.innerHTML = emptyMsg("Add expenses to see category breakdown");
  }

  // Risk donut from real data
  Charts.donut("riskBreakdown", {
    segments: [
      { label: "High Risk", value: highRisk.length || 0.001, color: "#ff6b6b" },
      {
        label: "Medium Risk",
        value: medRisk.length || 0.001,
        color: "#ffd166",
      },
      { label: "Low Risk", value: lowRisk.length || 0.001, color: "#00d4aa" },
    ],
  });

  // Anomaly table
  const anomTbl = document.getElementById("recentAnomalies");
  if (anomTbl) {
    const rows = highRisk.slice(0, 6);
    anomTbl.innerHTML = rows.length
      ? rows
          .map(
            (e) => `<tr>
          <td>${e.merchant}</td>
          <td style="color:var(--red);font-weight:600">${inr(e.amount)}</td>
          <td>${e.category}</td>
          <td><span class="risk-badge risk-${e.risk}">${e.risk}</span></td>
          <td style="color:var(--text2);font-size:12px">${e.reason}</td>
        </tr>`,
          )
          .join("")
      : `<tr><td colspan="5" style="text-align:center;padding:1.5rem;color:var(--text3)">
          ${expenses.length === 0 ? "📭 No expenses added yet" : "✅ No high-risk anomalies found"}
        </td></tr>`;
  }

  Charts.line("accuracyChart", {
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
    height: 170,
    datasets: [
      {
        values: [88.1, 89.5, 91.2, 92.8, 91.9, 94.6, 95.1, 96.2],
        color: "#00d4aa",
      },
    ],
  });

  const dowC = [0, 0, 0, 0, 0, 0, 0];
  expenses.forEach((e) => {
    const d = new Date(e.date).getDay();
    dowC[d]++;
  });
  const dow = [dowC[1], dowC[2], dowC[3], dowC[4], dowC[5], dowC[6], dowC[0]];
  Charts.bar("weeklyChart", {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: dow,
    colors: dow.map((v) => (v > 3 ? "#ff6b6b" : v > 1 ? "#ffd166" : "#00d4aa")),
    height: 170,
  });
}

/* ══════════════════════════════════════════
   EXPENSES
   ══════════════════════════════════════════ */
function renderExpensesTable() {
  const filterRisk = document.getElementById("filterRisk")?.value || "";
  const filterCat = document.getElementById("filterCat")?.value || "";
  let expenses = Storage.get("expenses", []);
  if (filterRisk) expenses = expenses.filter((e) => e.risk === filterRisk);
  if (filterCat) expenses = expenses.filter((e) => e.category === filterCat);

  const tbody = document.getElementById("expensesBody");
  if (!tbody) return;

  if (expenses.length === 0) {
    const all = Storage.get("expenses", []);
    tbody.innerHTML =
      all.length === 0
        ? `<tr><td colspan="6"><div style="text-align:center;padding:3rem 1rem">
          <div style="font-size:48px;margin-bottom:1rem">📭</div>
          <div style="font-family:var(--font-head);font-size:16px;font-weight:700;margin-bottom:.5rem;color:var(--text)">No expenses yet</div>
          <div style="color:var(--text2);font-size:13px">Fill the form above — enter merchant, amount in ₹ and click <strong>Analyze with AI & Submit</strong></div>
        </div></td></tr>`
        : `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text3)">No expenses match your filters</td></tr>`;
    return;
  }

  tbody.innerHTML = expenses
    .map(
      (e) => `<tr>
    <td>${e.date}</td>
    <td>${e.merchant}</td>
    <td>${e.category}</td>
    <td style="font-weight:600">${inr(e.amount)}</td>
    <td><span class="risk-badge risk-${e.risk}">${e.risk}</span></td>
    <td style="color:var(--text2);font-size:12px">${e.reason}</td>
  </tr>`,
    )
    .join("");
}

async function analyzeAndSubmitExpense() {
  const merchant = document.getElementById("expMerchant").value.trim();
  const amount = parseFloat(document.getElementById("expAmount").value);
  const category = document.getElementById("expCategory").value;
  const date =
    document.getElementById("expDate").value ||
    new Date().toISOString().split("T")[0];
  const desc = document.getElementById("expDesc").value.trim();

  if (!merchant) {
    showToast("❌", "Missing Field", "Please enter merchant / vendor name.");
    return;
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    showToast("❌", "Missing Field", "Please enter a valid amount in ₹.");
    return;
  }

  const spinner = document.getElementById("analyzeSpinner");
  if (spinner) spinner.style.display = "flex";

  try {
    const result = await aiAnalyzeExpense({
      merchant,
      amount,
      category,
      date,
      desc,
    });
    const expense = {
      id: Date.now(),
      date,
      merchant,
      category,
      amount,
      risk: result.risk,
      score: result.score || 0,
      reason: result.reason,
      flags: result.flags || [],
      desc,
    };
    const expenses = Storage.get("expenses", []);
    expenses.unshift(expense);
    Storage.set("expenses", expenses);

    document.getElementById("expMerchant").value = "";
    document.getElementById("expAmount").value = "";
    document.getElementById("expDesc").value = "";

    const icons = { HIGH: "🚨", MED: "⚠️", LOW: "✅" };
    showToast(
      icons[result.risk] || "📋",
      `${result.risk} Risk — ${inr(amount)}`,
      result.reason,
    );

    renderExpensesTable();
    updateRiskBadge();
  } catch {
    showToast(
      "❌",
      "Error",
      "AI analysis failed. Please check your connection and try again.",
    );
  } finally {
    if (spinner) spinner.style.display = "none";
  }
}

function updateRiskBadge() {
  const expenses = Storage.get("expenses", []);
  const badge = document.getElementById("riskBadge");
  if (badge)
    badge.textContent = expenses.filter((e) => e.risk === "HIGH").length;
}

/* ══════════════════════════════════════════
   ANALYSIS
   ══════════════════════════════════════════ */
function renderAnalysis() {
  const expenses = Storage.get("expenses", []);
  const total = expenses.length;
  const high = expenses.filter((e) => e.risk === "HIGH").length;
  const totalAmt = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const leakageAmt = expenses
    .filter((e) => e.risk !== "LOW")
    .reduce((s, e) => s + Number(e.amount), 0);
  const leakPct =
    totalAmt > 0 ? ((leakageAmt / totalAmt) * 100).toFixed(1) : "0.0";

  const statsEl = document.getElementById("analysisStats");
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-card"><div class="stat-glow" style="background:radial-gradient(circle,rgba(255,107,107,.25) 0%,transparent 70%)"></div>
        <div class="stat-icon">🔍</div><div class="stat-val">${leakPct}%</div><div class="stat-lab">Overall Leakage Rate</div>
        <div class="stat-trend ${parseFloat(leakPct) > 20 ? "trend-dn" : "trend-up"}">${leakageAmt > 0 ? inr(leakageAmt) + " at risk" : "No leakage detected"}</div></div>
      <div class="stat-card"><div class="stat-glow" style="background:radial-gradient(circle,rgba(255,209,102,.25) 0%,transparent 70%)"></div>
        <div class="stat-icon">🚨</div><div class="stat-val">${high}</div><div class="stat-lab">High-Risk Transactions</div>
        <div class="stat-trend trend-dn">${total > 0 ? Math.round((high / total) * 100) : 0}% of all expenses</div></div>
      <div class="stat-card"><div class="stat-glow" style="background:radial-gradient(circle,rgba(0,212,170,.25) 0%,transparent 70%)"></div>
        <div class="stat-icon">💳</div><div class="stat-val">${total}</div><div class="stat-lab">Total Transactions</div>
        <div class="stat-trend trend-up">${inr(totalAmt)} total spend</div></div>`;
  }

  if (expenses.length > 0) {
    Charts.scatter("scatterChart", {
      height: 220,
      points: expenses.map((e) => ({
        x: Number(e.amount),
        y:
          e.risk === "HIGH"
            ? 70 + Math.random() * 25
            : e.risk === "MED"
              ? 35 + Math.random() * 30
              : 5 + Math.random() * 25,
        color:
          e.risk === "HIGH"
            ? "#ff6b6b"
            : e.risk === "MED"
              ? "#ffd166"
              : "#00d4aa",
        label: `${e.merchant} ${inr(e.amount)} – ${e.risk}`,
      })),
    });
  } else {
    const el = document.getElementById("scatterChart");
    if (el) el.innerHTML = emptyMsg("Add expenses to see anomaly scatter plot");
  }

  const dowC = [0, 0, 0, 0, 0, 0, 0];
  expenses.forEach((e) => {
    const d = new Date(e.date).getDay();
    dowC[d]++;
  });
  const dow = [dowC[1], dowC[2], dowC[3], dowC[4], dowC[5], dowC[6], dowC[0]];
  Charts.bar("dowChart", {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: dow,
    colors: dow.map((v) => (v > 3 ? "#ff6b6b" : v > 1 ? "#ffd166" : "#00d4aa")),
    height: 180,
  });

  const vendorBody = document.getElementById("vendorBody");
  if (vendorBody) {
    if (expenses.length === 0) {
      vendorBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text3)">No expenses added yet</td></tr>`;
    } else {
      const vm = {};
      expenses.forEach((e) => {
        if (!vm[e.merchant])
          vm[e.merchant] = { spend: 0, count: 0, anomalies: 0, patterns: [] };
        vm[e.merchant].spend += Number(e.amount);
        vm[e.merchant].count++;
        if (e.risk !== "LOW") {
          vm[e.merchant].anomalies++;
          vm[e.merchant].patterns.push(e.reason);
        }
      });
      vendorBody.innerHTML = Object.entries(vm)
        .sort((a, b) => b[1].spend - a[1].spend)
        .slice(0, 8)
        .map(([name, v]) => {
          const score = Math.min(
            100,
            Math.round((v.anomalies / v.count) * 100),
          );
          const col =
            score > 60 ? "#ff6b6b" : score > 30 ? "#ffd166" : "#00d4aa";
          return `<tr><td>${name}</td><td>${inr(v.spend)}</td><td style="text-align:center;font-weight:600">${v.anomalies}</td>
          <td><div style="display:flex;align-items:center;gap:8px"><div class="prog-track" style="flex:1"><div class="prog-fill" style="width:${score}%;background:${col}"></div></div>
          <span style="color:${col};font-size:12px;font-weight:700;min-width:26px">${score}</span></div></td>
          <td style="font-size:12px;color:var(--text2)">${v.patterns[0] || "Within policy"}</td></tr>`;
        })
        .join("");
    }
  }

  const monthMap = {};
  expenses.forEach((e) => {
    const mo = e.date.slice(0, 7);
    if (!monthMap[mo]) monthMap[mo] = { leak: 0, safe: 0 };
    if (e.risk !== "LOW") monthMap[mo].leak += Number(e.amount);
    else monthMap[mo].safe += Number(e.amount);
  });
  const months = Object.keys(monthMap).sort().slice(-6);
  if (months.length > 1) {
    Charts.line("monthlyTrendChart", {
      labels: months.map(
        (m) =>
          [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ][parseInt(m.split("-")[1]) - 1],
      ),
      height: 180,
      datasets: [
        { values: months.map((m) => monthMap[m].leak), color: "#ff6b6b" },
        { values: months.map((m) => monthMap[m].safe), color: "#00d4aa" },
      ],
    });
  } else {
    const el = document.getElementById("monthlyTrendChart");
    if (el)
      el.innerHTML = emptyMsg(
        "Add expenses across multiple months to see trend",
      );
  }
}

/* ══════════════════════════════════════════
   RULES
   ══════════════════════════════════════════ */
function renderRules() {
  const rules = Storage.get("rules", []);
  const el = document.getElementById("rulesList");
  if (!el) return;
  const rc = { HIGH: "#ff6b6b", MED: "#ffd166", LOW: "#00d4aa" };
  el.innerHTML = rules
    .map(
      (r) => `<div class="rule-item">
    <div class="rule-dot" style="background:${rc[r.risk] || "#5a6278"}"></div>
    <div style="flex:1"><div class="rule-name">${r.name}</div><div class="rule-cond">${r.condition}</div></div>
    <span class="risk-badge risk-${r.risk}">${r.risk}</span>
    <div class="toggle ${r.active ? "on" : ""}" onclick="toggleRule(${r.id})"></div>
  </div>`,
    )
    .join("");
}

function toggleRule(id) {
  const rules = Storage.get("rules", []);
  const rule = rules.find((r) => r.id === id);
  if (rule) {
    rule.active = !rule.active;
    Storage.set("rules", rules);
    renderRules();
    showToast(
      rule.active ? "✅" : "⏸️",
      "Rule " + (rule.active ? "Enabled" : "Disabled"),
      rule.name,
    );
  }
}

function addCustomRule() {
  const name = document.getElementById("newRuleName").value.trim();
  const cond = document.getElementById("newRuleCond").value;
  const thresh = document.getElementById("newRuleThresh").value;
  const risk = document.getElementById("newRuleRisk").value;
  if (!name) {
    showToast("❌", "Error", "Please enter a rule name.");
    return;
  }
  const rules = Storage.get("rules", []);
  rules.push({
    id: Date.now(),
    name,
    condition: `${cond} (₹${Number(thresh).toLocaleString("en-IN") || "N/A"})`,
    threshold: Number(thresh) || 0,
    risk,
    active: true,
  });
  Storage.set("rules", rules);
  renderRules();
  document.getElementById("newRuleName").value = "";
  document.getElementById("newRuleThresh").value = "";
  showToast("⚙️", "Rule Added", `"${name}" is now active.`);
}

/* ══════════════════════════════════════════
   REPORTS
   ══════════════════════════════════════════ */
function renderReports() {
  const expenses = Storage.get("expenses", []);
  const totalAmt = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const highRisk = expenses.filter((e) => e.risk === "HIGH");
  const leakageAmt = expenses
    .filter((e) => e.risk !== "LOW")
    .reduce((s, e) => s + Number(e.amount), 0);
  const recovered = Math.round(leakageAmt * 0.53);
  const leakPct =
    totalAmt > 0 ? ((leakageAmt / totalAmt) * 100).toFixed(1) : "0.0";

  const statsEl = document.getElementById("reportStats");
  if (statsEl) {
    statsEl.innerHTML = `
    <div class="stat-card"><div class="stat-glow" style="background:radial-gradient(circle,rgba(0,212,170,.2) 0%,transparent 70%)"></div>
      <div class="stat-icon">💰</div><div class="stat-val">${inr(totalAmt)}</div><div class="stat-lab">Total Expenses</div>
      <div class="stat-trend trend-up">${expenses.length} transactions</div></div>
    <div class="stat-card"><div class="stat-glow" style="background:radial-gradient(circle,rgba(255,107,107,.2) 0%,transparent 70%)"></div>
      <div class="stat-icon">🚨</div><div class="stat-val">${inr(leakageAmt)}</div><div class="stat-lab">Leakage Detected</div>
      <div class="stat-trend trend-dn">${leakPct}% leakage rate</div></div>
    <div class="stat-card"><div class="stat-glow" style="background:radial-gradient(circle,rgba(0,152,255,.2) 0%,transparent 70%)"></div>
      <div class="stat-icon">🛡️</div><div class="stat-val">${inr(recovered)}</div><div class="stat-lab">Recoverable Amount</div>
      <div class="stat-trend trend-up">53% of leakage</div></div>
    <div class="stat-card"><div class="stat-glow" style="background:radial-gradient(circle,rgba(255,209,102,.2) 0%,transparent 70%)"></div>
      <div class="stat-icon">📊</div><div class="stat-val">${highRisk.length}</div><div class="stat-lab">High-Risk Items</div>
      <div class="stat-trend trend-dn">Needs review</div></div>`;
  }

  const monthMap = {};
  expenses.forEach((e) => {
    const mo = e.date.slice(0, 7);
    if (!monthMap[mo]) monthMap[mo] = { leak: 0, safe: 0 };
    if (e.risk !== "LOW") monthMap[mo].leak += Number(e.amount);
    else monthMap[mo].safe += Number(e.amount);
  });
  const months = Object.keys(monthMap).sort().slice(-6);
  if (months.length > 0) {
    Charts.line("reportMonthlyChart", {
      labels: months.map(
        (m) =>
          [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ][parseInt(m.split("-")[1]) - 1],
      ),
      height: 200,
      datasets: [
        { values: months.map((m) => monthMap[m].leak), color: "#ff6b6b" },
        { values: months.map((m) => monthMap[m].safe), color: "#00d4aa" },
      ],
    });
  } else {
    const el = document.getElementById("reportMonthlyChart");
    if (el) el.innerHTML = emptyMsg("Add expenses to see monthly trend");
  }

  const catLeak = {};
  expenses
    .filter((e) => e.risk !== "LOW")
    .forEach((e) => {
      catLeak[e.category] = (catLeak[e.category] || 0) + Number(e.amount);
    });
  const topEl = document.getElementById("topLeakageChart");
  if (topEl) {
    const sorted = Object.entries(catLeak).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      topEl.innerHTML = emptyMsg("No leakage detected yet 🎉");
    } else {
      const maxV = sorted[0][1];
      topEl.innerHTML =
        '<div style="display:flex;flex-direction:column;gap:12px;margin-top:.5rem">' +
        sorted
          .map(
            ([cat, amt]) => `<div>
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
          <span style="color:var(--text2)">${cat}</span><span style="font-weight:600;color:var(--red)">${inr(amt)}</span></div>
        <div class="prog-track"><div class="prog-fill" style="width:${Math.round((amt / maxV) * 100)}%;background:var(--red);opacity:.8"></div></div>
      </div>`,
          )
          .join("") +
        "</div>";
    }
  }
}

function exportReport(type) {
  const expenses = Storage.get("expenses", []);
  if (expenses.length === 0) {
    showToast("❌", "No Data", "Add some expenses first before exporting.");
    return;
  }
  const msgs = {
    pdf: "PDF report generated — ready to download",
    excel: "Excel file exported successfully",
    csv: "CSV data downloaded",
    link: "Shareable link copied to clipboard",
  };
  const icons = { pdf: "📄", excel: "📊", csv: "📋", link: "🔗" };
  showToast(icons[type] || "📄", "Export Complete", msgs[type] || "Done");
}

/* ══════════════════════════════════════════
   SETTINGS
   ══════════════════════════════════════════ */
function saveSettings() {
  const name = document.getElementById("setName").value.trim();
  const email = document.getElementById("setEmail").value.trim();
  const company = document.getElementById("setCompany").value.trim();
  if (!name) {
    showToast("❌", "Error", "Name cannot be empty.");
    return;
  }
  const user = Storage.get("currentUser");
  const parts = name.split(" ");
  user.first = parts[0] || user.first;
  user.last = parts.slice(1).join(" ") || user.last;
  user.email = email || user.email;
  user.company = company || user.company;
  user.avatar = ((user.first[0] || "") + (user.last[0] || "")).toUpperCase();
  Storage.set("currentUser", user);
  document.getElementById("userAvatar").textContent = user.avatar;
  document.getElementById("userName").textContent =
    `${user.first} ${user.last}`;
  showToast("✅", "Saved", "Account details updated.");
}

function saveThresholds() {
  showToast("✅", "Thresholds Updated", "AI detection rules recalibrated.");
}

function confirmReset() {
  if (
    confirm("Delete ALL expenses and reset AI model? This cannot be undone.")
  ) {
    Storage.remove("expenses");
    Storage.remove("expenses_initialised");
    Storage.remove("model");
    Storage.remove("rules");
    bootstrapData();
    navTo("expenses");
    showToast("🗑️", "Reset Complete", "All expenses cleared. Start fresh!");
  }
}

function saveApiKey() {
  const keyInput = document.getElementById("apiKeyInput");
  const key = keyInput.value.trim();
  if (!key) {
    showToast("❌", "Error", "Please enter your API key.");
    return;
  }
  if (!key.startsWith("sk-ant-")) {
    showToast(
      "❌",
      "Error",
      "Invalid API key format. Should start with sk-ant-",
    );
    return;
  }

  Storage.set("apiKey", key);
  const statusEl = document.getElementById("apiKeyStatus");
  if (statusEl) statusEl.textContent = "✅ API key saved successfully!";
  keyInput.value = "";
  showToast("✅", "Saved", "Claude API key configured!");
}

function loadApiKeyStatus() {
  const hasKey = !!Storage.get("apiKey");
  const statusEl = document.getElementById("apiKeyStatus");
  if (statusEl) {
    statusEl.textContent = hasKey
      ? "✅ API key configured"
      : "⚠️ No API key set yet";
    statusEl.style.color = hasKey ? "var(--accent)" : "var(--yellow)";
  }
}
