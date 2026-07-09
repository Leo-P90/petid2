import { el } from '../state/store.js';

export function toast(t) {
  const e = el('appToast'); if (!e) return;
  e.textContent = t; e.classList.add('show');
  clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('show'), 2600);
}
