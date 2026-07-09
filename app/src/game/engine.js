import { petData, appState, gState, saveAll, el, pID } from '../state/store.js';
import { CAT, DOG, CAT_WALK, DOG_WALK, PALS, STAGE_NAMES } from '../data/sprites.js';
import { SHOP } from '../data/shop.js';
import { drawSpr } from './draw.js';

let bob = 0, blink = false, walk = false, dir = 1, tickN = 0, petX = 130, tgtX = 130, mode = 'idle',
    eatT = 0, foodX = 0, laserT = 0, dotT = 0, dotX = 100, combo = 0,
    ballX = 0, ballY = 0, ballVX = 0, ballVY = 0, ballFly = false, rounds = 0, idleEmoteT = 100;

export function gLvl() { return Math.min(5, Math.floor(gState().xp / 60) + 1); }
export function petW() { return 16 * (5 + Math.min(3, gLvl() - 1)); }

function petSprite() {
  const p = petData[appState.curPet];
  if (walk && mode !== 'sleep') return (p.tur === 'kedi' ? CAT_WALK : DOG_WALK)[bob ? 1 : 0];
  return p.tur === 'kedi' ? CAT : DOG;
}

function drawPet() {
  const cv = el('gCanvas'); if (!cv) return;
  const p = petData[appState.curPet], pal = PALS[p.renk] || PALS.gri;
  const px = 5 + Math.min(3, gLvl() - 1);
  cv.width = 16 * px; cv.height = 17 * px;
  const ctx = cv.getContext('2d'), oy = (!walk && bob) ? px : 0;
  drawSpr(ctx, petSprite(), pal, px, 0, oy, walk && dir < 0, blink || mode === 'sleep');
}

export function renderAcc() {
  const g = gState(), it = SHOP.find(s => s.id === g.worn), a = el('gAcc'); if (!a) return;
  if (!it) { a.textContent = ''; return; }
  a.textContent = it.e; a.className = 'g-acc pos-' + it.pos;
  a.style.fontSize = (14 + 4 * Math.min(3, gLvl() - 1)) + 'px';
}

export function renderGame() {
  const p = petData[appState.curPet];
  pID('gTitle', 'Pixel ' + p.ad + ' 🎮'); pID('gName', p.ad);
  pID('gLvlNo', gLvl()); pID('gStageName', STAGE_NAMES[gLvl() - 1]);
  pID('gStageSub', STAGE_NAMES[gLvl() - 1] + ' · Seviye ' + gLvl());
  pID('gCoin', gState().coin);
  const xp = el('gXp'); if (xp) xp.style.width = (gLvl() >= 5 ? 100 : (gState().xp % 60) / 60 * 100) + '%';
  renderStats(); renderAcc(); drawPet();
}

export function renderStats() {
  [['tok', 'gTok'], ['mut', 'gMut'], ['enj', 'gEnj']].forEach(([k, id]) => {
    const f = el(id); if (!f) return;
    const v = Math.round(gState()[k]);
    f.style.width = v + '%';
    f.style.background = v > 60 ? 'var(--green)' : v > 30 ? 'var(--amber)' : 'var(--red)';
    pID(id + 'V', v + '%');
  });
}

export function gBubble(t, ms) {
  const b = el('gBub'); b.textContent = t; b.classList.add('show');
  clearTimeout(b._t); b._t = setTimeout(() => b.classList.remove('show'), ms || 2600);
}

export function addXp(n) {
  const before = gLvl(); gState().xp += n;
  if (gLvl() > before) setTimeout(() => { gBubble('🎉 Seviye atladı! Artık bir ' + STAGE_NAMES[gLvl() - 1] + '! Büyüdüm!', 3400); jump(); }, 2400);
  renderGame(); saveAll();
}

export function gEarn(mut, xp, coin) {
  const g = gState(); g.mut = Math.min(100, g.mut + mut); g.coin += coin;
  if (coin > 0) spawnPart('🪙', petX + petW() / 2, 50 + petW());
  pID('gCoin', g.coin); addXp(xp);
}

export function jump() { const c = el('gWrap'); if (!c) return; c.classList.remove('jump'); void c.offsetWidth; c.classList.add('jump'); }

