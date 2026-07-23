import './styles/premium-upgrade.css';
import { CAT_LESSONS } from './data/cat-lessons.js';
import { PETID_KNOWLEDGE_BASE } from './data/knowledge-base.js';

const STORAGE_KEY = 'petid.health.records.v1';
const TRUST_LABELS = {
  user: 'Kullanıcı ekledi',
  vet: 'Veteriner onayladı',
  clinic: 'Klinik sistemi yükledi',
  ai: 'AI okudu ama onaylanmadı',
  urgent: 'Acil kontrol önerildi'
};

const TYPE_LABELS = {
  exam_report: 'Muayene raporu',
  exam_note: 'Muayene notu',
  diagnosis: 'Tanı / şüpheli tanı',
  prescription: 'Reçete',
  vaccine: 'Aşı kaydı',
  lab: 'Laboratuvar sonucu',
  xray: 'Röntgen',
  ultrasound: 'USG',
  mr_ct: 'MR / CT',
  dental_xray: 'Diş röntgeni',
  operation: 'Operasyon notu',
  operation_image: 'Operasyon öncesi / sonrası görüntü',
  discharge: 'Taburcu notu',
  follow_up: 'Kontrol randevusu',
  recommendation: 'Kontrol önerisi'
};

const DEFAULT_RECORDS = [
  {
    id: 'demo-prescription',
    date: '2026-07-18T10:30:00.000Z',
    type: 'prescription',
    title: 'Dijital reçete eklendi',
    vetName: 'Dr. Elif Kaya',
    clinic: 'PETID Veteriner Kliniği',
    trust: 'vet',
    attachment: { name: 'boncuk-recete.pdf', type: 'application/pdf' },
    aiSummary: 'Veterinerin yazdığı kullanım planı sadeleştirildi. Doz bilgisi değiştirilmedi.',
    followUp: '7 gün sonra belirtileri kliniğe bildir.',
    prescription: {
      medicine: 'Veteriner kayıtlı ürün',
      dose: 'Reçetede yazdığı şekilde',
      schedule: '08:00 ve 20:00',
      duration: '7 gün',
      warning: 'Dozu değiştirmeyin; beklenmeyen etkide veterinerle görüşün.',
      reminder: true
    }
  },
  {
    id: 'demo-xray',
    date: '2026-06-28T13:00:00.000Z',
    type: 'xray',
    title: 'Röntgen görüntüsü eklendi',
    vetName: 'Dr. Elif Kaya',
    clinic: 'PETID Veteriner Kliniği',
    trust: 'clinic',
    attachment: { name: 'goruntuleme-2806.dcm', type: 'application/dicom' },
    aiSummary: 'Görüntü dosyası arşivlendi. Klinik yorumunun yerine geçecek bir AI yorumu üretilmedi.',
    followUp: 'Veteriner değerlendirme notunu görüntüle.'
  },
  {
    id: 'demo-lab',
    date: '2026-03-14T09:15:00.000Z',
    type: 'lab',
    title: 'Kan tahlili sonucu',
    vetName: 'Dr. Elif Kaya',
    clinic: 'PETID Veteriner Kliniği',
    trust: 'ai',
    attachment: { name: 'kan-tahlili-mart.pdf', type: 'application/pdf' },
    aiSummary: 'Raporun terimleri sadeleştirildi; sonuçlar veteriner tarafından henüz onaylanmadı.',
    followUp: 'Referans dışı görünen satırları veterinerine sor.'
  }
];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function loadRecords() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? stored : DEFAULT_RECORDS;
  } catch {
    return DEFAULT_RECORDS;
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 100)));
}

function trustBadge(trust) {
  return `<span class="trust-badge trust-${escapeHtml(trust)}">${escapeHtml(TRUST_LABELS[trust] || TRUST_LABELS.user)}</span>`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
}

function fileBadge(attachment) {
  if (!attachment?.name) return '';
  const extension = attachment.name.split('.').pop()?.toUpperCase() || 'DOSYA';
  return `<span class="file-badge"><span>${escapeHtml(extension)}</span>${escapeHtml(attachment.name)}</span>`;
}

