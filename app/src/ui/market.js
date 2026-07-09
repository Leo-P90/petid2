import { MARKET_PRODUCTS, MARKET_ICIN_LABEL } from '../data/market-products.js';
import { toast } from './toast.js';
import { addToCart } from '../state/cart.js';
import { go } from './navigation.js';

function cardHtml(p) {
  return '<div class="mkt-card" onclick="openProduct(\'' + p.id + '\')">' +
    '<div class="mkt-icon" style="background:' + p.renk + '">' + p.e + '</div>' +
    '<b>' + p.ad + '</b>' +
    '<span class="mkt-tag">' + MARKET_ICIN_LABEL[p.icin] + '</span>' +
    '<div class="mkt-row"><span class="mkt-price">₺' + p.fiyat + '</span><button class="mkt-btn" onclick="event.stopPropagation();buyProduct(\'' + p.id + '\')">Sepete Ekle</button></div>' +
    '</div>';
}

function filtered(kategori) {
  return (!kategori || kategori === 'hepsi') ? MARKET_PRODUCTS : MARKET_PRODUCTS.filter(p => p.kategori === kategori);
}

export function openMarketScreen() {
  go('market');
  renderMarketFull('hepsi');
  document.querySelectorAll('#marketChipsFull .chip').forEach((c, i) => c.classList.toggle('on', i === 0));
}

export function renderMarketFull(kategori) {
  const host = document.getElementById('marketGridFull'); if (!host) return;
  host.innerHTML = filtered(kategori).map(cardHtml).join('');
}

export function filtMarketFull(kategori, chip) {
  document.querySelectorAll('#marketChipsFull .chip').forEach(c => c.classList.remove('on'));
  chip.classList.add('on');
  renderMarketFull(kategori);
}

export function openProduct(id) {
  const p = MARKET_PRODUCTS.find(x => x.id === id); if (!p) return;
  go('urun');
  const icon = document.getElementById('urunIcon');
  icon.style.background = p.renk; icon.textContent = p.e;
  document.getElementById('urunAd').textContent = p.ad;
  document.getElementById('urunTag').textContent = MARKET_ICIN_LABEL[p.icin];
  document.getElementById('urunFiyat').textContent = '₺' + p.fiyat;
  document.getElementById('urunAciklama').textContent = p.aciklama || '';
  document.getElementById('urunBuyBtn').setAttribute('onclick', "buyProduct('" + p.id + "')");
}

export function buyProduct(id) {
  const p = MARKET_PRODUCTS.find(x => x.id === id); if (!p) return;
  addToCart(p);
  toast(p.e + ' ' + p.ad + ' sepete eklendi');
}
