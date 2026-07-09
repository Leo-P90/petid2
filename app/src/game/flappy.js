import { petData, appState, gState, saveAll, el, pID } from '../state/store.js';
import { PALS, CAT, DOG } from '../data/sprites.js';
import { drawSpr } from './draw.js';
import { renderGame, gBubble, resetGameScene, isSleeping } from './engine.js';
import { closeM } from '../ui/profile.js';

const FW = 340, FH = 430, FPW = 54, FGAP = 142, FPX = 70, FPS = 2.6;
let fTimer = null, fState = 'ready', fY = 0, fVY = 0, fScore = 0, fTickN = 0, fPipes = [];

export function openFlap() {
  if (isSleeping()) { gBubble('Şşşt... uyuyor, uçuşa çıkamaz 💤'); return; }
  resetGameScene();
  fState = 'ready'; fScore = 0; fY = FH / 2 - 30; fVY = 0; fPipes = []; fTickN = 0;
  pID('fBest', gState().flappyBest || 0);
  document.getElementById('flapModal').classList.add('open');
  if (!fTimer) fTimer = setInterval(fTick, 30);
  fDraw();
}

export function closeFlap() { closeM('flapModal'); clearInterval(fTimer); fTimer = null; fState = 'ready'; }

export function fTap() {
  if (fState === 'ready') fState = 'play';
  if (fState === 'play') fVY = -5.8;
  else if (fState === 'over') { fState = 'ready'; fScore = 0; fY = FH / 2 - 30; fVY = 0; fPipes = []; fTickN = 0; }
  fDraw();
}

function fTick() {
  if (fState === 'play') {
    fTickN++; fVY += .42; fY += fVY;
    if (fTickN % 52 === 1) {
      const son = fPipes.length ? fPipes[fPipes.length - 1].gy : FH / 2 - FGAP / 2;
      const min = Math.max(60, son - 110), max = Math.min(FH - FGAP - 110, son + 110);
      fPipes.push({ x: FW + 10, gy: min + Math.random() * (max - min), passed: false });
    }
    fPipes.forEach(p => p.x -= 2.6);
    fPipes = fPipes.filter(p => p.x > -FPW - 6);
    const bs = 16 * FPS;
    for (const p of fPipes) {
      if (!p.passed && p.x + FPW < FPX) { p.passed = true; fScore++; }
      if (FPX + bs - 7 > p.x && FPX + 7 < p.x + FPW && (fY + 7 < p.gy || fY + bs - 7 > p.gy + FGAP)) { fOver(); break; }
    }
    if (fY < -10 || fY + bs > FH - 44) fOver();
  }
  fDraw();
}

function fOver() {
  if (fState !== 'play') return;
  fState = 'over';
  const g = gState();
  g.coin += fScore; g.xp += fScore * 2;
  if (fScore > (g.flappyBest || 0)) { g.flappyBest = fScore; pID('fBest', fScore); }
  saveAll(); renderGame();
}

function fDraw() {
  const cv = el('fCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  const grd = ctx.createLinearGradient(0, 0, 0, FH);
  grd.addColorStop(0, '#BEE3F8'); grd.addColorStop(1, '#DFF3E4');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, FW, FH);
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fillRect((300 - fTickN * .8 % 420), 60, 52, 14); ctx.fillRect((140 - fTickN * .5 % 420), 120, 64, 16);
  fPipes.forEach(p => {
    ctx.fillStyle = '#3FA97C';
    ctx.fillRect(p.x, 0, FPW, p.gy); ctx.fillRect(p.x, p.gy + FGAP, FPW, FH - p.gy - FGAP - 44);
    ctx.fillStyle = '#2E8A63';
    ctx.fillRect(p.x - 3, p.gy - 14, FPW + 6, 14); ctx.fillRect(p.x - 3, p.gy + FGAP, FPW + 6, 14);
  });
  ctx.fillStyle = '#8ED0A5'; ctx.fillRect(0, FH - 44, FW, 44);
  ctx.fillStyle = '#6DBA8B';
  for (let i = -24; i < FW + 24; i += 24) ctx.fillRect(i - (fTickN * 2.6) % 24, FH - 44, 12, 6);
  const p = petData[appState.curPet], pal = PALS[p.renk] || PALS.gri;
  ctx.save();
  ctx.translate(FPX + 8 * FPS, fY + 8 * FPS);
  ctx.rotate(Math.max(-.4, Math.min(.6, fVY * .06)));
  ctx.translate(-8 * FPS, -8 * FPS);
  drawSpr(ctx, p.tur === 'kedi' ? CAT : DOG, pal, FPS, 0, 0, false, false);
  ctx.restore();
  ctx.fillStyle = '#1F3A2E'; ctx.textAlign = 'center';
  ctx.font = 'bold 28px monospace'; ctx.fillText(fScore, FW / 2, 46);
  if (fState === 'ready') {
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Başlamak için dokun 🐾', FW / 2, FH / 2 - 64);
    ctx.font = '12px sans-serif';
    ctx.fillText('Her dokunuşta ' + p.ad + ' zıplar — engellere çarpma!', FW / 2, FH / 2 - 42);
  }
  if (fState === 'over') {
    ctx.fillStyle = 'rgba(255,255,255,.92)';
    ctx.fillRect(38, FH / 2 - 74, FW - 76, 128);
    ctx.fillStyle = '#1F3A2E';
    ctx.font = 'bold 17px sans-serif'; ctx.fillText('Uçuş bitti! 🪶', FW / 2, FH / 2 - 44);
    ctx.font = 'bold 15px sans-serif'; ctx.fillText('Skor: ' + fScore + '  ·  Kazanç: +' + fScore + ' 🪙', FW / 2, FH / 2 - 16);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Rekor: ' + (gState().flappyBest || 0), FW / 2, FH / 2 + 8);
    ctx.fillText('Tekrar uçmak için dokun', FW / 2, FH / 2 + 32);
  }
}

document.addEventListener('keydown', e => {
  if (e.code === 'Space' && document.getElementById('flapModal').classList.contains('open')) { e.preventDefault(); fTap(); }
});
