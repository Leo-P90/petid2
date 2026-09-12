import { petData, appState, el } from "../state/store.js";
import { DEFAULT_FOTO } from "../data/default-photos.js";
import { toast } from "./toast.js";
export const photoState = { temp: undefined };
function updateBigFoto() {
  let e = document.getElementById(`bigFoto`),
    t = document.getElementById(`bigPet`);
  if (!e || !t) return;
  let n = petData[appState.curPet],
    r = (n.fotolar && n.fotolar[0]) || n.foto || DEFAULT_FOTO[n.tur] || ``;
  if (!r) {
    fotoYok(e);
    return;
  }
  ((e.style.display = `block`),
    (t.style.display = `none`),
    e.getAttribute(`src`) !== r && (e.src = r));
}
function fotoYok(e) {
  e.style.display = `none`;
  let t = document.getElementById(`bigPet`);
  t && (t.style.display = `block`);
}
async function fotoSec(e) {
  let t = Array.from(e.files || []).slice(0, 5);
  if (!t.length) return;
  e.files.length > 5 && toast(`En fazla 5 fotoğraf ekleyebilirsin`);
  let n = document.getElementById(`editSaveBtn`),
    r = n?.textContent;
  n && ((n.disabled = !0), (n.textContent = `Fotoğraflar hazırlanıyor...`));
  try {
    const photos = await Promise.all(t.map(resizePhoto));
    if (photos.some((photo) => !photo)) {
      toast("Fotoğraf okunamadı — önceki seçim korunuyor");
      return;
    }
    photoState.temp = photos;
    fotoPrevGoster(photoState.temp);
  } finally {
    n && ((n.disabled = !1), (n.textContent = r));
  }
}
function resizePhoto(e) {
  return new Promise((t) => {
    let n = new FileReader();
    ((n.onload = () => {
      let e = new Image();
      ((e.onload = () => {
        let n = Math.min(1, 440 / Math.max(e.width, e.height)),
          r = document.createElement(`canvas`);
        ((r.width = Math.round(e.width * n)),
          (r.height = Math.round(e.height * n)),
          r.getContext(`2d`).drawImage(e, 0, 0, r.width, r.height),
          t(r.toDataURL(`image/jpeg`, 0.72)));
      }),
        (e.onerror = () => t(``)),
        (e.src = n.result));
    }),
      (n.onerror = () => t(``)),
      n.readAsDataURL(e));
  });
}
function fotoPrevGoster(e) {
  let t = document.getElementById(`fotoPrev`);
  if (!t) return;
  let n = (Array.isArray(e) ? e : e ? [e] : []).filter(Boolean);
  t.innerHTML = n.length
    ? `<div class="photo-preview-list">` +
      n.map((e) => `<img src="` + e + `" alt="">`).join(``) +
      `</div><a class="photo-remove" onclick="fotoKaldir()">Tümünü kaldır ✕</a>`
    : `<span style="font-size:11px;color:var(--gray)">Fotoğraf yok — varsayılan görsel kullanılır</span>`;
}
function fotoKaldir() {
  photoState.temp = [];
  let e = document.getElementById(`f_foto`);
  (e && (e.value = ``), fotoPrevGoster(``));
}
export { updateBigFoto, fotoYok, fotoSec, fotoPrevGoster, fotoKaldir };
