/* Sepet durumu — id + adet listesi. Ürün detayları data/market-products.js'den okunur. */
export const cartItems = [];

export function addToCart(product) {
  const existing = cartItems.find(i => i.id === product.id);
  if (existing) existing.qty++;
  else cartItems.push({ id: product.id, qty: 1 });
  updateCartBadge();
}

export function changeQty(id, delta) {
  const item = cartItems.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cartItems.splice(cartItems.indexOf(item), 1);
  updateCartBadge();
}

export function cartCount() {
  return cartItems.reduce((n, i) => n + i.qty, 0);
}

export function updateCartBadge() {
  const n = cartCount();
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = n;
    b.style.display = n > 0 ? 'flex' : 'none';
  });
  const hizBtn = document.getElementById('hizCartBtn');
  if (hizBtn) hizBtn.style.display = n > 0 ? 'flex' : 'none';
}
