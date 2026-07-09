import { petData, appState, petEmoji, pID } from '../state/store.js';
import { LESSONS, SCENE_MAP } from '../data/lessons.js';

/* --- eğitim sekmeleri --- */
export function egTab(t, chip) {
  document.querySelectorAll('#egChips .chip').forEach(c => c.classList.remove('on'));
  chip.classList.add('on');
  document.querySelectorAll('.eg-tab').forEach(d => d.style.display = 'none');
  const e = document.getElementById('tab-' + t); if (e) e.style.display = 'block';
}

/* ---------- görev listesi ---------- */
export function toggleTask(t) {
  t.classList.toggle('done');
  const done = document.querySelectorAll('#taskList .task.done').length,
        total = document.querySelectorAll('#taskList .task').length;
  pID('taskCount', done + '/' + total);
  pID('homeTaskTitle', done + ' / ' + total + ' görev tamamlandı');
  const hp = document.getElementById('homeProg'); if (hp) hp.style.width = (done / total * 100) + '%';
}

/* ---------- eğitim dersleri ---------- */
export function openLesson(id) {
  const L = LESSONS[id];
  pID('lTitle', L.t);
  document.getElementById('lMeta').innerHTML =
    '<span class="badge" style="background:var(--green-soft);color:var(--green)">' + L.lvl + '</span>' +
    '<span class="badge" style="background:var(--blue-soft);color:var(--blue)">🎬 ' + L.dk + ' animasyon</span>' +
    '<span class="badge" style="background:var(--amber-soft);color:var(--amber)">+20 🏆 puan</span>';
  pID('lDesc', L.desc);
  const ages = document.getElementById('lAges');
  if (L.yavru) {
    ages.style.display = 'grid';
    ages.innerHTML =
      '<div class="card" style="margin:0"><b style="font-size:12px;color:var(--ink)">🐣 Yavru</b><span style="font-size:11.5px;color:var(--gray);display:block;margin-top:3px;line-height:1.5">' + L.yavru + '</span></div>' +
      '<div class="card" style="margin:0"><b style="font-size:12px;color:var(--ink)">🐕 Yetişkin</b><span style="font-size:11.5px;color:var(--gray);display:block;margin-top:3px;line-height:1.5">' + L.yetiskin + '</span></div>' +
      '<div class="card" style="margin:0;grid-column:1/-1"><b style="font-size:12px;color:var(--ink)">🎒 Eğitim öncesi hazırlık</b><span style="font-size:11.5px;color:var(--gray);display:block;margin-top:3px;line-height:1.5">Sessiz ve güvenli ortam seç · sevilen küçük ödüller hazırla · seansları 3-5 dakikada tut · yorgun, korkmuş veya aşırı heyecanlıyken ara ver · tek seferde tek şey öğret.</span></div>';
  } else { ages.style.display = 'none'; ages.innerHTML = ''; }
  document.getElementById('lSteps').innerHTML = L.steps.map((s, i) => '<div class="step"><div class="no">' + (i + 1) + '</div><p>' + s + '</p></div>').join('');
  const vw = document.getElementById('lVarsWrap');
  if (L.vars) {
    vw.style.display = 'block';
    document.getElementById('lVars').innerHTML = L.vars.map(v => '<div class="step"><div class="no">?</div><p><b>' + v[0] + ':</b> ' + v[1] + '</p></div>').join('');
  } else vw.style.display = 'none';
  const tipEl = document.getElementById('lTip'), errEl = document.getElementById('lErr');
  if (L.kriter) {
    tipEl.innerHTML = '🎯 <b>Başarı kriteri:</b> ' + L.kriter +
      '<br>📅 <b>Günlük görev:</b> Bugün 2-4 kısa seans uygula (her biri 3-5 dk). Başarısız denemeyi büyütme; kolay seviyeye dön.' +
      '<br>🤖 <b>PETID kuralı:</b> Başarı yüksekse zorluğu küçük bir kademe artır; ortaysa aynı seviyede farklı ortam/ödülle tekrar et; düşükse bir önceki kademeye dön. Stres, korku, ağrı veya ani davranış değişimi varsa veteriner/uzman desteği al.';
    errEl.innerHTML = '⚠️ <b>Yapılmaması gerekenler:</b><br>• ' + L.yasak.join('<br>• ');
  } else {
    tipEl.textContent = L.tip; errEl.textContent = L.err;
  }
  buildStage(id);
  document.getElementById('lessonModal').classList.add('open');
}