export function spawnPart(e, x, y) {
  const r = el('gRoom'); if (!r) return;
  const s = document.createElement('span'); s.className = 'g-part'; s.textContent = e;
  s.style.left = x + 'px'; s.style.bottom = y + 'px'; r.appendChild(s);
  setTimeout(() => s.remove(), 1200);
}

export function showEmote(e) { const m = el('gEmote'); if (!m) return; m.textContent = e; m.classList.remove('pop'); void m.offsetWidth; m.classList.add('pop'); }

export function isSleeping() { return mode === 'sleep'; }

export function resetGameScene() {
  mode = 'idle'; ballFly = false; eatT = 0; combo = 0; rounds = 0; walk = false;
  ['gDot', 'gBall'].forEach(id => { const e = el(id); if (e) e.style.display = 'none'; });
  const t = el('gTimer'); if (t) t.style.display = 'none';
  const f = el('gFood'); if (f) f.style.opacity = 0;
  const r = el('gRoom'); if (r) r.classList.remove('night');
}

function uykuda() { if (mode === 'sleep') { gBubble('Şşşt... 💤 Uyandırmak için 💤 butonuna tekrar bas'); return true; } return false; }
function mesgul() { return mode === 'laser' || mode === 'fetch' || mode === 'return' || mode === 'wait' || ballFly; }

/* --- aksiyonlar --- */
export function gFeed() {
  if (uykuda() || mesgul()) return;
  const w = el('gRoom').clientWidth;
  foodX = 24 + Math.random() * (w - 70);
  const f = el('gFood'); f.textContent = petData[appState.curPet].tur === 'kedi' ? '🐟' : '🍖';
  f.style.transition = 'none'; f.style.left = foodX + 'px'; f.style.bottom = '230px'; f.style.opacity = 1;
  requestAnimationFrame(() => { f.style.transition = 'bottom .5s ease-in,opacity .3s'; f.style.bottom = '38px'; });
  mode = 'food';
}

export function gPlay() {
  if (uykuda() || mesgul()) return;
  if (gState().enj < 15) { gBubble('Çok yorgunum... önce biraz uyusam? 😴'); showEmote('😪'); return; }
  if (petData[appState.curPet].tur === 'kedi') startLaser(); else startFetch();
}

function startLaser() {
  mode = 'laser'; combo = 0; laserT = 250;
  const w = el('gRoom').clientWidth;
  dotX = 30 + Math.random() * (w - 60); dotT = 25;
  el('gDot').style.display = 'block'; posDot();
  el('gTimer').style.display = 'inline-block';
  gBubble('Kırmızı nokta!! 🔴 Odaya dokunup noktayı sen de kaçırabilirsin!', 3400);
}
function posDot() { const d = el('gDot'); d.style.left = dotX + 'px'; d.style.bottom = (42 + Math.random() * 46) + 'px'; }
function endLaser() {
  mode = 'idle'; el('gDot').style.display = 'none'; el('gTimer').style.display = 'none';
  const g = gState(); g.enj = Math.max(0, g.enj - 10);
  gEarn(Math.min(20, combo * 3), combo * 2 + 4, combo);
  gBubble(combo > 0 ? ('Miyav! ' + combo + ' kez yakaladım! ✨ +' + combo + ' 🪙') : 'Bu nokta çok hızlıydı... 😾 Bir daha!');
}

function startFetch() { rounds = 0; throwBall(); gBubble('Top oyunu! 🎾 Hazır... AT!'); }
function throwBall() {
  ballX = 18; ballY = 130; ballVX = 3.5 + Math.random() * 2.5; ballVY = 2; ballFly = true; mode = 'wait';
  el('gBall').style.display = 'block'; posBall();
  el('gTimer').style.display = 'inline-block'; pID('gTimer', '🎾 ' + (rounds + 1) + '/3 tur');
}
function posBall() { const b = el('gBall'); b.style.left = ballX + 'px'; b.style.bottom = (36 + ballY) + 'px'; }
function endFetch() {
  el('gBall').style.display = 'none'; el('gTimer').style.display = 'none'; mode = 'idle';
  const g = gState(); g.enj = Math.max(0, g.enj - 12);
  gBubble('Hav hav! 3 tur getirdim, şampiyon benim! 🏆');
}

