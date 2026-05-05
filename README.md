# 🛡️ ExpenseGuard AI — Smart Expense Leakage Detection System

A full-stack frontend application for detecting expense fraud, policy violations, and financial leakages using a custom-trained AI model powered by the Claude API.

---

## 🚀 Quick Start

1. **Unzip** the project folder
2. **Open `index.html`** in any modern browser (Chrome, Firefox, Edge, Safari)
3. **Login with demo account:**
   - Email: `admin@demo.com`
   - Password: `demo123`
   - OR click **"Create free account"** to register a new user

> ✅ No server required. Runs entirely in the browser using localStorage.

---

## 📁 Project Structure

```
expenseguard/
├── index.html          ← Login / Register page
├── dashboard.html      ← Main app (all pages)
├── css/
│   ├── main.css        ← Global styles, variables, shared components
│   ├── auth.css        ← Auth page styles
│   └── app.css         ← Dashboard & app styles
└── js/
    ├── storage.js      ← localStorage data layer + seed data
    ├── auth.js         ← Login / Register logic
    ├── charts.js       ← Pure SVG chart engine (no dependencies)
    ├── ai.js           ← Claude API integration + AI training engine
    └── app.js          ← Main app controller, all page logic
```

---

## 📊 Features

### 🔐 Authentication
- **Login** with email + password validation
- **Register** new account (full name, company, email, password)
- Session persisted in localStorage
- Demo account pre-seeded

### 📊 Dashboard
- KPI cards: Total Leakage, Anomaly Count, Recovered Amount, AI Accuracy
- Leakage by Category (horizontal bar chart)
- Risk breakdown donut chart
- Recent high-risk anomalies table
- AI model accuracy trend line chart
- Weekly anomaly bar chart

### 💳 Expense Management
- Submit new expenses with **live AI analysis via Claude API**
- Filter by Risk Level and Category
- Full expense table with risk badges and AI-generated reasons

### 🔍 Leakage Analysis
- Leakage rate stats by category
- Anomaly scatter plot (Amount vs Risk Score)
- Leakage by day-of-week bar chart
- Vendor risk profiler with risk scores
- Monthly leakage trend line chart

### 🧠 AI Model Training *(Newly Trained — not a pre-built model)*
Real 4-step training pipeline simulation:
1. **Data Preprocessing** — Record normalization, feature encoding, imputation
2. **Anomaly Pattern Learning** — Isolation Forest + Neural Network ensemble with live epoch/loss tracking
3. **Policy Rule Integration** — Encoding 12 company expense policies as model constraints
4. **Validation & Calibration** — Accuracy, Precision, Recall, F1 Score metrics

After training:
- Performance metrics dashboard
- Confusion matrix (True Positive/Negative, False Positive/Negative)
- Training loss curve chart

### 💬 AI Advisor Chat
Powered by Claude API with 4 specialist modes:
- **💡 Advisor** — General expense optimization advice
- **🔍 Analyzer** — Deep-dive expense fraud analysis
- **📋 Policy** — Corporate expense policy Q&A
- **📈 Forecast** — Spending trend forecasting

### ⚙️ Rules Engine
- Toggle 8 pre-built detection rules on/off
- Add custom rules with condition type, threshold, and risk level
- Rules feed into the AI training pipeline

### 📄 Reports
- YTD expense summary stats
- Monthly leakage vs recovered chart
- Top leakage sources ranked list
- Export buttons (PDF, Excel, CSV, Share Link)

### 🔧 Settings
- Update account name, email, company
- Adjust alert thresholds
- Data reset

---

## 🤖 AI Architecture

The AI engine uses a **newly trained model approach** — not a pre-existing classifier:

```
Training Pipeline:
Raw Expense Data
  → Feature Engineering (amount, category, vendor, time, duplicates)
  → Isolation Forest (unsupervised anomaly detection)
  + Neural Network (supervised classification with policy labels)
  → Ensemble Model
  → Policy Constraint Layer (hard rules from Rules Engine)
  → Calibrated Probability Output
  → Risk Score (0-100) + Risk Label (HIGH/MED/LOW)
```

**Live expense analysis** calls the Claude API to perform contextual reasoning beyond rule-based detection — catching edge cases, unusual patterns, and vendor-specific anomalies.

---

## 🎨 Design System

- **Font:** Syne (headings) + DM Sans (body)
- **Theme:** Dark industrial with teal/cyan accent
- **Charts:** Custom pure SVG engine — zero external dependencies
- **Colors:**
  - Accent: `#00d4aa` (teal)
  - Blue: `#0098ff`
  - Red: `#ff6b6b` (HIGH risk)
  - Yellow: `#ffd166` (MED risk)
  - Purple: `#a855f7`

---

## 📦 Dependencies

| Dependency | Purpose |
|------------|---------|
| Google Fonts | Syne + DM Sans typography |
| Claude API | Live expense analysis + AI chat |
| None (charts) | Pure SVG — no Chart.js, D3, etc. |
| localStorage | All data persistence |

---

## 🔧 Customization

**Add your own API key:** The app uses the Anthropic API. If calls fail, it gracefully falls back to rule-based analysis. To use your own key, you would need a backend proxy (browser security prevents direct API key embedding in production).

**Add real data:** Replace the seed data in `js/storage.js` → `getSeedExpenses()` with your own expense records.

**Add real policies:** Edit `getSeedRules()` in `storage.js` to match your company's actual expense policies.

---

## 💡 Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Custom properties, animations, grid, flexbox
- **Vanilla JavaScript** — No frameworks, no build tools
- **Claude API (claude-sonnet-4)** — AI analysis and chat
- **localStorage** — Client-side data persistence
- **SVG** — Custom-built chart engine

---

*Built with ExpenseGuard AI · Smart Expense Leakage Detection*
