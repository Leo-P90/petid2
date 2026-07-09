import { petData, appState, saveAll, addPet, petEmoji, yas, pID } from '../state/store.js';
import { drawHeroPet, drawBigPet } from './hero-pet.js';
import { updateBigFoto, fotoPrevGoster, photoState } from './photo.js';
import { renderGame, resetGameScene } from '../game/engine.js';
import { updateMatchBadge } from './match.js';
import { petGalleryPhotos } from '../data/pet-photos.js';

export function closeM(id) { document.getElementById(id).classList.remove('open'); }

let addMode = false;

export function setPet(i) {
  appState.curPet = i;
  resetGameScene();
  renderAll();
}

export function renderAll() {
  const p = petData[appState.curPet];
  document.querySelectorAll('.avatar').forEach(a => a.textContent = petEmoji());
  const mp0 = document.getElementById('mp0');
  if (mp0) { mp0.textContent = petEmoji(); mp0.title = p.ad; }
  drawHeroPet();
  drawBigPet();
  updateBigFoto();
  pID('aiBannerName', p.ad);
  pID('subSag', p.ad + "'un sağlık takibi");
  pID('pAvatar', petEmoji()); pID('pName', p.ad);
  pID('pMeta', p.cins + ' ' + (p.tur === 'kedi' ? 'Kedi' : 'Köpek') + ' · ' + p.cinsiyet + ' · ' + yas(p.dogum));
  pID('pBirth', p.dogum ? p.dogum.split('-').reverse().join('.') : '—');
  pID('pChip', p.cip || '—'); pID('pBlood', p.kan || '—'); pID('pNeuter', p.kisir);
  pID('pKilo', p.kilo ? p.kilo + ' kg' : '—'); pID('pAlerji', p.alerji || '—');
  pID('gameBtnName', p.ad);
  renderPetPhotos(p);
  renderPetSwitch();
  updateMatchBadge();
  renderGame();
}

function renderPetPhotos(p) {
  const host = document.getElementById('petPhotos'); if (!host) return;
  const photos = petGalleryPhotos(p);
  host.innerHTML = photos.map(src => '<div class="ph"><img src="' + src + '" alt="" loading="lazy"></div>').join('') +
    '<div class="ph" style="background:linear-gradient(135deg,#F0F4F2,#D8E2DD);color:var(--gray);font-size:22px">+12</div>';
}

function renderPetSwitch() {
  const host = document.getElementById('petSwitch'); if (!host) return;
  host.innerHTML = petData.map((p, i) =>
    '<div class="pet-pill' + (i === appState.curPet ? ' on' : '') + '" onclick="setPet(' + i + ')">' +
    '<span class="pp-emoji">' + (p.tur === 'kedi' ? '🐱' : '🐶') + '</span>' +
    '<div><b>' + p.ad + '</b><span>' + (p.tur === 'kedi' ? 'Kedi' : 'Köpek') + '</span></div></div>'
  ).join('') + '<div class="pet-pill add" onclick="openAddPet()"><span class="pp-emoji">➕</span><div><b>Yeni Ekle</b></div></div>';
}

/* ---------- profil düzenleme / yeni hayvan ekleme (aynı form, iki mod) ---------- */
function fillForm(p) {
  ['ad', 'cins', 'dogum', 'kilo', 'cip', 'kan', 'alerji'].forEach(k => document.getElementById('f_' + k).value = p[k] || '');
  document.getElementById('f_tur').value = p.tur || 'kedi';
  document.getElementById('f_cinsiyet').value = p.cinsiyet || 'Dişi';
  document.getElementById('f_kisir').value = p.kisir || 'Hayır';
  document.getElementById('f_renk').value = p.renk || 'gri';
  photoState.temp = undefined;
  const fi = document.getElementById('f_foto'); if (fi) fi.value = '';
  fotoPrevGoster(p.foto || '');
}

export function openEdit() {
  addMode = false;
  fillForm(petData[appState.curPet]);
  pID('editTitle', 'Profili Düzenle ✏️'); pID('editSaveBtn', 'Kaydet');
  document.getElementById('editModal').classList.add('open');
}

export function openAddPet() {
  addMode = true;
  fillForm({});
  pID('editTitle', 'Yeni Hayvan Ekle 🐾'); pID('editSaveBtn', 'Ekle');
  document.getElementById('editModal').classList.add('open');
}

export async function saveEdit() {
  const fields = {};
  ['ad', 'cins', 'dogum', 'kilo', 'cip', 'kan', 'alerji'].forEach(k => fields[k] = document.getElementById('f_' + k).value);
  fields.tur = document.getElementById('f_tur').value;
  fields.cinsiyet = document.getElementById('f_cinsiyet').value;
  fields.kisir = document.getElementById('f_kisir').value;
  fields.renk = document.getElementById('f_renk').value;
  if (photoState.temp !== undefined) fields.foto = photoState.temp;

  if (addMode) {
    await addPet(fields);
    resetGameScene();
  } else {
    Object.assign(petData[appState.curPet], fields);
    await saveAll();
  }
  renderAll(); closeM('editModal');
}
