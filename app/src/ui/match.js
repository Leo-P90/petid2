import { petData, appState, petEmoji, pID } from '../state/store.js';
import { MATCH_POOL } from '../data/match-pool.js';
import { startConversation, openMatchThreadFor } from './messages.js';

let matchPool = [], matchIdx = 0, matches = [], lastMatched = null;

/* Hizmetler ekranındaki PatiMatch kartının "N yeni aday" rozeti — seçili
 * hayvana göre uyumlu (uyum ≥%85) aday sayısını hesaplar. */
function candidatePool(p) {
  const pool = (MATCH_POOL[p.tur] || []).filter(c => c.cinsiyet !== p.cinsiyet);
  return pool.length ? pool : (MATCH_POOL[p.tur] || []);
}

export function updateMatchBadge() {
  const b = document.getElementById('hizMatchBadge'); if (!b) return;
  const n = candidatePool(petData[appState.curPet]).filter(c => c.uyum >= 85).length;
  b.textContent = n > 0 ? ('💘 ' + n + ' yeni aday') : '💘 Adaylara göz at';
}

export function openMatch() {
  const p = petData[appState.curPet];
  matchPool = candidatePool(p);
  matchIdx = 0;
  pID('matchSub', p.ad + ' için ' + (p.tur === 'kedi' ? 'kedi 🐱' : 'köpek 🐶') + ' adayları');
  renderMatchCard(); renderMatchStrip();
}

function renderMatchCard() {
  const host = document.getElementById('mStack'); if (!host) return;
  if (matchIdx >= matchPool.length) {
    host.innerHTML = '<div class="m-empty">Şimdilik aday kalmadı! 🐾<br><span style="font-size:12px;font-weight:600">Yeni profiller eklendikçe haber veririz.</span><a onclick="openMatch()">↻ Baştan göster</a></div>';
    return;
  }
  const c = matchPool[matchIdx];
  host.innerHTML = '<div class="m-card" id="mCard">' +
    '<div class="m-img"><img src="' + c.foto + '" alt="' + c.ad + '"><span class="m-uyum">💘 Uyum %' + c.uyum + '</span></div>' +
    '<div class="m-info"><b>' + c.ad + ', ' + c.yas + '</b>' +
    '<span class="m-meta">' + c.cins + ' · ' + c.cinsiyet + ' · 📍 ' + c.km + '</span>' +
    '<p>' + c.bio + '</p>' +
    '<div class="m-tags"><span class="badge" style="background:var(--green-soft);color:var(--green)">💉 Aşılar tam</span><span class="badge" style="background:var(--blue-soft);color:var(--blue)">🧬 Sağlık testi ✓</span><span class="badge" style="background:var(--amber-soft);color:var(--amber)">🪪 Çipli</span></div>' +
    '</div></div>';
}

function animOut(dir) {
  const card = document.getElementById('mCard'); if (!card) return;
  card.style.animation = 'swipe' + dir + ' .4s ease forwards';
  setTimeout(() => { matchIdx++; renderMatchCard(); }, 390);
}

export function matchPass() { animOut('L'); }

export function matchLike() {
  if (matchIdx >= matchPool.length) return;
  const c = matchPool[matchIdx];
  if (c.likes) setTimeout(() => showMatchPop(c), 430);
  animOut('R');
}

function showMatchPop(c) {
  if (!matches.find(m => m.ad === c.ad)) matches.push(c);
  lastMatched = c;
  startConversation(c);
  renderMatchStrip();
  pID('mpName', c.ad); pID('mpEmoji', c.e); pID('mpMine', petEmoji());
  document.getElementById('matchPop').classList.add('open');
}

export function openMatchThread() {
  if (lastMatched) openMatchThreadFor(lastMatched);
}

function renderMatchStrip() {
  const s = document.getElementById('matchStrip'); if (!s) return;
  s.innerHTML = matches.length
    ? '<span style="font-size:11px;color:var(--gray);font-weight:700;align-self:center;flex-shrink:0">Eşleşmeler:</span>' + matches.map(c => '<div class="chip on" style="pointer-events:none">' + c.e + ' ' + c.ad + '</div>').join('')
    : '<span style="font-size:11.5px;color:var(--gray)">Henüz eşleşme yok — beğenmeye başla! 💘</span>';
}
