import { gState, saveAll, el, pID } from '../state/store.js';
import { SHOP } from '../data/shop.js';
import { gLvl, renderGame, gBubble, jump } from './engine.js';

export function openShop() { renderShop(); document.getElementById('shopModal').classList.add('open'); }

export function renderShop() {
  const g = gState(); pID('shopCoin', '🪙 ' + g.coin);
  if (!g.worn || typeof g.worn !== 'object') g.worn = {};
  el('shopGrid').innerHTML = SHOP.map(it => {
    const owned = g.items.includes(it.id), worn = g.worn[it.pos] === it.id, locked = gLvl() < (it.lvl || 1);
    let btn;
    if (locked) btn = '<button class="s-btn" disabled>🔒 Seviye ' + it.lvl + '</button>';
    else if (worn) btn = '<button class="s-btn on" onclick="wearItem(\'' + it.id + '\')">Çıkar ✓</button>';
    else if (owned) btn = '<button class="s-btn" onclick="wearItem(\'' + it.id + '\')">Tak</button>';
    else btn = '<button class="s-btn' + (g.coin < it.f ? ' no' : '') + '" onclick="buyItem(\'' + it.id + '\')">Satın al · 🪙' + it.f + '</button>';
    return '<div class="shop-item"><div style="font-size:30px">' + it.e + '</div><b>' + it.ad + '</b>' + btn + '</div>';
  }).join('');
}

export function buyItem(id) {
  const g = gState(), it = SHOP.find(s => s.id === id);
  if (g.coin < it.f) { gBubble('Param yetmiyor... 🪙 Biraz oyun oynayıp kazanalım mı?'); document.getElementById('shopModal').classList.remove('open'); return; }
  if (!g.worn || typeof g.worn !== 'object') g.worn = {};
  g.coin -= it.f; g.items.push(id); g.worn[it.pos] = id;
  saveAll(); renderShop(); renderGame();
  gBubble('Bu ' + it.ad.toLowerCase() + ' bana çok yakıştı! ' + it.e); jump();
}

export function wearItem(id) {
  const g = gState(), it = SHOP.find(s => s.id === id); if (!it) return;
  if (!g.worn || typeof g.worn !== 'object') g.worn = {};
  g.worn[it.pos] = g.worn[it.pos] === id ? '' : id;
  saveAll(); renderShop(); renderGame();
}
