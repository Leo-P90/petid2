import "../styles/premium-upgrade.css";
import { petData, appState } from "../state/store.js";
const petKey = () =>
  petData[appState.curPet]?.id || "local-pet-" + appState.curPet;

const STORAGE_KEY = "petid.health.records.v1";
const TRUST_LABELS = {
  user: "Kullanıcı ekledi",
  vet: "Veteriner onayladı",
  clinic: "Klinik sistemi yükledi",
  ai: "AI okudu ama onaylanmadı",
  urgent: "Acil kontrol önerildi",
};

const TYPE_LABELS = {
  exam_report: "Muayene raporu",
  exam_note: "Muayene notu",
  diagnosis: "Tanı / şüpheli tanı",
  prescription: "Reçete",
  vaccine: "Aşı kaydı",
  lab: "Laboratuvar sonucu",
  xray: "Röntgen",
  ultrasound: "USG",
  mr_ct: "MR / CT",
  dental_xray: "Diş röntgeni",
  operation: "Operasyon notu",
  operation_image: "Operasyon öncesi / sonrası görüntü",
  discharge: "Taburcu notu",
  follow_up: "Kontrol randevusu",
  recommendation: "Kontrol önerisi",
};

function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>'"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[char],
  );
}

function loadRecords() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    return Array.isArray(stored)
      ? stored.filter((r) => r.petKey === petKey())
      : [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      [
        ...records.map((r) => ({ ...r, petKey: petKey(), trust: "user" })),
        ...all.filter((r) => r.petKey !== petKey()),
      ].slice(0, 100),
    ),
  );
}

function trustBadge(trust) {
  return `<span class="trust-badge trust-${escapeHtml(trust)}">${escapeHtml(TRUST_LABELS[trust] || TRUST_LABELS.user)}</span>`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function fileBadge(attachment) {
  if (!attachment?.name) return "";
  const extension = attachment.name.split(".").pop()?.toUpperCase() || "DOSYA";
  return `<span class="file-badge"><span>${escapeHtml(extension)}</span>${escapeHtml(attachment.name)}</span>`;
}

function renderTimeline() {
  const root = document.getElementById("healthTimeline");
  if (!root) return;
  const records = loadRecords().sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  root.innerHTML = records
    .map(
      (record) => `
    <article class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-top">
          <div><small>${formatDate(record.date)}</small><h3>${escapeHtml(record.title || TYPE_LABELS[record.type])}</h3></div>
          ${trustBadge(record.trust)}
        </div>
        <div class="record-meta">
          <span>${escapeHtml(TYPE_LABELS[record.type] || record.type)}</span>
          <span>${escapeHtml(record.vetName || "Kullanıcı kaydı")}</span>
          <span>${escapeHtml(record.clinic || "PETID kişisel kayıt")}</span>
        </div>
        ${fileBadge(record.attachment)}
        ${record.note ? `<div class="ai-record-summary"><b>Kişisel not</b><p>${escapeHtml(record.note)}</p></div>` : ""}
        ${record.followUp ? `<div class="follow-up"><b>Kontrol önerisi</b><span>${escapeHtml(record.followUp)}</span></div>` : ""}
      </div>
    </article>
  `,
    )
    .join("");

  const count = document.getElementById("healthRecordCount");
  if (count) count.textContent = `${records.length} kayıt`;
  renderPrescription(records);
  renderLabAssets(records);
}

function renderPrescription(records) {
  const root = document.getElementById("prescriptionModule");
  if (!root) return;
  const record = records.find(
    (item) => item.type === "prescription" && item.prescription,
  );
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
      <div><span>Hatırlatıcı</span><b>${rx.reminder ? "Açık" : "Kapalı"}</b></div>
    </div>
    <div class="rx-warning">${escapeHtml(rx.warning)}</div>
    <div class="rx-footer"><span>${escapeHtml(record.vetName)} · ${escapeHtml(record.clinic)}</span>${fileBadge(record.attachment)}</div>
    <p class="medical-guardrail">PETID AI ilaç veya doz üretmez; yalnızca veterinerin yazdığı reçeteyi sadeleştirir.</p>
  `;
}

function renderLabAssets(records) {
  const root = document.getElementById("labAssetList");
  if (!root) return;
  const labTypes = new Set([
    "lab",
    "xray",
    "ultrasound",
    "mr_ct",
    "dental_xray",
    "operation_image",
  ]);
  const assets = records.filter((record) => labTypes.has(record.type));
  root.innerHTML = assets.length
    ? assets
        .map(
          (record) => `
    <div class="asset-row">
      <div class="asset-type">${escapeHtml(TYPE_LABELS[record.type])}</div>
      <div><b>${escapeHtml(record.title)}</b><span>${formatDate(record.date)} · ${escapeHtml(record.clinic || "Kişisel kayıt")}</span></div>
      ${trustBadge(record.trust)}
    </div>
  `,
        )
        .join("")
    : '<div class="empty-state">Henüz laboratuvar veya görüntüleme kaydı yok.</div>';
}

function openVetPanel() {
  const panel = document.getElementById("vetPanelModal");
  if (!panel) return;
  const petName = petData[appState.curPet]?.ad || "Dostum";
  const profile = document.getElementById("vetAllowedProfile");
  if (profile) profile.textContent = petName;
  panel.classList.add("open");
}

function closeVetPanel() {
  document.getElementById("vetPanelModal")?.classList.remove("open");
}

function submitVetRecord(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const permission = form.querySelector("#vetPermission");
  if (!permission.checked) {
    document.getElementById("vetFormMessage").textContent =
      "Kullanıcı izni doğrulanmadan kayıt eklenemez.";
    return;
  }
  const data = new FormData(form);
  const file = form.querySelector("#vetAttachment").files?.[0];
  const type = data.get("recordType");
  const record = {
    id: globalThis.crypto?.randomUUID?.() || `record-${Date.now()}`,
    date: new Date().toISOString(),
    type,
    title: data.get("title") || TYPE_LABELS[type],
    vetName: data.get("vetName"),
    clinic: data.get("clinic"),
    trust: "user",
    attachment: file
      ? {
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
        }
      : null,
    note: data.get("note") || "",
    followUp: data.get("followUp"),
  };
  if (type === "prescription") {
    record.prescription = {
      medicine: data.get("medicine") || "Veteriner kayıtlı ilaç",
      dose: data.get("dose") || "Reçetede yazdığı şekilde",
      schedule: data.get("schedule") || "Veteriner planına göre",
      duration: data.get("duration") || "Veteriner planına göre",
      warning: data.get("warning") || "Dozu değiştirmeyin.",
      reminder: data.get("reminder") === "on",
    };
  }
  const records = loadRecords();
  records.unshift(record);
  try {
    saveRecords(records);
  } catch {
    document.getElementById("vetFormMessage").textContent =
      "Kayıt yapılamadı — depolama alanını kontrol edin.";
    return;
  }
  renderTimeline();
  form.reset();
  document.getElementById("vetPermission").checked = true;
  document.getElementById("vetFormMessage").textContent =
    "Kayıt sağlık geçmişine eklendi.";
  setTimeout(closeVetPanel, 700);
}

function togglePrescriptionFields() {
  const type = document.getElementById("vetRecordType")?.value;
  document
    .getElementById("vetPrescriptionFields")
    ?.toggleAttribute("hidden", type !== "prescription");
}

export function initHealthRecords() {
  document
    .getElementById("vetRecordForm")
    ?.addEventListener("submit", submitVetRecord);
  renderTimeline();
}
export {
  renderTimeline,
  openVetPanel,
  closeVetPanel,
  togglePrescriptionFields,
};
