import { SERVICE_INFO } from '../data/service-info.js';
import { ADOPTIONS } from '../data/adoptions.js';

/* ---------- hizmet filtresi ---------- */
export function filtSrv(t, el) {
  document.querySelectorAll('#srvChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  document.querySelectorAll('#srvList .srv-item').forEach(s => {
    s.style.display = (t === 'hepsi' || s.dataset.t === t) ? 'block' : 'none';
  });
}

export function filtSrvKey(t) {
  const map = { hepsi: 0, vet: 1, otel: 2, egt: 3, gez: 4, kuafor: 5 };
  const chips = document.querySelectorAll('#srvChips .chip');
  if (chips[map[t]]) filtSrv(t, chips[map[t]]);
}

/* ---------- fiyat/mesafe akordeonu ---------- */
export function toggleSrv(id) {
  const item = document.getElementById('srvItem-' + id);
  const detail = document.getElementById('srvDetail-' + id);
  if (!item || !detail) return;
  const willOpen = !item.classList.contains('open');
  if (willOpen && !detail.dataset.built) {
    const info = SERVICE_INFO[id];
    if (info) {
      const distanceHtml = info.online
        ? '<span class="srv-fact">🌐 Online hizmet</span>'
        : '<span class="srv-fact">📍 ' + info.distanceKm + ' km uzaklıkta</span>';
      detail.innerHTML =
        '<div class="srv-detail-inner">' +
          '<span class="srv-fact srv-price">💰 ' + info.priceLabel + ': ₺' + info.price + (info.priceSuffix || '') + '\'den başlıyor</span>' +
          distanceHtml +
          '<div class="vac-note">Kesin fiyat hizmet sağlayıcıyla görüşme sonrası netleşir.</div>' +
        '</div>';
    }
    detail.dataset.built = '1';
  }
  item.classList.toggle('open', willOpen);
}

/* ---------- sahiplendirme kartları ---------- */
export function renderAdoptions() {
  const host = document.getElementById('adoptList'); if (!host) return;
  host.innerHTML = ADOPTIONS.map(a =>
    '<div class="ad-card"><div class="ad-img"><img src="' + a.foto + '" alt="' + a.ad + '" loading="lazy"></div><div class="ad-body"><b>' + a.ad + '</b><span>' + a.meta + '</span></div></div>'
  ).join('');
}