export function gPet2() {
  if (uykuda()) return;
  const g = gState(); g.mut = Math.min(100, g.mut + 8);
  for (let i = 0; i < 3; i++) setTimeout(() => spawnPart('❤️', petX + petW() / 2 - 12 + Math.random() * 24, 44 + petW()), i * 180);
  gBubble(petData[appState.curPet].tur === 'kedi' ? 'Mırrrrr... ❤️' : 'Kuyruk sallama modu: AÇIK ❤️');
  jump(); gEarn(0, 2, 0); renderStats();
}

export function gSleep() {
  if (mode === 'sleep') { wakeUp(true); return; }
  if (mesgul()) return;
  mode = 'sleep'; el('gRoom').classList.add('night');
  el('gFood').style.opacity = 0;
  gBubble('İyi geceler... 💤 (enerjisi dolunca kendisi uyanır)', 3200); drawPet();
}
function wakeUp(erken) {
  mode = 'idle'; el('gRoom').classList.remove('night');
  gBubble(erken ? 'Hoop, uyandım! Ne oluyor? 👀' : 'Günaydın! Enerjim fulledi ⚡☀️');
  if (!erken) gEarn(4, 3, 1);
  drawPet();
}

/* --- oda etkileşimi --- */
el('gRoom').addEventListener('click', ev => {
  const r = el('gRoom').getBoundingClientRect(), x = ev.clientX - r.left;
  if (mode === 'laser') { dotX = Math.max(14, Math.min(r.width - 24, x)); dotT = 32; posDot(); return; }
  if (mode === 'idle') { tgtX = Math.max(4, Math.min(r.width - petW() - 4, x - petW() / 2)); showEmote('❗'); }
});

/* --- konuşma --- */
export function gTalk(q) {
  const inp = el('gInput');
  const text = (q || inp.value).trim(); if (!text) return; inp.value = '';
  if (mode === 'sleep') { gBubble('Zzz... 💤 (rüyasında sana miyavlıyor)'); return; }
  const g = gState(), p = petData[appState.curPet], low = text.toLowerCase();
  let r;
  if (g.tok < 35) r = 'Karnım çok aç, önce mama olsa? 🍖';
  else if (g.enj < 25) r = 'Esneme... çok uykum var 😴';
  else if (low.includes('seviyorum') || low.includes('❤')) r = 'Ben de seni çok seviyorum! ❤️';
  else if (low.includes('nasılsın')) r = g.mut > 60 ? 'Bugün harikayım! Sen nasılsın? ✨' : 'Biraz keyifsizim... benimle oynar mısın? 🥺';
  else if (low.includes('aç')) r = g.tok > 60 ? 'Tokum, sağ ol! Ama ödül mamasına hayır demem 😏' : 'Evet! Mama! MAMA! 🍖';
  else if (low.includes('oyun') || low.includes('oyna')) r = 'Oyun mu dedin?! Hadi hadi hadi! 🎾';
  else if (low.includes('uyu')) r = 'Söz, kısa bir şekerleme... 💤';
  else if (low.includes(p.ad.toLowerCase())) r = 'Evet? Beni mi çağırdın? 👀';
  else if (low.includes('aferin') || low.includes('akıllı')) r = 'Hihi, biliyorum! 😊';
  else if (low.includes('güzel') || low.includes('tatlı')) r = 'Kızarıyorum... 😊 ' + (gState().worn ? 'Aksesuarım da yakışmış, değil mi?' : '');
  else r = [p.tur === 'kedi' ? 'Miyav miyav! 🐾' : 'Hav hav! 🐾', 'Seni dinliyorum, devam et! 👂', 'Bunu duyunca kuyruğum sallandı! 😄', 'Sen yanımdayken her şey güzel ✨'][Math.floor(Math.random() * 4)];
  gBubble(r, 3200); showEmote('💬'); addXp(2);
}

