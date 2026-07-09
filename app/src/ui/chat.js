import { answers, FOLLOW } from '../data/chat-answers.js';

let lastTopic = -1;

/* ---------- AI sohbet (bağlam hafızalı) ---------- */
export function ask(q) {
  const inp = document.getElementById('aiInput');
  const text = (q || inp.value).trim();
  if (!text) return;
  inp.value = '';
  const chat = document.getElementById('chat');
  chat.insertAdjacentHTML('beforeend', '<div class="bub me"></div>');
  chat.lastElementChild.textContent = text;
  const low = text.toLowerCase();
  const isFollow = FOLLOW.test(low) || (low.length < 28 && /(evet|denedim|yaptım|yaptim|olmuyor|yapamadım|yapamadim)/.test(low));
  let idx = answers.findIndex(p => p[0].some(k => low.includes(k)));
  let ans;
  if (idx < 0 && isFollow && lastTopic >= 0) idx = lastTopic;
  if (idx >= 0) {
    if ((isFollow || idx === lastTopic) && answers[idx][2]) ans = answers[idx][2];
    else ans = answers[idx][1];
    lastTopic = idx;
  } else {
    ans = 'Bunu birlikte çözelim. 🧠 Bana üç şey söyler misin: ne zamandır oluyor, günün hangi saatinde ve öncesinde ne değişti (yeni mama, ev, misafir)? Bu arada şu konularda detaylı bilgim var: miyavlama/havlama, patisini yalama, iştahsızlık, kum kabı sorunları, hırlama, ısırma, tüy dökümü, çok su içme, gece uyumama, tırmalama, eşya devirme.';
    lastTopic = -1;
  }
  setTimeout(() => {
    chat.insertAdjacentHTML('beforeend', '<div class="bub ai"></div>');
    chat.lastElementChild.textContent = ans;
    chat.scrollTop = chat.scrollHeight;
    chat.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 550);
}
