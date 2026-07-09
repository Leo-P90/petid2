/* Pixel sprite'ı canvas'a çizen tek düşük seviyeli fonksiyon — pixel oyun ekranı,
   ana sayfa hero pet'i ve Pati Uçuşu mini oyunu bunu paylaşır. */
export function drawSpr(ctx, spr, pal, px, ox, oy, flip, closed) {
  const cols = { o: pal.o, b: pal.b, l: pal.l, e: closed ? pal.b : '#20242B', n: '#E0787D', p: '#E89AA6' };
  spr.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = row[x];
      if (c === '.') continue;
      ctx.fillStyle = cols[c] || pal.b;
      ctx.fillRect(ox + (flip ? 15 - x : x) * px, oy + y * px, px, px);
    }
  });
}
