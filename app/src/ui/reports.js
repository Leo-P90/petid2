import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { petData, appState, pID, petEmoji } from "../state/store.js";
import { go } from "./navigation.js";
import { toast } from "./toast.js";
import { confirmArchive } from "./confirmation.js";
import { escapeHtml } from "./safe-html.js";

// This slice deliberately preserves the device-local prototype. No server
// authorization, moderation or account-to-account delivery is claimed here.
const STORAGE_KEY = "patidostReports";
const DEFAULT_CENTER = { lat: 41.0082, lng: 28.9784 };
const DAY_MS = 86400000;
const LABELS = {
  kayip: ["KAYIP", "🔎"],
  yarali: ["YARALI", "🩹"],
  yardim: ["YARDIM GEREKİYOR", "🆘"],
  sahipsiz: ["SAHİPSİZ BULUNDU", "🏠"],
};
let reportType = "kayip",
  reportSubject = "profile",
  sightingType = "gordum";
let reportLocation = null,
  sightingLocation = null,
  activeReportId = null;
let reportMap, reportMarker, sightingMap, sightingMarker;
const pinIcon = L.divIcon({
  className: "petid-map-pin",
  html: "<span>📍</span>",
  iconSize: [36, 42],
  iconAnchor: [18, 38],
});
const typeEmoji = (type) =>
  type === "kedi" ? "🐱" : type === "kopek" ? "🐶" : "🐾";
const currentPet = () => petData[appState.curPet];
const inlineId = (id) => escapeHtml(JSON.stringify(String(id)));
const mapLink = (lat, lng) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

function actorId() {
  if (appState.session?.user?.id) return appState.session.user.id;
  let id;
  try {
    id = localStorage.getItem("patidostActorId");
  } catch {}
  if (!id) {
    id =
      globalThis.crypto?.randomUUID?.() ||
      `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    try {
      localStorage.setItem("patidostActorId", id);
    } catch {}
  }
  return id;
}

function loadLocalReports() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {}
  if (!Array.isArray(saved)) return [];
  // Compatibility with the original local format. This is not a migration of
  // server ownership: the historical data never left this browser.
  return saved
    .filter((report) => report && typeof report === "object")
    .map((report) => ({
      ...report,
      ownerId: report.ownerId || actorId(),
      type: report.type === "bulundu" ? "sahipsiz" : report.type,
      status:
        report.status || (report.type === "bulundu" ? "closed" : "active"),
      sightings: Array.isArray(report.sightings) ? report.sightings : [],
      flags: Array.isArray(report.flags) ? report.flags : [],
    }));
}

function saveReports(reports) {
  // Let callers display a failure instead of announcing a successful save.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports.slice(0, 50)));
}
function withinDailyLimit(entries, owner, limit) {
  return (
    entries.filter(
      (entry) =>
        entry.ownerId === owner &&
        new Date(entry.createdAt).getTime() > Date.now() - DAY_MS,
    ).length < limit
  );
}
function saveFailed() {
  toast(
    "Kayıt yapılamadı; depolama alanını ve fotoğraf boyutlarını kontrol et",
  );
}

function createMap(id, center, onLocation) {
  const map = L.map(id, {
    zoomControl: true,
    attributionControl: true,
  }).setView([center.lat, center.lng], 14);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);
  map.on("click", (event) => onLocation(event.latlng));
  return map;
}
function moveMarker(map, marker, location, onLocation) {
  if (marker) return marker.setLatLng([location.lat, location.lng]);
  const next = L.marker([location.lat, location.lng], {
    icon: pinIcon,
    draggable: true,
  }).addTo(map);
  next.on("dragend", () => onLocation(next.getLatLng()));
  return next;
}
function setReportLocation(location, recenter = false) {
  reportLocation = { lat: location.lat, lng: location.lng };
  reportMarker = moveMarker(
    reportMap,
    reportMarker,
    reportLocation,
    setReportLocation,
  );
  if (recenter)
    reportMap.setView(
      [location.lat, location.lng],
      Math.max(reportMap.getZoom(), 16),
    );
  pID("reportCoords", `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`);
}
function setSightingLocation(location, recenter = false) {
  sightingLocation = { lat: location.lat, lng: location.lng };
  sightingMarker = moveMarker(
    sightingMap,
    sightingMarker,
    sightingLocation,
    setSightingLocation,
  );
  if (recenter)
    sightingMap.setView(
      [location.lat, location.lng],
      Math.max(sightingMap.getZoom(), 16),
    );
  pID(
    "sightingCoords",
    `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
  );
}
function ensureReportMap() {
  reportMap ||= createMap("reportMap", DEFAULT_CENTER, setReportLocation);
  requestAnimationFrame(() => reportMap.invalidateSize());
}
function locate(onLocation, labelId) {
  if (!navigator.geolocation) {
    toast("Bu tarayıcı konumu desteklemiyor");
    return;
  }
  pID(labelId, "Konum alınıyor...");
  navigator.geolocation.getCurrentPosition(
    (position) =>
      onLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }),
    () => {
      pID(labelId, "Konum izni alınamadı; haritadan işaretle");
      toast("Haritaya dokunarak konum seçebilirsin");
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
  );
}