function buildStage(id) {
  const st = document.getElementById('lStage');
  const L = LESSONS[id];
  if (L && L.video) { /* gerçek eğitim videosu */
    st.className = 'stage video';
    st.innerHTML = '<video controls autoplay muted loop playsinline src="' + L.video + '" style="width:100%;display:block;border-radius:18px" onerror="pixelSahne(\'' + id + '\')"></video>' +
      '<div style="text-align:center;font-size:9.5px;color:var(--gray);padding:5px 0 0">🎥 Eğitim videosu · ses için 🔊 simgesine dokun</div>';
    return;
  }
  pixelSahne(id);
}

export function pixelSahne(id) {
  const st = document.getElementById('lStage');
  id = SCENE_MAP[id] || id;
  st.className = 'stage st-' + id;
  const pe = petEmoji(), ad = petData[appState.curPet].ad;
  const scenes = {
    otur: '<div class="actor a-pet" style="left:42%;bottom:22px">' + pe + '</div>' +
         '<div class="actor a-hand" style="font-size:26px">🍖</div>' +
         '<div class="sbub" style="left:18px;top:16px;animation:bubM 6s infinite">“Otur!”</div>' +
         '<div class="actor" style="left:58%;top:56px;font-size:20px;opacity:0;animation:otStar 6s infinite">✨</div>',
    bekle: '<div class="actor a-pet" style="left:13%;bottom:22px">' + pe + '</div>' +
          '<div class="actor a-own" style="left:46%;bottom:20px">🧍</div>' +
          '<div class="actor a-hand" style="left:34%;top:48px;font-size:26px;opacity:0">✋</div>' +
          '<div class="sbub" style="left:16px;top:14px;animation:bubA 6s infinite">“Beklee...”</div>' +
          '<div class="sbub" style="left:30%;top:14px;animation:bubB 6s infinite">Aferin! 🍖</div>',
    gel: '<div class="actor a-pet" style="left:5%;bottom:22px">' + pe + '</div>' +
        '<div class="actor" style="right:11%;bottom:20px">🧍</div>' +
        '<div class="sbub" style="right:8%;top:16px;animation:bubA 6s infinite">“' + ad + ', Gel!”</div>' +
        '<div class="actor" style="right:20%;top:96px;font-size:24px;opacity:0;animation:bubB 6s infinite">🍖</div>',
    pati: '<div class="actor a-pet" style="left:26%;bottom:22px">' + pe + '</div>' +
         '<div class="actor a-hand" style="left:52%;top:16px;font-size:30px;opacity:0">🖐️</div>' +
         '<div class="actor a-paw" style="left:40%;top:104px;font-size:22px;opacity:0">🐾</div>' +
         '<div class="sbub" style="left:16px;top:14px;animation:bubA 6s infinite">“Pati!”</div>' +
         '<div class="actor" style="left:58%;top:62px;font-size:20px;opacity:0;animation:bubB 6s infinite">✨</div>',
    tuvalet: '<div class="actor" style="left:5%;bottom:22px;animation:glPet 6s ease-in-out infinite">' + pe + '</div>' +
         '<div class="actor" style="right:9%;bottom:20px">' + (petData[appState.curPet].tur === 'kedi' ? '🧺' : '🌳') + '</div>' +
         '<div class="sbub" style="left:16px;top:14px;animation:bubA 6s infinite">' + (petData[appState.curPet].tur === 'kedi' ? 'Kum kabı burada!' : 'Tuvalet vakti!') + '</div>' +
         '<div class="sbub" style="right:8%;top:14px;animation:bubB 6s infinite">Aferin! ✨🍖</div>',
    yatak: '<div class="actor" style="left:5%;bottom:22px;animation:glPet 6s ease-in-out infinite">' + pe + '</div>' +
         '<div class="actor" style="right:9%;bottom:20px;font-size:34px">🛏️</div>' +
         '<div class="sbub" style="left:16px;top:14px;animation:bubA 6s infinite">“Yatağına!”</div>' +
         '<div class="actor" style="right:14%;top:60px;font-size:20px;opacity:0;animation:bubB 6s infinite">💤</div>'
  };
  st.innerHTML = scenes[id] + '<div style="position:absolute;left:0;right:0;bottom:6px;text-align:center;font-size:9.5px;color:var(--gray)">🎬 animasyon otomatik tekrar eder</div>';
}

export function replayStage() {
  const st = document.getElementById('lStage'); const h = st.innerHTML; st.innerHTML = ''; void st.offsetWidth; st.innerHTML = h;
}
