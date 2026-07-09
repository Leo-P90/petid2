import { VACCINE_INFO } from '../data/vaccine-info.js';

/* --- sağlık bölüm gezinmesi --- */
export function sagJump(id, chip) {
  if (chip) { chip.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('on')); chip.classList.add('on'); }
  const e = document.getElementById(id);
  if (e) e.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* --- aşı kartı: tıklayınca aşağı doğru açılıp yan etkileri gösterir --- */
function renderSeList(items) {
  return '<ul class="se-list">' + items.map(t => '<li>' + t + '</li>').join('') + '</ul>';
}

export function toggleVac(id) {
  const item = document.getElementById('vacItem-' + id);
  const detail = document.getElementById('vacDetail-' + id);
  if (!item || !detail) return;
  const willOpen = !item.classList.contains('open');
  if (willOpen && !detail.dataset.built) {
    const info = VACCINE_INFO[id];
    detail.innerHTML = info ? (
      '<div class="vac-detail-inner">' +
        '<div class="se-group"><b style="color:var(--green)">✅ Normal (beklenen)</b>' + renderSeList(info.normal) + '</div>' +
        '<div class="se-group"><b style="color:var(--red)">⚠️ Riskli (dikkat)</b>' + renderSeList(info.riskli) + '</div>' +
        '<div class="vac-note">Bu bilgiler genel bilgilendirme amaçlıdır; şiddetli veya kalıcı belirtilerde veterinerine başvur. 🩺</div>' +
      '</div>'
    ) : '';
    detail.dataset.built = '1';
  }
  item.classList.toggle('open', willOpen);
}
