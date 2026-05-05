/* =========================================================
   LeakLens — Auth Logic
   ========================================================= */

function switchPanel(panel) {
  document
    .querySelectorAll(".auth-panel")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById(panel + "Panel").classList.add("active");
  clearErrors();
}

function clearErrors() {
  ["loginError", "registerError"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = "none";
      el.textContent = "";
    }
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.style.display = "block";
  }
}

function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;
  clearErrors();

  if (!email || !pass) {
    showError("loginError", "Please enter your email and password.");
    return;
  }

  const users = Storage.get("users", []);
  const user = users.find((u) => u.email === email && u.password === pass);

  if (!user) {
    showError("loginError", "Invalid email or password.");
    return;
  }

  Storage.set("currentUser", user);
  window.location.href = "dashboard.html";
}

function handleRegister() {
  const first = document.getElementById("regFirst").value.trim();
  const last = document.getElementById("regLast").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const company = document.getElementById("regCompany").value.trim();
  const pass = document.getElementById("regPass").value;
  const passConf = document.getElementById("regPassConf").value;
  clearErrors();

  if (!first || !last || !email || !company || !pass) {
    showError("registerError", "Please fill in all fields.");
    return;
  }
  if (pass.length < 8) {
    showError("registerError", "Password must be at least 8 characters.");
    return;
  }
  if (pass !== passConf) {
    showError("registerError", "Passwords do not match.");
    return;
  }

  const users = Storage.get("users", []);
  if (users.find((u) => u.email === email)) {
    showError("registerError", "An account with this email already exists.");
    return;
  }

  const avatar = (first[0] + last[0]).toUpperCase();
  const user = {
    id: Date.now(),
    first,
    last,
    email,
    company,
    password: pass,
    avatar,
    role: "Finance Admin",
  };
  users.push(user);
  Storage.set("users", users);
  Storage.set("currentUser", user);
  window.location.href = "dashboard.html";
}

/* Enter key support */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const loginActive = document
    .getElementById("loginPanel")
    ?.classList.contains("active");
  if (loginActive) handleLogin();
  else handleRegister();
});