/* --- ana oyun döngüsü (60ms) --- */
setInterval(() => {
  const room = el('gRoom'); if (!room) return;
  tickN++;
  const w = room.clientWidth, pw = petW(), g = gState();
  /* top fiziği */
  if (ballFly) {
    ballX += ballVX; ballY += ballVY; ballVY -= .35;
    if (ballX > w - 26) { ballX = w - 26; ballVX *= -.5; }
    if (ballY <= 0) { ballY = 0; ballFly = false; mode = 'fetch'; }
    posBall();
  }
  /* lazer */
  if (mode === 'laser') {
    laserT--; dotT--;
    pID('gTimer', '🔴 ' + Math.max(0, Math.ceil(laserT * 0.06)) + ' sn · ' + combo + ' ✨');
    if (dotT <= 0) { dotX = 20 + Math.random() * (w - 44); dotT = 25; posDot(); }
    if (laserT <= 0) { endLaser(); return; }
  }
  /* hedef belirleme */
  if (mode === 'idle' && Math.random() < .012) tgtX = 8 + Math.random() * (w - pw - 16);
  if (mode === 'laser') tgtX = dotX - pw / 2;
  if (mode === 'fetch') tgtX = ballX - pw / 2 + 6;
  if (mode === 'food') tgtX = foodX - pw / 2 + 8;
  if (mode === 'return') tgtX = Math.round(w * .15);
  /* yürüme */
  if (mode !== 'sleep' && mode !== 'wait' && eatT <= 0) {
    const d = tgtX - petX;
    if (Math.abs(d) > 4) { petX += Math.sign(d) * (mode === 'idle' ? 1.1 : 3.1); dir = Math.sign(d) || dir; walk = true; } else walk = false;
  } else walk = false;
  petX = Math.max(4, Math.min(w - pw - 4, petX));
  /* varışlar */
  if (mode === 'laser' && Math.abs(petX + pw / 2 - dotX) < 15) {
    combo++; spawnPart('✨', dotX, 72); g.mut = Math.min(100, g.mut + 2);
    dotX = 20 + Math.random() * (w - 44); dotT = 25; posDot(); renderStats();
  }
  if (mode === 'fetch' && !ballFly && Math.abs(petX + pw / 2 - ballX) < 15) { mode = 'return'; el('gBall').style.display = 'none'; }
  if (mode === 'return' && Math.abs(tgtX - petX) <= 5) {
    rounds++; spawnPart('🎾', petX + pw, 60); gEarn(5, 4, 1);
    if (rounds < 3) throwBall(); else endFetch();
  }
  if (mode === 'food' && eatT <= 0 && Math.abs(petX + pw / 2 - foodX) < 16) eatT = 22;
  /* yeme */
  if (eatT > 0) {
    eatT--;
    if (tickN % 6 === 0) spawnPart('✨', foodX + Math.random() * 14 - 7, 46);
    if (eatT === 0) {
      el('gFood').style.opacity = 0; g.tok = Math.min(100, g.tok + 20);
      gBubble(petData[appState.curPet].tur === 'kedi' ? 'Mmm, mırr! Eline sağlık 😋' : 'Hav! Dünyanın en iyi maması! 😋');
      showEmote('😋'); gEarn(2, 4, 1); mode = 'idle'; renderStats();
    }
  }
  /* uyku */
  if (mode === 'sleep') {
    g.enj = Math.min(100, g.enj + .5);
    if (tickN % 20 === 0) { spawnPart('💤', petX + pw - 6, 42 + pw); renderStats(); }
    if (g.enj >= 100) wakeUp(false);
  }
  /* boş zaman duyguları */
  if (--idleEmoteT <= 0) {
    idleEmoteT = 140 + Math.random() * 160;
    if (mode === 'idle') {
      const e = g.tok < 35 ? '🍖' : g.enj < 30 ? '😪' : g.mut > 85 ? '❤️' : ['🎵', '🐾', '💭', '✨'][Math.floor(Math.random() * 4)];
      showEmote(e);
    }
  }
  /* çizim */
  if (tickN % (walk ? 3 : 9) === 0) { bob = 1 - bob; blink = Math.random() < .1 && mode !== 'sleep'; drawPet(); }
  const wr = el('gWrap'); if (wr) wr.style.left = petX + 'px';
}, 60);

/* stat azalması */
setInterval(() => {
  const g = gState();
  g.tok = Math.max(0, g.tok - 1); g.mut = Math.max(0, g.mut - .5);
  if (mode !== 'sleep') g.enj = Math.max(0, g.enj - .3);
  renderStats(); saveAll();
}, 8000);
