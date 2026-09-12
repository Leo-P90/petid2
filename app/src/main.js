import "./styles/main.css";
import { authReady } from "./state/store.js";
import { go, goBack } from "./ui/navigation.js";
import { toast } from "./ui/toast.js";
import { toggleTheme, initTheme } from "./ui/theme.js";
import * as auth from "./ui/auth.js";
import * as profile from "./ui/profile.js";
import { fotoSec, fotoKaldir, fotoYok } from "./ui/photo.js";
import { sagJump, toggleVac } from "./ui/health.js";
import { openSrvCategory, renderAdoptions } from "./ui/services.js";
import {
  openMatch,
  matchPass,
  matchLike,
  openMatchThread,
} from "./ui/match.js";
import {
  openThread,
  closeThread,
  sendThreadMsg,
  renderConvoList,
} from "./ui/messages.js";
import * as reports from "./ui/reports.js";
import * as emergency from "./ui/emergency.js";
import {
  initHealthRecords,
  openVetPanel,
  closeVetPanel,
  togglePrescriptionFields,
} from "./ui/health-records.js";
Object.assign(window, {
  go,
  goBack,
  toast,
  toggleTheme,
  ...auth,
  ...profile,
  fotoSec,
  fotoKaldir,
  fotoYok,
  sagJump,
  toggleVac,
  openSrvCategory,
  openMatch,
  matchPass,
  matchLike,
  openMatchThread,
  openThread,
  closeThread,
  sendThreadMsg,
  ...reports,
  ...emergency,
  openVetPanel,
  closeVetPanel,
  togglePrescriptionFields,
});
await authReady;
initTheme();
profile.renderAll();
renderAdoptions();
renderConvoList();
initHealthRecords();
const home = document.getElementById("scr-home");
const h = new Date().getHours();
home.dataset.time =
  h < 6
    ? "gece"
    : h < 12
      ? "sabah"
      : h < 18
        ? "ogle"
        : h < 22
          ? "aksam"
          : "gece";
