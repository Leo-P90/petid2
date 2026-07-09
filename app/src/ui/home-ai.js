import { petData, appState, el } from '../state/store.js';
import { answers } from '../data/chat-answers.js';
import { LESSONS } from '../data/lessons.js';
import { go } from './navigation.js';
import { ask } from './chat.js';
import { openLesson } from './training.js';
import { filtSrvKey } from './services.js';
import { openMatch } from './match.js';

export function escHtml(s) { return s.replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function temiz(s) { return s.replace(/<[^>]+>/g, ''); }

function aiBrain(qRaw) {
  const q = qRaw.toLowerCase(), p = petData[appState.curPet];
  /* 1) davranış veritabanı (AI sohbetle aynı bilgi) */
  for (const [keys, a] of answers) {
    if (keys.some(k => q.includes(k)))
      return { text: a, acts: [['🤖 AI sohbetinde devam', function () { go('ai'); ask(qRaw); }], ['🩺 Sağlık', function () { go('saglik'); }]] };
  }
  /* 2) eğitim kademeleri */
  const EGT = [[['ismini', 'isim öğren', 'adını'], 'k1'], [['dikkat', 'göz temas'], 'k3'], [['otur'], 'k4'], [['bekle'], 'k5'], [['yat'], 'k6'], [['pati'], 'k7'], [['bırak', 'birak'], 'k8'], [['hayır', 'olmaz', 'yaramaz'], 'k9'], [['tuvalet', 'çiş', 'kum kabı eğit'], 'k10'], [['tasma', 'çekiştir', 'yürüyüş eğit'], 'k11'], [['dikkat dağıt', 'parkta gel'], 'k12'], [['gel komutu', 'gelmeyi', 'çağır'], 'k2']];
  for (const [keys, id] of EGT) {
    if (keys.some(k => q.includes(k))) {
      const L = LESSONS[id];
      return {
        text: '<b>' + L.t + '</b> tam sana göre! ' + L.desc + '<br><b>İlk adım:</b> ' + temiz(L.steps[0]),
        acts: [['🎓 Dersi aç', function () { openLesson(id); }], ['Tüm program', function () { go('egitim'); }]]
      };
    }
  }
  /* 3) sağlık */
  if (/(\başı|\bası takvim|parazit|\bilaç|\bilac)/.test(q))
    return { text: p.ad + "'un aşı takvimi Sağlık bölümünde: Karma ve parazit uygulamaları yapıldı, <b>Kuduz aşısı 12 Temmuz'da</b>. İlaç hatırlatıcılarını da oradan yönetebilirsin.", acts: [['🩺 Sağlığı aç', function () { go('saglik'); }]] };
  if (/(kilo|beslenme|mama miktar|kaç gram|su iç)/.test(q))
    return { text: p.ad + ' şu an <b>' + p.kilo + ' kg</b> ve ideal aralıkta. Günlük beslenme planı: 2 öğün, ödül maması günlük kalorinin en fazla %10\'u. Detaylar Sağlık > Beslenme Planında.', acts: [['🍽️ Beslenme planı', function () { go('saglik'); }]] };
  if (/(hasta|kus|ishal|belirti|ağrı|agri)/.test(q))
    return { text: 'Belirtileri önemsiyorum. Sana ilk değerlendirme için AI Sağlık Rehberini önereyim — ama unutma, ciddi/süren belirtilerde en doğru adres veterinerdir. 🩺', acts: [['🤖 AI Sağlık Rehberi', function () { go('ai'); ask(qRaw); }], ['🧑‍⚕️ Veteriner bul', function () { go('hizmet'); filtSrvKey('vet'); }]] };
  /* 4) hizmetler */
  if (/(veteriner|klinik)/.test(q)) return { text: 'Çevrende 3 veteriner buldum. En yakını <b>Pati Veteriner Kliniği</b> (850 m, ★4.9, 7/24 acil).', acts: [['🧑‍⚕️ Listeyi gör', function () { go('hizmet'); filtSrvKey('vet'); }]] };
  if (/(kuaför|kuafor|tıraş|tiras|yıkama|bakım)/.test(q)) return { text: 'İki pet kuaförü var: <b>Tüylü Dostlar</b> (evden alma servisli, ★4.9) ve <b>Pati SPA</b> (kedi dostu sessiz salon).', acts: [['✂️ Kuaförleri gör', function () { go('hizmet'); filtSrvKey('kuafor'); }]] };
  if (/(otel|pansiyon|tatil)/.test(q)) return { text: '<b>Mutlu Patiler Pet Oteli</b> kameralı odalarıyla 2.1 km uzakta (★4.8). Tatile gönül rahatlığıyla çık!', acts: [['🏨 Otelleri gör', function () { go('hizmet'); filtSrvKey('otel'); }]] };
  if (/(gezdirici|yürüteç|yürüyüşe çıkar)/.test(q)) return { text: 'Köpek gezdiricileri listeliyorum — Mert K. hafta içi her gün 45 dk tur yapıyor (★4.7).', acts: [['🦮 Gezdiricileri gör', function () { go('hizmet'); filtSrvKey('gez'); }]] };
  if (/(sahiplen|yuva)/.test(q)) return { text: 'Yuva arayan 4 can dostu var: Minnoş, Karabaş, Gece ve Pamuk. 🏡', acts: [['❤️ Sahiplendirme', function () { go('hizmet'); }]] };
  if (/(eş bul|eşleş|çiftleş|match|tinder)/.test(q)) return { text: 'PatiMatch ile ' + p.ad + ' için uyumlu adaylar bulabiliriz — kediler kedilerle, köpekler köpeklerle eşleşir. 💘', acts: [['💘 PatiMatch aç', function () { go('match'); openMatch(); }]] };
  /* 5) uygulama içi */
  if (/(oyun|pixel)/.test(q)) return { text: 'Pixel ' + p.ad + ' seni bekliyor! Besle, oyna, Pati Uçuşu ile 🪙 kazan ve mağazadan aksesuar al. 🎮', acts: [['🎮 Oyunu aç', function () { go('oyun'); }]] };
  if (/(eğitim|egitim|ders|komut|program)/.test(q)) return { text: 'Eğitim bölümünde 12 kademelik PETID Temel Eğitim müfredatı, kedi programı, zeka oyunları ve antrenman planı var. Nereden başlamak istersin?', acts: [['🎓 Eğitimi aç', function () { go('egitim'); }], ['1. Kademeden başla', function () { openLesson('k1'); }]] };
  if (/(merhaba|selam|naber|nasılsın)/.test(q)) return { text: 'Merhaba Leo! 👋 Ben PETID AI. ' + p.ad + ' hakkında her şeyi sorabilirsin: davranışlar, eğitim, sağlık, çevrendeki hizmetler...', acts: [['Örnek: patisini yalıyor', function () { el('homeQ').value = 'Patisini yalıyor'; homeSearch(); }]] };
  if (/(teşekkür|tesekkur|sağol|sagol)/.test(q)) return { text: 'Rica ederim! ' + p.ad + ' adına pati sallıyorum 🐾 Başka bir şey olursa buradayım.', acts: [] };
  /* 6) genel fallback */
  return {
    text: 'Bunu tam çözemedim ama AI sohbetinde detaylı konuşabiliriz. 💭 Şunları da deneyebilirsin: "otur komutu nasıl öğretilir", "aşı takvimi", "yakında kuaför var mı", "sürekli miyavlıyor".',
    acts: [['🤖 AI sohbetinde sor', function () { go('ai'); ask(qRaw); }]]
  };
}

let _haActs = [];
export function haAct(i) { if (_haActs[i]) _haActs[i][1](); }
export function haClose() { el('homeAns').style.display = 'none'; }

export function homeSearch(ev) {
  if (ev) ev.preventDefault();
  const q = el('homeQ').value.trim(); if (!q) return;
  el('homeQ').value = '';
  const box = el('homeAns');
  box.style.display = 'block';
  box.innerHTML = '<div class="ha-head">🤖 PETID AI</div><div class="ha-body ha-dots">Düşünüyorum...</div>';
  const b = el('hBub');
  if (b) { b.textContent = 'Hemen bakıyorum! 🔍'; b.style.left = Math.max(4, Math.min(parseFloat(document.getElementById('hCanvas').style.left || '230') - 40, 240)) + 'px'; b.style.right = 'auto'; b.classList.add('show'); clearTimeout(b._t); b._t = setTimeout(function () { b.classList.remove('show'); }, 1800); }
  setTimeout(function () {
    const r = aiBrain(q); _haActs = r.acts || [];
    box.innerHTML = '<div class="ha-head">🤖 PETID AI <a onclick="haClose()">✕</a></div>' +
      '<div class="ha-q">“' + escHtml(q) + '”</div>' +
      '<div class="ha-body">' + r.text + '</div>' +
      (_haActs.length ? '<div class="ha-acts">' + _haActs.map(function (a, i) { return '<button class="chip" onclick="haAct(' + i + ')">' + a[0] + '</button>'; }).join('') + '</div>' : '');
  }, 700);
}

export function scrollHome() { document.getElementById('scr-home').scrollTo({ top: 420, behavior: 'smooth' }); }
document.getElementById('scr-home').addEventListener('scroll', function () {
  const b = document.getElementById('homeBelow');
  if (b) b.classList.toggle('reveal', this.scrollTop > 40);
});
