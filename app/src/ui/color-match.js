import { PALS } from '../data/sprites.js';

function hexToRgb(hex) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

/* fotoğrafın orta bölgesinden (kenar/arkaplan etkisini azaltmak için) ortalama renk okur */
function avgColor(ctx, w, h) {
  const x0 = Math.round(w * .2), y0 = Math.round(h * .15), rw = Math.round(w * .6), rh = Math.round(h * .6);
  const data = ctx.getImageData(x0, y0, Math.max(1, rw), Math.max(1, rh)).data;
  let r = 0, g = 0, b = 0, n = 0;
  for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
  return n ? [r / n, g / n, b / n] : [150, 150, 150];
}

/* ortalama rengi PALS paletlerinden en yakınına (gövde rengi 'b' referans alınarak) eşler */
export function detectPetColor(ctx, w, h) {
  const [r, g, b] = avgColor(ctx, w, h);
  let best = 'gri', bestD = Infinity;
  for (const key in PALS) {
    const [pr, pg, pb] = hexToRgb(PALS[key].b);
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
    if (d < bestD) { bestD = d; best = key; }
  }
  return best;
}
