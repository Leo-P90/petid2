import { ADOPTIONS } from "../data/adoptions.js";
import { acilAc } from "./emergency.js";
export function openSrvCategory() {
  acilAc();
}
export function renderAdoptions() {
  const host = document.getElementById("adoptList");
  if (!host) return;
  host.innerHTML =
    "<p>Örnek sahiplendirme kartları — gerçek ilan/başvuru sistemi bağlı değil.</p>" +
    ADOPTIONS.map(
      (pet) =>
        '<div class="ad-card"><div class="ad-img"><img src="' +
        pet.foto +
        '" alt="' +
        pet.ad +
        '" loading="lazy"></div><div class="ad-body"><b>' +
        pet.ad +
        "</b><span>" +
        pet.meta +
        "</span></div></div>",
    ).join("");
}
