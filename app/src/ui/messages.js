import { el, pID } from '../state/store.js';
import { openerFor, AUTO_REPLIES } from '../data/message-templates.js';

/* ad -> { candidate, messages:[{from:'me'|'them', text}], unread } */
const conversations = new Map();
let replyIdx = 0;
let activeThread = null;

export function startConversation(c) {
  if (conversations.has(c.ad)) return;
  conversations.set(c.ad, { candidate: c, messages: [{ from: 'them', text: openerFor(c) }], unread: true });
  renderConvoList();
  updateMsgBadge();
}

export function renderConvoList() {
  const host = el('msgList'); if (!host) return;
  const list = [...conversations.values()];
  if (!list.length) {
    host.innerHTML = '<div class="m-empty" style="height:auto;padding:44px 20px;margin-top:10px">Henüz mesajın yok 💬<br><span style="font-size:12px;font-weight:600">Bir eşleşme olduğunda sohbet burada başlar.</span></div>';
    return;
  }
  host.innerHTML = list.map(conv => {
    const last = conv.messages[conv.messages.length - 1];
    return '<div class="msg-row" onclick="openThread(\'' + conv.candidate.ad + '\')">' +
      '<div class="msg-avatar"><img src="' + conv.candidate.foto + '" alt="' + conv.candidate.ad + '"></div>' +
      '<div class="msg-body"><b>' + conv.candidate.ad + '</b><span>' + last.text + '</span></div>' +
      (conv.unread ? '<span class="msg-dot"></span>' : '') +
      '</div>';
  }).join('');
}

export function updateMsgBadge() {
  const n = [...conversations.values()].filter(c => c.unread).length;
  const b = el('msgBadge'); if (!b) return;
  b.style.display = n > 0 ? 'flex' : 'none';
  b.textContent = n;
}

export function openThread(ad) {
  const conv = conversations.get(ad); if (!conv) return;
  conv.unread = false;
  activeThread = ad;
  updateMsgBadge(); renderConvoList();
  pID('threadName', conv.candidate.ad);
  const img = el('threadAvatar'); if (img) img.src = conv.candidate.foto;
  renderThreadMessages(conv);
  el('msgThreadModal').classList.add('open');
}

/* PatiMatch eşleşme pop-up'ındaki "Mesaj Gönder" — konuşma yoksa oluşturur. */
export function openMatchThreadFor(c) {
  startConversation(c);
  el('matchPop').classList.remove('open');
  openThread(c.ad);
}

function renderThreadMessages(conv) {
  const box = el('threadChat'); if (!box) return;
  box.innerHTML = '';
  conv.messages.forEach(m => {
    const b = document.createElement('div');
    b.className = 'bub ' + (m.from === 'me' ? 'me' : 'ai');
    b.textContent = m.text;
    box.appendChild(b);
  });
  box.scrollTop = box.scrollHeight;
}

export function sendThreadMsg(q) {
  const conv = conversations.get(activeThread); if (!conv) return;
  const inp = el('threadInput');
  const text = (q || inp.value).trim(); if (!text) return;
  inp.value = '';
  conv.messages.push({ from: 'me', text });
  renderThreadMessages(conv);
  setTimeout(() => {
    conv.messages.push({ from: 'them', text: AUTO_REPLIES[replyIdx % AUTO_REPLIES.length] });
    replyIdx++;
    renderThreadMessages(conv);
  }, 700);
}

export function closeThread() {
  el('msgThreadModal').classList.remove('open');
  activeThread = null;
  renderConvoList();
}
