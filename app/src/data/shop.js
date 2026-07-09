/* Pati Mağazası'ndaki aksesuar ve tema tanımları.
 * pos: 'head' | 'face' | 'neck' — aynı anda üçü de tek tek takılabilir (bağımsız slotlar).
 * pos: 'bg' — odanın arka plan temasını değiştirir (theme alanı game.css'teki .theme-* sınıfına karşılık gelir). */
export const SHOP = [
  { id: 'papyon', e: '🎀', ad: 'Papyon', f: 20, pos: 'neck' },
  { id: 'bandana', e: '🧣', ad: 'Bandana', f: 25, pos: 'neck' },
  { id: 'sapka', e: '🎩', ad: 'Şapka', f: 30, pos: 'head' },
  { id: 'gozluk', e: '🕶️', ad: 'Gözlük', f: 40, pos: 'face', lvl: 2 },
  { id: 'tac', e: '👑', ad: 'Taç', f: 60, pos: 'head', lvl: 3 },
  { id: 'kanat', e: '🦋', ad: 'Peri Kanadı', f: 80, pos: 'head', lvl: 4 },
  { id: 'kep', e: '🧢', ad: 'Kep', f: 35, pos: 'head' },
  { id: 'kravat', e: '👔', ad: 'Kravat', f: 30, pos: 'neck' },
  { id: 'zincir', e: '⛓️', ad: 'Zincir Kolye', f: 45, pos: 'neck', lvl: 2 },
  { id: 'koruyucu', e: '🥽', ad: 'Koruyucu Gözlük', f: 50, pos: 'face', lvl: 2 },
  { id: 'tema_plaj', e: '🏖️', ad: 'Plaj Teması', f: 70, pos: 'bg', lvl: 3, theme: 'plaj' },
  { id: 'tema_kar', e: '⛄', ad: 'Kar Teması', f: 70, pos: 'bg', lvl: 3, theme: 'kar' }
];
