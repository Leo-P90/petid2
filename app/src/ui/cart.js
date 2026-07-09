import { cartItems, changeQty, updateCartBadge } from '../state/cart.js';
import { MARKET_PRODUCTS } from '../data/market-products.js';
import { go } from './navigation.js';
import { toast } from './toast.js';

export function openCart() {
  go('sepet');
  renderCart();
}

export function renderCart() {
  const host = document.getElementById('sepetList'); if (!host) return;
  if (!cartItems.length) {
    host.innerHTML = '<div class="m-empty" style="height:220px">🛒 Sepetin boş<br><span style="font-size:12px;font-weight:600">Pati Market\'ten ürün ekleyince burada görünür.</span></div>';
    document.getElementById('sepetTotal').textContent = '₺0';
    return;
  }
  let total = 0;
  host.innerHTML = cartItems.map(item => {
    const p = MARKET_PRODUCTS.find(x => x.id === item.id);
    if (!p) return '';
    total += p.fiyat * item.qty;
    return '<div class="cart-row">' +
      '<div class="mkt-icon" style="background:' + p.renk + '">' + p.e + '</div>' +
      '<div class="cart-body"><b>' + p.ad + '</b><span>₺' + p.fiyat + '</span></div>' +
      '<div class="qty-ctrl"><button onclick="changeCartQty(\'' + p.id + '\',-1)">−</button><span>' + item.qty + '</span><button onclick="changeCartQty(\'' + p.id + '\',1)">+</button></div>' +
      '</div>';
  }).join('');
  document.getElementById('sepetTotal').textContent = '₺' + total;
}

export function changeCartQty(id, delta) {
  changeQty(id, delta);
  renderCart();
}

export function checkout() {
  if (!cartItems.length) return;
  cartItems.length = 0;
  updateCartBadge();
  renderCart();
  toast('🎉 Siparişin alındı (prototip)');
}
