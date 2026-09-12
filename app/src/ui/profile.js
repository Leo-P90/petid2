import {
  petData,
  appState,
  saveAll,
  addPet,
  petEmoji,
  yas,
  pID,
} from "../state/store.js";
import { updateBigFoto, fotoPrevGoster, photoState } from "./photo.js";
import { updateMatchBadge } from "./match.js";
import { renderTimeline } from "./health-records.js";
import { escapeHtml } from "./safe-html.js";

const TEXT_FIELDS = ["ad", "cins", "dogum", "kilo", "cip", "kan", "alerji"];
let addMode = false;
export function closeM(id) {
  document.getElementById(id)?.classList.remove("open");
}
export function setPet(index) {
  if (!Number.isInteger(index) || !petData[index]) return;
  appState.curPet = index;
  renderAll();
}
export function renderAll() {
  const pet = petData[appState.curPet];
  if (!pet) return;
  document
    .querySelectorAll(".avatar")
    .forEach((avatar) => (avatar.textContent = petEmoji()));
  const mini = document.getElementById("mp0");
  if (mini) {
    mini.textContent = petEmoji();
    mini.title = pet.ad;
  }
  updateBigFoto();
  pID("homeGreeting", `Demo — ${pet.ad} için bugün ne yapalım?`);
  pID("subSag", `${pet.ad}'un sağlık takibi`);
  pID("pAvatar", petEmoji());
  pID("pName", pet.ad);
  pID(
    "pMeta",
    `${pet.cins} ${pet.tur === "kedi" ? "Kedi" : "Köpek"} · ${pet.cinsiyet} · ${yas(pet.dogum)}`,
  );
  pID("pBirth", pet.dogum ? pet.dogum.split("-").reverse().join(".") : "—");
  pID("pChip", pet.cip || "—");
  pID("pBlood", pet.kan || "—");
  pID("pNeuter", pet.kisir);
  pID("pKilo", pet.kilo ? `${pet.kilo} kg` : "—");
  pID("pAlerji", pet.alerji || "—");
  const gallery = document.getElementById("petPhotos");
  const photos = pet.fotolar?.length ? pet.fotolar : pet.foto ? [pet.foto] : [];
  if (gallery)
    gallery.innerHTML = photos
      .map(
        (photo, index) =>
          `<div class="ph"><img src="${escapeHtml(photo)}" alt="${escapeHtml(pet.ad)} fotoğrafı ${index + 1}" loading="lazy"></div>`,
      )
      .join("");
  renderPetSwitch();
  updateMatchBadge();
  renderTimeline();
}
function renderPetSwitch() {
  const host = document.getElementById("petSwitch");
  if (!host) return;
  host.innerHTML =
    petData
      .map(
        (pet, index) =>
          `<button type="button" class="pet-pill${index === appState.curPet ? " on" : ""}" onclick="setPet(${index})"><span class="pp-emoji">${pet.tur === "kedi" ? "🐱" : "🐶"}</span><span><b>${escapeHtml(pet.ad)}</b><span>${pet.tur === "kedi" ? "Kedi" : "Köpek"}</span></span></button>`,
      )
      .join("") +
    '<button type="button" class="pet-pill add" onclick="openAddPet()"><span class="pp-emoji">➕</span><b>Yeni Ekle</b></button>';
}
function fillForm(pet) {
  TEXT_FIELDS.forEach(
    (field) => (document.getElementById("f_" + field).value = pet[field] || ""),
  );
  document.getElementById("f_tur").value = pet.tur || "kedi";
  document.getElementById("f_cinsiyet").value = pet.cinsiyet || "Dişi";
  document.getElementById("f_kisir").value = pet.kisir || "Hayır";
  photoState.temp = undefined;
  const input = document.getElementById("f_foto");
  if (input) input.value = "";
  fotoPrevGoster(pet.fotolar?.length ? pet.fotolar : pet.foto || "");
}
export function openEdit() {
  addMode = false;
  fillForm(petData[appState.curPet]);
  pID("editTitle", "Profili Düzenle ✏️");
  pID("editSaveBtn", "Kaydet");
  document.getElementById("editModal").classList.add("open");
}
export function openAddPet() {
  addMode = true;
  fillForm({});
  pID("editTitle", "Yeni Hayvan Ekle 🐾");
  pID("editSaveBtn", "Ekle");
  document.getElementById("editModal").classList.add("open");
}
export async function saveEdit() {
  const fields = {};
  TEXT_FIELDS.forEach(
    (field) => (fields[field] = document.getElementById("f_" + field).value),
  );
  fields.tur = document.getElementById("f_tur").value;
  fields.cinsiyet = document.getElementById("f_cinsiyet").value;
  fields.kisir = document.getElementById("f_kisir").value;
  if (photoState.temp !== undefined) {
    fields.fotolar = photoState.temp.filter(Boolean);
    fields.foto = fields.fotolar[0] || "";
  }
  if (addMode) await addPet(fields);
  else {
    Object.assign(petData[appState.curPet], fields);
    await saveAll();
  }
  renderAll();
  closeM("editModal");
}