function renderTimeline() {
  const root = document.getElementById('healthTimeline');
  if (!root) return;
  const records = loadRecords().sort((a, b) => new Date(b.date) - new Date(a.date));
  root.innerHTML = records.map(record => `
    <article class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-top">
          <div><small>${formatDate(record.date)}</small><h3>${escapeHtml(record.title || TYPE_LABELS[record.type])}</h3></div>
          ${trustBadge(record.trust)}
        </div>
        <div class="record-meta">
          <span>${escapeHtml(TYPE_LABELS[record.type] || record.type)}</span>
          <span>${escapeHtml(record.vetName || 'Kullanıcı kaydı')}</span>
          <span>${escapeHtml(record.clinic || 'PETID kişisel kayıt')}</span>
        </div>
        ${fileBadge(record.attachment)}
        ${record.aiSummary ? `<div class="ai-record-summary"><b>AI sadeleştirmesi</b><p>${escapeHtml(record.aiSummary)}</p></div>` : ''}
        ${record.followUp ? `<div class="follow-up"><b>Kontrol önerisi</b><span>${escapeHtml(record.followUp)}</span></div>` : ''}
      </div>
    </article>
  `).join('');

  const count = document.getElementById('healthRecordCount');
  if (count) count.textContent = `${records.length} kayıt`;
  renderPrescription(records);
  renderLabAssets(records);
}

function renderPrescription(records) {
  const root = document.getElementById('prescriptionModule');
  if (!root) return;
  const record = records.find(item => item.type === 'prescription' && item.prescription);
  if (!record) {
    root.innerHTML = '<div class="empty-state">Aktif dijital reçete yok.</div>';
    return;
  }
  const rx = record.prescription;
  root.innerHTML = `
    <div class="rx-head"><div><span class="eyebrow">DİJİTAL REÇETE</span><h3>${escapeHtml(rx.medicine)}</h3></div>${trustBadge(record.trust)}</div>
    <div class="rx-grid">
      <div><span>Doz bilgisi</span><b>${escapeHtml(rx.dose)}</b></div>
      <div><span>Kullanım saati</span><b>${escapeHtml(rx.schedule)}</b></div>
      <div><span>Süre</span><b>${escapeHtml(rx.duration)}</b></div>
      <div><span>Hatırlatıcı</span><b>${rx.reminder ? 'Açık' : 'Kapalı'}</b></div>
    </div>
    <div class="rx-warning">${escapeHtml(rx.warning)}</div>
    <div class="rx-footer"><span>${escapeHtml(record.vetName)} · ${escapeHtml(record.clinic)}</span>${fileBadge(record.attachment)}</div>
    <p class="medical-guardrail">PETID AI ilaç veya doz üretmez; yalnızca veterinerin yazdığı reçeteyi sadeleştirir.</p>
  `;
}

function renderLabAssets(records) {
  const root = document.getElementById('labAssetList');
  if (!root) return;
  const labTypes = new Set(['lab', 'xray', 'ultrasound', 'mr_ct', 'dental_xray', 'operation_image']);
  const assets = records.filter(record => labTypes.has(record.type));
  root.innerHTML = assets.length ? assets.map(record => `
    <div class="asset-row">
      <div class="asset-type">${escapeHtml(TYPE_LABELS[record.type])}</div>
      <div><b>${escapeHtml(record.title)}</b><span>${formatDate(record.date)} · ${escapeHtml(record.clinic || 'Kişisel kayıt')}</span></div>
      ${trustBadge(record.trust)}
    </div>
  `).join('') : '<div class="empty-state">Henüz laboratuvar veya görüntüleme kaydı yok.</div>';
}

function renderCatLesson(id) {
  const lesson = CAT_LESSONS[id];
  if (!lesson) return false;
  document.getElementById('lTitle').textContent = lesson.title;
  document.getElementById('lMeta').innerHTML = `
    <span class="badge premium-badge">${escapeHtml(lesson.level)}</span>
    <span class="badge premium-badge">${escapeHtml(lesson.duration)} kısa seans</span>
    <span class="badge premium-badge">Gönüllü katılım</span>`;
  document.getElementById('lDesc').textContent = lesson.summary;
  const ages = document.getElementById('lAges');
  ages.style.display = 'grid';
  ages.innerHTML = `
    <div class="lesson-principle"><span>GÜVEN</span><b>Kedinin mesafe ve temas seçimine saygı duy.</b></div>
    <div class="lesson-principle"><span>ÇEVRE</span><b>${escapeHtml(lesson.environment)}</b></div>`;
  document.getElementById('lSteps').innerHTML = lesson.steps.map((step, index) =>
    `<div class="step"><div class="no">${index + 1}</div><p>${escapeHtml(step)}</p></div>`
  ).join('');
  document.getElementById('lVarsWrap').style.display = 'none';
  document.getElementById('lTip').innerHTML =
    '<b>PETID yaklaşımı:</b> Kısa seans, pozitif pekiştirme ve kedinin istediği anda ayrılabilmesi.';
  document.getElementById('lErr').innerHTML = `<b>Kaçınılacaklar:</b> ${escapeHtml(lesson.avoid)}`;
  const stage = document.getElementById('lStage');
  stage.className = 'stage premium-lesson-stage';
  stage.innerHTML = `
    <div class="stage-orbit"></div>
    <div class="stage-copy"><span>KEDİYE ÖZEL</span><strong>${escapeHtml(lesson.title)}</strong><small>Güven · gönüllü katılım · stres azaltma</small></div>`;
  document.getElementById('lessonModal').classList.add('open');
  return true;
}

