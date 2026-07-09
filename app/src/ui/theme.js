import { toast } from './toast.js';

export function applyTheme(dark) {
  document.querySelector('.phone').classList.toggle('dark', dark);
  const b = document.getElementById('themeBtn'); if (b) b.textContent = dark ? '☀️' : '🌙';
}

export function toggleTheme() {
  const dark = !document.querySelector('.phone').classList.contains('dark');
  applyTheme(dark);
  try { localStorage.setItem('patidostTheme', dark ? '1' : '0'); } catch (e) {}
  toast(dark ? '🌙 Karanlık tema açıldı' : '☀️ Aydınlık tema açıldı');
}

try { applyTheme(localStorage.getItem('patidostTheme') === '1'); } catch (e) {}