export function openReport() {
  pID("reportPetEmoji", petEmoji());
  pID("reportPetName", currentPet().ad);
  pID("reportPetMeta", `${typeEmoji(currentPet().tur)} profili aktif`);
  go("bildir");
  ensureReportMap();
  renderReports();
}
export function setReportType(button) {
  reportType = button.dataset.type;
  document
    .querySelectorAll("#reportType button")
    .forEach((item) => item.classList.toggle("on", item === button));
}
export function setReportSubject(button) {
  reportSubject = button.dataset.subject;
  document
    .querySelectorAll("#reportSubject button")
    .forEach((item) => item.classList.toggle("on", item === button));
  document.getElementById("reportProfilePet").hidden =
    reportSubject !== "profile";
  document.getElementById("reportOtherPet").hidden = reportSubject !== "other";
  const first = document.getElementById("reportTypeA"),
    second = document.getElementById("reportTypeB");
  const other = reportSubject === "other";
  first.dataset.type = other ? "yarali" : "kayip";
  first.textContent = other ? "🩹 Yaralı" : "🔎 Kayıp";
  second.dataset.type = other ? "yardim" : "yarali";
  second.textContent = other ? "🆘 Yardım Gerekiyor" : "🩹 Yaralı";
  setReportType(first);
}
export function markReportMap() {
  ensureReportMap();
}
export function useMyLocation() {
  ensureReportMap();
  locate((location) => setReportLocation(location, true), "reportCoords");
}
export function useSightingLocation() {
  locate((location) => setSightingLocation(location, true), "sightingCoords");
}

