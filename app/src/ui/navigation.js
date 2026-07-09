/* Ekranlar arası geçiş (alt nav + programatik go() çağrıları) */
export function go(s) {
  document.querySelectorAll('.screen').forEach(e => e.classList.remove('active'));
  document.getElementById('scr-' + s).classList.add('active');
  document.querySelectorAll('.nav button[data-s]').forEach(b => b.classList.toggle('on', b.dataset.s === s));
  document.getElementById('scr-' + s).scrollTop = 0;
}
