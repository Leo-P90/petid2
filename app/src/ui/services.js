import { SERVICE_INFO } from '../data/service-info.js';
import { SERVICES, SERVICE_TYPE_LABEL } from '../data/services.js';
import { ADOPTIONS } from '../data/adoptions.js';
import { go } from './navigation.js';

function srvItemHtml(s) {
  return '<div class="srv-item" id="srvItem-' + s.id + '">' +
    '<div class="srv" onclick="toggleSrv(\'' + s.id + '\')"><div class="si" style="background:' + s.bg + '">' + s.e + '</div><div><b>' + s.ad + '</b><span class="meta">' + s.meta + '</span><span class="star">★ ' + s.star + ' (' + s.reviews + ' değerlendirme)</span></div><div class="go chev">›</div></div>' +
    '<div class="srv-detail" id="srvDetail-' + s.id + '"></div>' +
    '</div>';
}

/* ---------- kategori ekranı (hizmetler kutucuklarından açılır) ---------- */
export function openSrvCategory(t) {
  go('hizmet-kategori');
  document.getElementById('srvKatTitle').textContent = SERVICE_TYPE_LABEL[t] || 'Hizmetler';
  document.getElementById('srvKatList').innerHTML = SERVICES.filter(s => s.t === t).map(srvItemHtml).join('');
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
