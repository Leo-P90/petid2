import { toast } from "./toast.js";

export function applyTheme(dark) {
  document.querySelector(".phone").classList.toggle("dark", dark);
  document
    .querySelectorAll(".theme-btn")
    .forEach((b) => (b.textContent = dark ? "☀️" : "🌙"));
}

export function toggleTheme() {
  const dark = !document.querySelector(".phone").classList.contains("dark");
  applyTheme(dark);
  try {
    localStorage.setItem("patidostTheme", dark ? "1" : "0");
  } catch (e) {}
  toast(dark ? "🌙 Karanlık tema açıldı" : "☀️ Aydınlık tema açıldı");
}

export function initTheme() {
  document.querySelectorAll(".screen").forEach((screen) => {
    if (screen.querySelector(".theme-btn")) return;
    const b = document.createElement("button");
    b.className = "theme-btn screen-theme-btn";
    b.setAttribute("aria-label", "Temayı değiştir");
    b.addEventListener("click", toggleTheme);
    screen.prepend(b);
    screen.classList.add("has-theme-button");
  });
  try {
    applyTheme(localStorage.getItem("patidostTheme") === "1");
  } catch {}
}
