import { petData, appState, saveAll, petEmoji, yas, pID } from '../state/store.js';
import { drawHeroPet, drawBigPet } from './hero-pet.js';
import { updateBigFoto, fotoPrevGoster, photoState } from './photo.js';
import { renderGame, resetGameScene } from '../game/engine.js';
import { updateMatchBadge } from './match.js';
import { GALLERY_PHOTOS } from '../data/pet-photos.js';

export function closeM(id) { document.getElementById(id).classList.remove('open'); }

export function setPet(i, el) {
  appState.curPet = i;
  document.querySelectorAll('.pet-pill').forEach((p, j) => p.classList.toggle('on', j === i));
  resetGameScene();
  renderAll();
}

export function renderAll() {
  const p = petData[appState.curPet];
  document.querySelectorAll('.avatar').forEach(a => a.textContent = petEmoji());
  [0, 1].forEach(i => {
    const m = document.getElementById('mp' + i);
    if (m) { m.textContent = petEmoji(i); m.classList.toggle('on', i === appState.curPet); m.title = petData[i].ad; }
  });
  drawHeroPet();
  drawBigPet();
  updateBigFoto();
  pID('aiBannerName', p.ad);
  pID('subSag', p.ad + "'un sağlık takibi");
  pID('pAvatar', petEmoji()); pID('pName', p.ad);
  pID('pMeta', p.cins + ' ' + (p.tur === 'kedi' ? 'Kedi' : 'Köpek') + ' · ' + p.cinsiyet + ' · ' + yas(p.dogum));
  pID('pBirth', (p.dogum || '').split('-').reverse().join('.'));
  pID('pChip', p.cip); pID('pBlood', p.kan); pID('pNeuter', p.kisir);
  pID('pKilo', p.kilo + ' kg'); pID('pAlerji', p.alerji || '—');
  pID('gameBtnName', p.ad);
  renderPetPhotos(p.tur);
  updateMatchBadge();
  renderGame();
}

function renderPetPhotos(tur) {
  const host = document.getElementById('petPhotos'); if (!host) return;
  const photos = GALLERY_PHOTOS[tur] || GALLERY_PHOTOS.kedi;
  host.innerHTML = photos.map(src => '<div class="ph"><img src="' + src + '" alt="" loading="lazy"></div>').join('') +
    '<div class="ph" style="background:linear-gradient(135deg,#F0F4F2,#D8E2DD);color:var(--gray);font-size:22px">+12</div>';
}

/* ---------- profil düzenleme ---------- */
export function openEdit() {
  const p = petData[appState.curPet];
  ['ad', 'cins', 'dogum', 'kilo', 'cip', 'kan', 'alerji'].forEach(k => document.getElementById('f_' + k).value = p[k] || '');
  document.getElementById('f_tur').value = p.tur;
  document.getElementById('f_cinsiyet').value = p.cinsiyet;
  document.getElementById('f_kisir').value = p.kisir;
  document.getElementById('f_renk').value = p.renk;
  photoState.temp = undefined;
  const fi = document.getElementById('f_foto'); if (fi) fi.value = '';
  fotoPrevGoster(p.foto || '');
  document.getElementById('editModal').classList.add('open');
}

export function saveEdit() {
  const p = petData[appState.curPet];
  ['ad', 'cins', 'dogum', 'kilo', 'cip', 'kan', 'alerji'].forEach(k => p[k] = document.getElementById('f_' + k).value);
  p.tur = document.getElementById('f_tur').value;
  p.cinsiyet = document.getElementById('f_cinsiyet').value;
  p.kisir = document.getElementById('f_kisir').value;
  p.renk = document.getElementById('f_renk').value;
  if (photoState.temp !== undefined) p.foto = photoState.temp;
  saveAll(); renderAll(); closeM('editModal');
}
