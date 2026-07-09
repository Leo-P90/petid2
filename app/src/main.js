/* PatiDost — giriş noktası.
 * Bu dosyanın TEK işi: modülleri içe aktarmak, ilk render'ı tetiklemek ve
 * index.html'deki mevcut onclick="..." niteliklerinin çağırabilmesi için
 * ilgili fonksiyonları window üzerine iğnelemek. Ekranların kendi mantığı
 * ui/ ve game/ altındaki modüllerde yaşıyor — bu dosyada iş mantığı YOK. */

import './styles/main.css';

import { authReady } from './state/store.js';

import { go } from './ui/navigation.js';
import { toast } from './ui/toast.js';
import { toggleTheme } from './ui/theme.js';
import { openAuth, authMode, togglePass, pickPetType, toggleAgree, submitAuth, signOut } from './ui/auth.js';
import { renderAll, setPet, openEdit, saveEdit, closeM } from './ui/profile.js';
import { fotoSec, fotoKaldir, fotoYok } from './ui/photo.js';
import { heroPetTap } from './ui/hero-pet.js';
import { homeSearch, haAct, haClose, scrollHome } from './ui/home-ai.js';
import { egTab, toggleTask, openLesson, replayStage, pixelSahne } from './ui/training.js';
import { sagJump, toggleVac } from './ui/health.js';
import { filtSrv, filtSrvKey, toggleSrv, renderAdoptions } from './ui/services.js';
import { openMatch, matchPass, matchLike, openMatchThread } from './ui/match.js';
import { ask } from './ui/chat.js';
import { renderMarket, filtMarket, buyProduct } from './ui/market.js';
import { openThread, closeThread, sendThreadMsg, renderConvoList } from './ui/messages.js';

import { gFeed, gPlay, gPet2, gSleep, gTalk } from './game/engine.js';
import { openShop, buyItem, wearItem } from './game/shop-ui.js';
import { openFlap, closeFlap, fTap } from './game/flappy.js';

Object.assign(window, {
  go, toast, toggleTheme,
  openAuth, authMode, togglePass, pickPetType, toggleAgree, submitAuth, signOut,
  setPet, openEdit, saveEdit, closeM,
  fotoSec, fotoKaldir, fotoYok,
  heroPetTap, homeSearch, haAct, haClose, scrollHome,
  egTab, toggleTask, openLesson, replayStage, pixelSahne,
  sagJump, toggleVac,
  filtSrv, filtSrvKey, toggleSrv,
  openMatch, matchPass, matchLike, openMatchThread,
  ask,
  gFeed, gPlay, gPet2, gSleep, gTalk,
  openShop, buyItem, wearItem,
  openFlap, closeFlap, fTap,
  filtMarket, buyProduct,
  openThread, closeThread, sendThreadMsg
});

await authReady;
renderAll();
renderAdoptions();
renderMarket('hepsi');
renderConvoList();
