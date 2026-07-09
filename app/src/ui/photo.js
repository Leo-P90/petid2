import { petData, appState } from '../state/store.js';
import { DEFAULT_FOTO } from '../data/default-photos.js';

/* profil düzenleme modalında seçilen ama henüz kaydedilmemiş fotoğraf */
export const photoState = { temp: undefined };

export function updateBigFoto() {
  const img = document.getElementById('bigFoto'), cv = document.getElementById('bigPet');
  if (!img || !cv) return;
  const p = petData[appState.curPet];
  const src = p.foto || DEFAULT_FOTO[p.tur] || '';
  if (!src) { fotoYok(img); return; }
  img.style.display = 'block'; cv.style.display = 'none';
  if (img.getAttribute('src') !== src) img.src = src;
}

/* foto yüklenemedi → pixel dosta dön */
export function fotoYok(img) {
  img.style.display = 'none';
  const cv = document.getElementById('bigPet'); if (cv) cv.style.display = 'block';
}

export function fotoSec(inp) {
  const f = inp.files && inp.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    const im = new Image();
    im.onload = () => {
      const mx = 520, k = Math.min(1, mx / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      photoState.temp = c.toDataURL('image/jpeg', .82);
      fotoPrevGoster(photoState.temp);
    };
    im.src = rd.result;
  };
  rd.readAsDataURL(f);
}

export function fotoPrevGoster(src) {
  const pv = document.getElementById('fotoPrev'); if (!pv) return;
  pv.innerHTML = src
    ? '<img src="' + src + '" style="height:54px;width:54px;object-fit:cover;border-radius:12px;border:1px solid var(--line)"><a style="font-size:11px;color:var(--red);cursor:pointer;font-weight:700" onclick="fotoKaldir()">Kaldır ✕</a>'
    : '<span style="font-size:11px;color:var(--gray)">Fotoğraf yok — varsayılan görsel kullanılır</span>';
}

export function fotoKaldir() {
  photoState.temp = '';
  const i = document.getElementById('f_foto'); if (i) i.value = '';
  fotoPrevGoster('');
}
