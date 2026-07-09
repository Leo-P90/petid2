// Eski 16x17 pixel-art bitmap'lerini 2x çözünürlüğe (32x34) çıkarıp
// göz/burun/kulak/pati gibi noktalara ekstra detay pikselleri ekleyen üretici script.
// Çıktıyı sprites.js'e elle yapıştırıyoruz.

const CAT = [
"....o......o....","...obo....obo...","...obbo..obbo...","..obbbboobbbbo..",
"..obbbbbbbbbbo..","..obebbbbbbebo..","..obbblnnlbbbo..","..obbbllllbbbo..",
"...obbbbbbbbo...","..obbbbbbbbbboo.",".obbllllllllbobo",".obbllllllllbobo",
".obbllllllllboo.","..obbbbbbbbbbo..","..oboobbbboobo..","...oo.oooo.oo..."];

const DOG = [
"..oo........oo..",".obbo......obbo.",".obbboooooobbbo.",".obbbbbbbbbbbbo.",
".obbebbbbbbebbo.",".obbbbllllbbbbo.",".obbbblnnlbbbbo.","..obbblpplbbbo..",
"..obbbbbbbbbbo..",".obbbbbbbbbbbboo",".oblllllllllbobo",".oblllllllllboo.",
".oblllllllllbo..","..obbbbbbbbbbo..","..oboobbbboobo..","...oo.oooo.oo..."];

const CAT_W1 = [
"..........o...o.",".........obbobbo",".........obbbbbo","o........obbbebo",
"ob.......obblbno","ob.......obbbbo.",".oooooooobbbbbo.","obbbbbbbbbbbbo..",
"obbbllllllllbo..","obbbllllllllbo..",".obbbbbbbbbbbo..","..obo.....obo...",
"..obo.....obo...","..ooo.....ooo...","................","................"];
const CAT_W2 = [
"..........o...o.",".........obbobbo",".........obbbbbo","o........obbbebo",
"ob.......obblbno","ob.......obbbbo.",".oooooooobbbbbo.","obbbbbbbbbbbbo..",
"obbbllllllllbo..","obbbllllllllbo..",".obbbbbbbbbbbo..","...obo...obo....",
"...obo...obo....","...ooo...ooo....","................","................"];
const DOG_W1 = [
"................",".........oooooo.",".........obbbbbo","o........oobbebo",
"ob.......oobblno","ob.......obbbbo.",".oooooooobbbbbo.","obbbbbbbbbbbbo..",
"obbbllllllllbo..","obbbllllllllbo..",".obbbbbbbbbbbo..","..obo.....obo...",
"..obo.....obo...","..ooo.....ooo...","................","................"];
const DOG_W2 = [
"................",".........oooooo.",".........obbbbbo","o........oobbebo",
"ob.......oobblno","ob.......obbbbo.",".oooooooobbbbbo.","obbbbbbbbbbbbo..",
"obbbllllllllbo..","obbbllllllllbo..",".obbbbbbbbbbbo..","...obo...obo....",
"...obo...obo....","...ooo...ooo....","................","................"];

// Her karakteri 2x2 bloğa çıkarır (satır+sütun ikileme).
function upscale2x(rows) {
  const out = [];
  for (const row of rows) {
    let doubled = '';
    for (const ch of row) doubled += ch + ch;
    out.push(doubled, doubled);
  }
  return out;
}

// grid: string[] -> 2D char array (mutable)
function toGrid(rows) { return rows.map(r => r.split('')); }
function toRows(grid) { return grid.map(r => r.join('')); }

function set(grid, r, c, ch) { if (grid[r] && grid[r][c] !== undefined && grid[r][c] !== '.') grid[r][c] = ch; }
function setForce(grid, r, c, ch) { if (grid[r] && grid[r][c] !== undefined) grid[r][c] = ch; }

// idle (front-facing) sprite: kulak/göz/burun bölgesine detay ekle.
// Kaynak koordinatlar eski 16 genişlik * 2 = yeni 32 genişlik üzerinden.
function detailIdle(rows, earColsOld, eyeColsOld) {
  const g = toGrid(rows);
  // kulak iç gölgesi (ear tip'in bir alt satırına 'i')
  for (const ec of earColsOld) {
    const r = 2 * 2, c = ec * 2; // row2 old * 2
    setForce(g, r, c, 'i'); setForce(g, r, c + 1, 'i');
  }
  // göz: eski 'e' hücresi artık 2x2 'e' blok oldu -> sol-üst pikseli koyu pupil, sağ-alt highlight
  for (let r = 0; r < g.length; r++) {
    for (let c = 0; c < g[r].length; c++) {
      if (g[r][c] === 'e') {
        // sadece blok başlangıcında (çift index) bir kere işleyelim
      }
    }
  }
  for (const ec of eyeColsOld) {
    const r = 5 * 2, c = ec * 2;
    setForce(g, r, c, 'd'); setForce(g, r, c + 1, 'e');
    setForce(g, r + 1, c, 'e'); setForce(g, r + 1, c + 1, 'h');
  }
  // burun: 'n' bloklarından ilkine highlight
  let noseDone = false;
  for (let r = 0; r < g.length; r++) for (let c = 0; c < g[r].length; c++) {
    if (g[r][c] === 'n' && !noseDone) { setForce(g, r, c, 'h'); noseDone = true; }
  }
  return toRows(g);
}

function detailWalk(rows, earColOld, eyeColOld) {
  const g = toGrid(rows);
  const er = 0 * 2, ec = earColOld * 2;
  setForce(g, er, ec, 'i'); setForce(g, er, ec + 1, 'i');
  const eyr = 3 * 2, eyc = eyeColOld * 2;
  setForce(g, eyr, eyc, 'd'); setForce(g, eyr, eyc + 1, 'e');
  setForce(g, eyr + 1, eyc, 'e'); setForce(g, eyr + 1, eyc + 1, 'h');
  let noseDone = false;
  for (let r = 0; r < g.length; r++) for (let c = 0; c < g[r].length; c++) {
    if (g[r][c] === 'n' && !noseDone) { setForce(g, r, c, 'h'); noseDone = true; }
  }
  return toRows(g);
}

const CAT2 = detailIdle(upscale2x(CAT), [4, 11], [4, 11]);
const DOG2 = detailIdle(upscale2x(DOG), [3, 12], [4, 11]);
const CAT_W1_2 = detailWalk(upscale2x(CAT_W1), 10, 13);
const CAT_W2_2 = detailWalk(upscale2x(CAT_W2), 10, 13);
const DOG_W1_2 = detailWalk(upscale2x(DOG_W1), 10, 13);
const DOG_W2_2 = detailWalk(upscale2x(DOG_W2), 10, 13);

function fmt(name, rows) {
  const body = rows.map(r => JSON.stringify(r)).join(',\n  ');
  return `export const ${name} = [\n  ${body}\n];`;
}

console.log(fmt('CAT', CAT2));
console.log();
console.log(fmt('DOG', DOG2));
console.log();
console.log(fmt('CAT_W1', CAT_W1_2));
console.log();
console.log(fmt('CAT_W2', CAT_W2_2));
console.log();
console.log(fmt('DOG_W1', DOG_W1_2));
console.log();
console.log(fmt('DOG_W2', DOG_W2_2));
