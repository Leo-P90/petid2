/* Pixel oyunu hedefleri — check(g, lvl) true dönünce bir kereliğine ödül verilir. */
export const GOALS = [
  { id: 'g1', ad: 'İlk Büyüme', desc: "Seviye 2'ye ulaş", reward: 20, check: (g, lvl) => lvl >= 2 },
  { id: 'g2', ad: 'Alışverişe Başla', desc: 'Mağazadan 1 ürün al', reward: 15, check: g => (g.items || []).length >= 1 },
  { id: 'g3', ad: 'Mutlu Dost', desc: "Mutluluğu %90'a çıkar", reward: 15, check: g => g.mut >= 90 },
  { id: 'g4', ad: 'Uçuş Ustası', desc: "Pati Uçuşu'nda 10 puan yap", reward: 25, check: g => (g.flappyBest || 0) >= 10 },
  { id: 'g5', ad: 'Efsane Dost', desc: "Seviye 5'e ulaş", reward: 50, check: (g, lvl) => lvl >= 5 }
];
