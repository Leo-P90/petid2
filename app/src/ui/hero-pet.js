import { petData, appState, el } from '../state/store.js';
import { CAT, DOG, CAT_WALK, DOG_WALK, PALS } from '../data/sprites.js';
import { drawSpr } from '../game/draw.js';

/* --- PETID ana ekran: küçük yürüyen dost + büyük silik "yalvaran" dost --- */
let hBob = 0, hBlink = false, hX = 230, hTgt = 90, hDir = -1, hMode = 'walk', hWait = 10, hTick = 0, bWave = false, bBlink = false;

export function drawHeroPet() {
  const cv = el('hCanvas'); if (!cv) return;
  const p = petData[appState.curPet], pal = PALS[p.renk] || PALS.gri;
  cv.width = 48; cv.height = 51;
  const yuru = (hMode === 'walk');
  const spr = yuru ? (p.tur === 'kedi' ? CAT_WALK : DOG_WALK)[hBob ? 1 : 0] : (p.tur === 'kedi' ? CAT : DOG);
  drawSpr(cv.getContext('2d'), spr, pal, 1.5, 0, (!yuru && hBob) ? 3 : 0, yuru && hDir < 0, hBlink);
}

/* büyük silik "yardım ister ama mutlu" pixel dost */
export function drawBigPet() {
  const cv = el('bigPet'); if (!cv) return;
  const p = petData[appState.curPet], pal = PALS[p.renk] || PALS.gri, S = 11;
  cv.width = 16 * S; cv.height = 17 * S;
  const ctx = cv.getContext('2d'), oy = bWave ? S : 0;
  drawSpr(ctx, p.tur === 'kedi' ? CAT : DOG, pal, S / 2, 0, oy, false, bBlink);
  const ey = p.tur === 'kedi' ? 5 : 4;
  if (!bBlink) { /* kocaman yalvaran gözler + ışıltı */
    ctx.fillStyle = '#20242B';
    ctx.fillRect(4 * S, ey * S + oy, 2 * S, 2 * S);
    ctx.fillRect(10 * S, ey * S + oy, 2 * S, 2 * S);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4 * S + 3, ey * S + oy + 3, S * .62, S * .62);
    ctx.fillRect(10 * S + 3, ey * S + oy + 3, S * .62, S * .62);
    ctx.fillRect(5 * S, ey * S + oy + S, S * .35, S * .35);
    ctx.fillRect(11 * S, ey * S + oy + S, S * .35, S * .35);
  }
  if (p.tur === 'kedi') { /* gülümseme */
    ctx.fillStyle = '#E0787D'; ctx.fillRect(6 * S, 7 * S + oy + S * .45, 4 * S, S * .6);
  }
  /* sallanan pati (gövde zıplar, pati sabit kalır → el sallama) */
  ctx.fillStyle = pal.o; ctx.fillRect(0, 8 * S - 2, 2 * S, 2 * S + 4);
  ctx.fillStyle = pal.b; ctx.fillRect(2, 8 * S, 2 * S - 4, 2 * S);
  ctx.fillStyle = pal.l; ctx.fillRect(S * .4, 8 * S + S * .4, S * 1.2, S * 1.2);
}

setInterval(() => {
  hTick++;
  const cv = el('hCanvas');
  if (cv) {
    const W = (cv.parentElement ? cv.parentElement.clientWidth : 320) - 54;
    if (hMode === 'walk') {
      hBob = 1 - hBob; hX += hDir * 3;
      if ((hDir < 0 && hX <= hTgt) || (hDir > 0 && hX >= hTgt) || hX < 6 || hX > W) {
        hX = Math.max(6, Math.min(W, hX)); hMode = 'sit'; hWait = 10 + Math.random() * 26;
      }
    } else {
      if (hTick % 5 === 0) hBob = 1 - hBob;
      if (--hWait <= 0) { hTgt = 6 + Math.random() * (W - 12); hDir = hX < hTgt ? 1 : -1; hMode = 'walk'; }
    }
    hBlink = Math.random() < .1;
    cv.style.left = hX + 'px';
    drawHeroPet();
  }
  if (hTick % 5 === 0) { bWave = !bWave; bBlink = Math.random() < .18; drawBigPet(); }
}, 130);

export function heroPetTap() {
  const cv = el('hCanvas'); cv.classList.remove('jump'); void cv.offsetWidth; cv.classList.add('jump');
  hMode = 'sit'; hWait = 18;
  const msgs = petData[appState.curPet].tur === 'kedi'
    ? ['Miyav! 🐾', 'Mırrr... bana bir soru sor!', 'Bugün oyun var mı? 🔴', 'Aşağıya yazabilirsin 👇']
    : ['Hav hav! 🐾', 'Kuyruğum seni görünce sallandı!', 'Yürüyüşe çıkalım mı? 🦮', 'Aşağıya yazabilirsin 👇'];
  const b = el('hBub'); b.textContent = msgs[Math.floor(Math.random() * msgs.length)];
  b.style.left = Math.max(4, Math.min(hX - 40, 240)) + 'px'; b.style.right = 'auto';
  b.classList.add('show'); clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), 2200);
}
