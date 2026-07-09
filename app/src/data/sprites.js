/* pixel sprite bitmap tanımları — kedi/köpek, duruş + yürüyüş kareleri */
export const CAT = [
"....o......o....","...obo....obo...","...obbo..obbo...","..obbbboobbbbo..",
"..obbbbbbbbbbo..","..obebbbbbbebo..","..obbblnnlbbbo..","..obbbllllbbbo..",
"...obbbbbbbbo...","..obbbbbbbbbboo.",".obbllllllllbobo",".obbllllllllbobo",
".obbllllllllboo.","..obbbbbbbbbbo..","..oboobbbboobo..","...oo.oooo.oo..."];

export const DOG = [
"..oo........oo..",".obbo......obbo.",".obbboooooobbbo.",".obbbbbbbbbbbbo.",
".obbebbbbbbebbo.",".obbbbllllbbbbo.",".obbbblnnlbbbbo.","..obbblpplbbbo..",
"..obbbbbbbbbbo..",".obbbbbbbbbbbboo",".oblllllllllbobo",".oblllllllllboo.",
".oblllllllllbo..","..obbbbbbbbbbo..","..oboobbbboobo..","...oo.oooo.oo..."];

/* yandan görünüm — yürüyüş kareleri (sağa bakar, sola giderken aynalanır) */
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

export const CAT_WALK = [CAT_W1, CAT_W2];
export const DOG_WALK = [DOG_W1, DOG_W2];

export const PALS = {
  gri: { b: '#98A5B3', l: '#D9E0E9', o: '#39414E' },
  turuncu: { b: '#E8913A', l: '#F8D9AC', o: '#7A4414' },
  siyah: { b: '#454B55', l: '#8E97A5', o: '#1E2229' },
  beyaz: { b: '#EDE9E1', l: '#FFFFFF', o: '#8C857A' },
  altin: { b: '#D9A441', l: '#F3DCA8', o: '#7C5A1E' },
  kahve: { b: '#8B5E3C', l: '#C9A177', o: '#4A2E17' }
};

export const STAGE_NAMES = ['Minik Yavru', 'Yavru', 'Genç', 'Yetişkin', 'Efsane Dost'];