function openVetPanel() {
  const panel = document.getElementById('vetPanelModal');
  if (!panel) return;
  const petName = document.getElementById('trainingPetName')?.textContent?.replace(/'un programı|'ın programı/, '') || 'Boncuk';
  const profile = document.getElementById('vetAllowedProfile');
  if (profile) profile.textContent = petName;
  panel.classList.add('open');
}

function closeVetPanel() {
  document.getElementById('vetPanelModal')?.classList.remove('open');
}

function submitVetRecord(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const permission = form.querySelector('#vetPermission');
  if (!permission.checked) {
    document.getElementById('vetFormMessage').textContent = 'Kullanıcı izni doğrulanmadan kayıt eklenemez.';
    return;
  }
  const data = new FormData(form);
  const file = form.querySelector('#vetAttachment').files?.[0];
  const type = data.get('recordType');
  const record = {
    id: globalThis.crypto?.randomUUID?.() || `record-${Date.now()}`,
    date: new Date().toISOString(),
    type,
    title: data.get('title') || TYPE_LABELS[type],
    vetName: data.get('vetName'),
    clinic: data.get('clinic'),
    trust: data.get('trust'),
    attachment: file ? { name: file.name, type: file.type || 'application/octet-stream', size: file.size } : null,
    aiSummary: data.get('aiSummary'),
    followUp: data.get('followUp')
  };
  if (type === 'prescription') {
    record.prescription = {
      medicine: data.get('medicine') || 'Veteriner kayıtlı ilaç',
      dose: data.get('dose') || 'Reçetede yazdığı şekilde',
      schedule: data.get('schedule') || 'Veteriner planına göre',
      duration: data.get('duration') || 'Veteriner planına göre',
      warning: data.get('warning') || 'Dozu değiştirmeyin.',
      reminder: data.get('reminder') === 'on'
    };
  }
  const records = loadRecords();
  records.unshift(record);
  saveRecords(records);
  renderTimeline();
  form.reset();
  document.getElementById('vetPermission').checked = true;
  document.getElementById('vetFormMessage').textContent = 'Kayıt sağlık geçmişine eklendi.';
  setTimeout(closeVetPanel, 700);
}

function togglePrescriptionFields() {
  const type = document.getElementById('vetRecordType')?.value;
  document.getElementById('vetPrescriptionFields')?.toggleAttribute('hidden', type !== 'prescription');
}

function init() {
  window.PETID_KNOWLEDGE_BASE = PETID_KNOWLEDGE_BASE;

  const legacyOpenLesson = window.openLesson;
  window.openLesson = id => renderCatLesson(id) ||
    (typeof legacyOpenLesson === 'function' ? legacyOpenLesson(id) : undefined);

  const legacySetPet = window.setPet;
  if (typeof legacySetPet === 'function') {
    window.setPet = (...args) => {
      const result = legacySetPet(...args);
      queueMicrotask(renderTimeline);
      return result;
    };
  }

  window.sagJump = (id, chip) => {
    const target = document.getElementById(id);
    if (!target) return;

    document.querySelectorAll('#scr-saglik [data-health-panel]').forEach(panel => {
      panel.hidden = panel !== target;
    });

    if (chip) {
      chip.parentElement.querySelectorAll('[role="tab"]').forEach(item => {
        const selected = item === chip;
        item.classList.toggle('on', selected);
        item.setAttribute('aria-selected', String(selected));
      });
    }

    document.getElementById('scr-saglik')?.scrollTo({ top: 0, behavior: 'smooth' });
  };
  window.openVetPanel = openVetPanel;
  window.closeVetPanel = closeVetPanel;
  window.togglePrescriptionFields = togglePrescriptionFields;

  document.getElementById('vetRecordForm')?.addEventListener('submit', submitVetRecord);
  renderTimeline();
}

init();