async function reportPhoto(input) {
  const file = input?.files?.[0];
  if (!file) return "";
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 720 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas
          .getContext("2d")
          .drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function reportPet() {
  if (reportSubject === "profile") return currentPet();
  const type = document.getElementById("otherPetType").value;
  return {
    ad:
      document.getElementById("otherPetName").value.trim() ||
      "Yardıma muhtaç hayvan",
    tur: type,
  };
}
export async function submitReport() {
  const detail = document.getElementById("reportDetail").value.trim();
  if (detail.length < 10) {
    toast("İlan detayını biraz daha açık yaz");
    return;
  }
  if (!reportLocation) {
    toast("Önce haritada bir konum işaretle");
    return;
  }
  const reports = loadLocalReports(),
    owner = actorId();
  if (!withinDailyLimit(reports, owner, 5)) {
    toast("24 saatte en fazla 5 demo ilan");
    return;
  }
  try {
    const pet = reportPet(),
      photo = await reportPhoto(document.getElementById("reportPhoto"));
    reports.unshift({
      id: Date.now(),
      ownerId: owner,
      type: reportType,
      status: "active",
      detail,
      ...reportLocation,
      photo,
      petName: pet.ad,
      petType: pet.tur,
      subject: reportSubject,
      sightings: [],
      flags: [],
      createdAt: new Date().toISOString(),
    });
    saveReports(reports);
    document.getElementById("reportDetail").value = "";
    document.getElementById("reportPhoto").value = "";
    if (reportSubject === "other")
      document.getElementById("otherPetName").value = "";
    renderReports();
    toast("Demo ilan bu tarayıcıya kaydedildi");
  } catch {
    saveFailed();
  }
}

export function startSighting(id) {
  const report = loadLocalReports().find(
    (report) => String(report.id) === String(id),
  );
  if (!report || report.status === "closed") return;
  if (report.ownerId === actorId()) {
    toast("Kendi ilanına ihbar gönderemezsin");
    return;
  }
  activeReportId = report.id;
  sightingLocation = { lat: report.lat, lng: report.lng };
  document.getElementById("sightingModal").classList.add("open");
  sightingMap ||= createMap(
    "sightingMap",
    sightingLocation,
    setSightingLocation,
  );
  sightingMap.setView([report.lat, report.lng], 15);
  sightingMarker = moveMarker(
    sightingMap,
    sightingMarker,
    sightingLocation,
    setSightingLocation,
  );
  pID("sightingCoords", `${report.lat.toFixed(5)}, ${report.lng.toFixed(5)}`);
  requestAnimationFrame(() => sightingMap.invalidateSize());
}
export function closeSighting() {
  document.getElementById("sightingModal").classList.remove("open");
  activeReportId = null;
}
export function setSightingType(button) {
  sightingType = button.dataset.type;
  document
    .querySelectorAll("#sightingType button")
    .forEach((item) => item.classList.toggle("on", item === button));
}
export async function submitSighting() {
  const reports = loadLocalReports(),
    report = reports.find(
      (report) => String(report.id) === String(activeReportId),
    );
  const detail = document.getElementById("sightingDetail").value.trim();
  if (!report || report.status === "closed") {
    toast("Bu ilan artık aktif değil");
    return;
  }
  const reporter = actorId();
  if (report.ownerId === reporter) {
    toast("Kendi ilanına ihbar gönderemezsin");
    return;
  }
  if (detail.length < 8 || !sightingLocation) {
    toast("Açıklama ve konum bilgisi gerekli");
    return;
  }
  const sightings = reports
    .flatMap((report) => report.sightings)
    .map((sighting) => ({ ...sighting, ownerId: sighting.reporterId }));
  if (!withinDailyLimit(sightings, reporter, 10)) {
    toast("24 saatte en fazla 10 demo ihbar");
    return;
  }
  try {
    const photo = await reportPhoto(document.getElementById("sightingPhoto"));
    report.sightings.push({
      id: Date.now(),
      reporterId: reporter,
      type: sightingType,
      status: "pending",
      detail,
      ...sightingLocation,
      photo,
      createdAt: new Date().toISOString(),
    });
    report.status = "pending"; // An observation alone must never close the report.
    saveReports(reports);
    document.getElementById("sightingDetail").value = "";
    document.getElementById("sightingPhoto").value = "";
    closeSighting();
    renderReports();
    toast("İhbar kaydedildi; ilan sahibinin onayı bekleniyor");
  } catch {
    saveFailed();
  }
}
export async function reviewSighting(reportId, sightingId, decision) {
  const reports = loadLocalReports(),
    report = reports.find((report) => String(report.id) === String(reportId));
  if (!report || report.ownerId !== actorId()) {
    toast("Bu işlemi yalnızca ilan sahibi yapabilir");
    return;
  }
  if (report.status === "closed" || !["confirm", "reject"].includes(decision))
    return;
  const sighting = report.sightings.find(
    (sighting) => String(sighting.id) === String(sightingId),
  );
  if (!sighting || sighting.status !== "pending") return;
  sighting.status = decision === "confirm" ? "confirmed" : "rejected";
  if (decision === "confirm") {
    report.status = "closed";
    report.closedAt = new Date().toISOString();
  } else
    report.status = report.sightings.some(
      (sighting) => sighting.status === "pending",
    )
      ? "pending"
      : "active";
  try {
    saveReports(reports);
    renderReports();
    toast(
      decision === "confirm"
        ? "İlan arşivlendi"
        : "İhbar eşleşmedi olarak işaretlendi",
    );
  } catch {
    saveFailed();
  }
}
export async function closeOwnReport(id) {
  const reports = loadLocalReports(),
    report = reports.find((report) => String(report.id) === String(id));
  if (!report || report.ownerId !== actorId()) {
    toast("İlanı yalnızca sahibi kapatabilir");
    return;
  }
  if (report.status === "closed") return;
  const message =
    report.type === "kayip"
      ? "Hayvanın bulunduğunu doğruluyor ve ilanı arşivlemek istiyor musun?"
      : "Hayvanın yardım aldığını doğruluyor ve ilanı arşivlemek istiyor musun?";
  if (!(await confirmArchive(message))) return;
  report.status = "closed";
  report.closedAt = new Date().toISOString();
  try {
    saveReports(reports);
    renderReports();
    toast("İlan kapatıldı ve arşivlendi");
  } catch {
    saveFailed();
  }
}
export async function flagReport(id) {
  const reports = loadLocalReports(),
    report = reports.find((report) => String(report.id) === String(id));
  if (!report) return;
  const reporter = actorId();
  if (report.flags.includes(reporter)) {
    toast("Bu ilanı daha önce bildirdin");
    return;
  }
  report.flags.push(reporter);
  try {
    saveReports(reports);
    toast("Demo şikâyet bu tarayıcıya kaydedildi; moderasyon bağlı değil");
  } catch {
    saveFailed();
  }
}

function sightingReviewHtml(report, sighting) {
  if (sighting.status !== "pending") return "";
  return `<div class="sighting-review"><div><b>${sighting.type === "buldum" ? "🤲 Güvende" : "👀 Görüldü"}</b><span>Sahip onayı bekliyor</span></div>
    ${sighting.photo ? `<img src="${escapeHtml(sighting.photo)}" alt="İhbar fotoğrafı">` : ""}
    <p>${escapeHtml(sighting.detail)}</p><a href="${mapLink(sighting.lat, sighting.lng)}" target="_blank" rel="noreferrer">📍 İhbar konumu</a>
    <div class="review-actions"><button onclick="reviewSighting(${inlineId(report.id)},${inlineId(sighting.id)},'reject')">Eşleşmiyor</button>
    <button class="confirm" onclick="reviewSighting(${inlineId(report.id)},${inlineId(sighting.id)},'confirm')">Evet, bu o</button></div></div>`;
}
export function renderReports() {
  const host = document.getElementById("reportList");
  if (!host) return;
  const reports = loadLocalReports();
  if (!reports.length) {
    host.innerHTML =
      '<div class="report-empty">Henüz bildirim yok. İlk konumlu demo ilanı oluşturabilirsin.</div>';
    return;
  }
  const owner = actorId();
  host.innerHTML = reports
    .map((report) => {
      const [label, emoji] = LABELS[report.type] || LABELS.kayip;
      const mine = report.ownerId === owner,
        closed = report.status === "closed";
      const pending = report.sightings.filter(
        (sighting) => sighting.status === "pending",
      );
      const state = closed ? "closed" : pending.length ? "pending" : "active";
      const stateLabel = closed
        ? "ARŞİVLENDİ"
        : pending.length
          ? "SAHİP ONAYI BEKLİYOR"
          : "AKTİF";
      const date = new Date(report.createdAt).toLocaleString("tr-TR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      return `<div class="report-card"><div class="report-card-head"><span class="report-status ${escapeHtml(report.type)}">${emoji} ${label}</span><small>${date}</small></div>
      <div class="report-state-row"><span class="report-state ${state}">${stateLabel}</span>${mine ? '<span class="owner-badge">SENİN İLANIN</span>' : ""}</div>
      ${report.photo ? `<img class="report-card-photo" src="${escapeHtml(report.photo)}" alt="İlan fotoğrafı">` : ""}
      <b>${typeEmoji(report.petType)} ${escapeHtml(report.petName)}</b><p>${escapeHtml(report.detail)}</p>
      <div class="report-links"><a href="${mapLink(report.lat, report.lng)}" target="_blank" rel="noreferrer">📍 Haritada aç</a>
      ${!mine ? `<button onclick="flagReport(${inlineId(report.id)})">⚑ Şikâyet</button>` : ""}</div>
      ${mine ? pending.map((sighting) => sightingReviewHtml(report, sighting)).join("") : ""}
      ${mine && !closed ? `<div class="owner-note">🔒 Bu ilanı yalnızca sen kapatabilirsin.</div><button class="report-action owner" onclick="closeOwnReport(${inlineId(report.id)})">${report.type === "kayip" ? "Bulundu, ilanı kapat" : "Yardım aldı, ilanı arşivle"}</button>` : ""}
      ${!mine && !closed ? `<button class="report-action" onclick="startSighting(${inlineId(report.id)})">👀 Gördüm / Buldum İhbarı</button>` : ""}</div>`;
    })
    .join("");
}
