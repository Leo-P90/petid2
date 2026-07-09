import { MARKET_PRODUCTS, MARKET_ICIN_LABEL } from '../data/market-products.js';
import { toast } from './toast.js';

export function renderMarket(kategori) {
  const host = document.getElementById('marketGrid'); if (!host) return;
  const list = (!kategori || kategori === 'hepsi') ? MARKET_PRODUCTS : MARKET_PRODUCTS.filter(p => p.kategori === kategori);
  host.innerHTML = list.map(p =>
    '<div class="mkt-card">' +
      '<div class="mkt-icon" style="background:' + p.renk + '">' + p.e + '</div>' +
      '<b>' + p.ad + '</b>' +
      '<span class="mkt-tag">' + MARKET_ICIN_LABEL[p.icin] + '</span>' +
      '<div class="mkt-row"><span class="mkt-price">₺' + p.fiyat + '</span><button class="mkt-btn" onclick="buyProduct(\'' + p.id + '\')">Sepete Ekle</button></div>' +
    '</div>'
  ).join('');
}

export function filtMarket(kategori, chip) {
  document.querySelectorAll('#marketChips .chip').forEach(c => c.classList.remove('on'));
  chip.classList.add('on');
  renderMarket(kategori);
}

export function buyProduct(id) {
  const p = MARKET_PRODUCTS.find(x => x.id === id);
  if (!p) return;
  toast(p.e + ' ' + p.ad + ' sepete eklendi (prototip)');
}
