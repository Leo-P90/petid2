// ---------- ACİL EKRANI ----------
// ponytail: örnek veri (İstanbul). Telefonlar DEMO — gerçek klinik bilgisi değil.
// Gerçek konum-bazlı liste için Google Places API + anahtar gerekir (ayrı iş).
const ACIL = [
  {
    ad: "Pati 7/24 Veteriner Kliniği",
    tur: "klinik",
    ic: "🩺",
    bg: "var(--red-soft)",
    adres: "Bağdat Cad. No:112, Kadıköy / İstanbul",
    tel: "902161112233",
    lat: 40.9805,
    lng: 29.0575,
    saat: "Saat bilgisi doğrulanmadı",
    indirim: false,
    ucretsiz: false,
  },
  {
    ad: "Boğaziçi Hayvan Hastanesi",
    tur: "hastane",
    ic: "🏥",
    bg: "var(--blue-soft)",
    adres: "Barbaros Bulvarı No:45, Beşiktaş / İstanbul",
    tel: "902122223344",
    lat: 41.0428,
    lng: 29.0075,
    saat: "Saat bilgisi doğrulanmadı",
    indirim: false,
    ucretsiz: false,
  },
  {
    ad: "Anadolu 24 Saat Veteriner",
    tur: "klinik",
    ic: "🩺",
    bg: "var(--red-soft)",
    adres: "Acıbadem Cad. No:8, Üsküdar / İstanbul",
    tel: "902163334455",
    lat: 41.0,
    lng: 29.043,
    saat: "Saat bilgisi doğrulanmadı",
    indirim: false,
    ucretsiz: false,
  },
  {
    ad: "Kadıköy Belediyesi Hayvan Barınağı",
    tur: "barinak",
    ic: "🏠",
    bg: "var(--green-soft)",
    adres: "Kuşdili Cad. No:20, Kadıköy / İstanbul",
    tel: "902164445566",
    lat: 40.9895,
    lng: 29.029,
    saat: "Saat bilgisi doğrulanmadı",
    indirim: false,
    ucretsiz: false,
  },
  {
    ad: "Şişli Belediyesi Geçici Hayvan Bakımevi",
    tur: "barinak",
    ic: "🏠",
    bg: "var(--green-soft)",
    adres: "Ayazağa Mah., Şişli / İstanbul",
    tel: "902125556677",
    lat: 41.108,
    lng: 29.018,
    saat: "Saat bilgisi doğrulanmadı",
    indirim: false,
    ucretsiz: false,
  },
];
const TUR_AD = {
  klinik: "Veteriner Kliniği",
  hastane: "Hayvan Hastanesi",
  barinak: "Belediye Barınağı",
};
const WA_MSG = encodeURIComponent(
  "Merhaba, acil bir durum var. Hasta/yaralı bir hayvanla ilgili yardım almak istiyorum.",
);
let acilKonumVar = false;

const kmHesap = (aLat, aLng, bLat, bLng) => {
  // Haversine
  const R = 6371,
    d = (x) => (x * Math.PI) / 180;
  const dLat = d(bLat - aLat),
    dLng = d(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(d(aLat)) * Math.cos(d(bLat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};
const mesafeYazi = (km) =>
  km == null
    ? ""
    : km < 1
      ? Math.round(km * 1000) + " m"
      : km.toFixed(1) + " km";

const acilRender = () => {
  const liste = ACIL.map((y) => ({ ...y })).sort(
    (a, b) => (a.km ?? 999) - (b.km ?? 999),
  );
  const el = document.getElementById("acilList");
  el.innerHTML =
    '<div style="font-size:10.5px;color:var(--gray);margin:2px 2px 10px;line-height:1.4">' +
    "ℹ️ Örnek veriler (İstanbul) — telefonlar örnektir. Gerçek acil durumda kendi bölgeni doğrula.</div>" +
    liste
      .map((y, i) => {
        const near = acilKonumVar && i === 0;
        const tags = [];
        if (y.ucretsiz)
          tags.push('<span class="acil-tag tag-free">ÜCRETSİZ</span>');
        if (y.indirim)
          tags.push(
            '<span class="acil-tag tag-disc">SOKAK HAYVANINA %20 İNDİRİM</span>',
          );
        tags.push(
          '<span class="acil-tag ' +
            (y.saat.includes("7/24") ? "tag-open" : "tag-hours") +
            '">' +
            y.saat +
            "</span>",
        );
        if (near)
          tags.unshift('<span class="acil-tag tag-near">EN YAKIN</span>');
        return (
          '<div class="acil-card' +
          (near ? " nearest" : "") +
          '" onclick="acilKart(this)">' +
          '<div class="acil-row">' +
          '<div class="acil-ic" style="background:' +
          y.bg +
          '">' +
          y.ic +
          "</div>" +
          '<div class="acil-info"><b>' +
          y.ad +
          "</b>" +
          '<div class="acil-meta">' +
          TUR_AD[y.tur] +
          "</div></div>" +
          (y.km != null
            ? '<div class="acil-dist">' +
              mesafeYazi(y.km) +
              "<small>uzaklık</small></div>"
            : "") +
          "</div>" +
          '<div class="acil-tags">' +
          tags.join("") +
          "</div>" +
          '<div class="acil-detail"><div class="acil-detail-in">' +
          '<div class="acil-addr">📍 ' +
          y.adres +
          "</div>" +
          '<div class="acil-acts">' +
          "<span>Demo iletişim bilgisi — arama kapalı</span>" +
          "</div>" +
          "</div></div>" +
          "</div>"
        );
      })
      .join("");
};

export const acilAc = () => {
  document.getElementById("acilOv").classList.add("open");
  acilRender();
};
export const acilKapat = () =>
  document.getElementById("acilOv").classList.remove("open");
export const acilKart = (card) => card.classList.toggle("open");
export const acilKonum = () => {
  const loc = document.getElementById("acilLoc");
  if (!navigator.geolocation) {
    loc.textContent = "⚠️ Tarayıcın konumu desteklemiyor";
    return;
  }
  loc.textContent = "📍 Konum alınıyor…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      ACIL.forEach(
        (y) =>
          (y.km = kmHesap(
            pos.coords.latitude,
            pos.coords.longitude,
            y.lat,
            y.lng,
          )),
      );
      acilKonumVar = true;
      loc.textContent = "✅ Konumuna göre sıralandı — en yakın üstte";
      acilRender();
    },
    () => {
      loc.textContent = "⚠️ Konum alınamadı — izin verip tekrar dene";
    },
    { timeout: 8000 },
  );
};
