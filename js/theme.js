const STORAGE_KEY = "theme";

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* localStorage unavailable (private mode, etc.) */
  }
}

function currentTheme() {
  const explicit = document.documentElement.getAttribute("data-theme");
  if (explicit) return explicit;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(value) {
  document.documentElement.setAttribute("data-theme", value);
  setStoredTheme(value);
  updateToggleLabel(value);
}

function updateToggleLabel(value) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const isDark = value === "dark";
  btn.setAttribute("aria-pressed", String(isDark));
  btn.textContent = isDark ? "☀️" : "🌙";
  btn.setAttribute("aria-label", isDark ? "라이트 모드로 전환" : "다크 모드로 전환");
}

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  updateToggleLabel(currentTheme());
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initThemeToggle);
} else {
  initThemeToggle();
}
