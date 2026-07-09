/* Ekranlar arası geçiş (alt nav + programatik go() çağrıları + geri yığını) */
let stack = [];
let current = 'home';

function show(s) {
  document.querySelectorAll('.screen').forEach(e => e.classList.remove('active'));
  document.getElementById('scr-' + s).classList.add('active');
  document.querySelectorAll('.nav button[data-s]').forEach(b => b.classList.toggle('on', b.dataset.s === s));
  document.getElementById('scr-' + s).scrollTop = 0;
}

export function go(s) {
  if (s !== current) stack.push(current);
  current = s;
  show(s);
}

export function goBack() {
  current = stack.pop() || 'home';
  show(current);
}
