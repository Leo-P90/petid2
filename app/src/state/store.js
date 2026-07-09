/* Uygulama durumu (state) katmanı.
 * İki mod var:
 *  - Misafir modu: oturum açılmadıysa veri localStorage'da tutulur (eski davranış,
 *    "kaydolmadan da keşfedebilirsin" vaadini korur).
 *  - Oturum modu: kullanıcı giriş/kayıt olduysa petData/gameStates Supabase'den
 *    hidratlanır ve saveAll() DB'ye yazar.
 * UI katmanı hep aynı şekilde petData/gameStates/appState.curPet üzerinden okur —
 * hangi modda olduğumuzu bilmesi gerekmez. */

import { supabase } from './supabase-client.js';

let store = {};
try { store = JSON.parse(localStorage.getItem('patidost') || '{}'); } catch (e) {}

export const petData = store.pets || [
  { ad: 'Boncuk', tur: 'kedi', cins: 'Tekir', cinsiyet: 'Dişi', dogum: '2024-05-15', kilo: '4.2', cip: 'TR-90-2647-8812', kan: 'A', kisir: 'Evet', alerji: 'Yok', renk: 'gri' },
  { ad: 'Zeytin', tur: 'kopek', cins: 'Golden Retriever', cinsiyet: 'Erkek', dogum: '2023-03-10', kilo: '28', cip: 'TR-90-1103-4471', kan: 'DEA 1.1+', kisir: 'Evet', alerji: 'Tavuk proteini', renk: 'altin' }
];

export const gameStates = store.game || [
  { tok: 82, mut: 74, enj: 90, xp: 12 },
  { tok: 70, mut: 80, enj: 65, xp: 34 }
];
gameStates.forEach(g => {
  if (g.coin === undefined) g.coin = 15;
  if (!g.items) g.items = [];
  if (!g.worn || typeof g.worn !== 'object') g.worn = {};
  if (!g.claimedGoals) g.claimedGoals = [];
});

export const appState = { curPet: 0, session: null };

function mapDbPetToLocal(row) {
  return {
    id: row.id, ad: row.ad, tur: row.tur, cins: row.cins || '', cinsiyet: row.cinsiyet || '',
    dogum: row.dogum || '', kilo: row.kilo != null ? String(row.kilo) : '', cip: row.cip || '',
    kan: row.kan || '', kisir: row.kisir || 'Hayır', alerji: row.alerji || '', renk: row.renk || 'gri',
    foto: row.foto_url || ''
  };
}
function mapDbStateToLocal(row) {
  /* worn kolonu artık aksesuar slotları + hedef sayaçlarını JSON olarak taşıyor
   * (yeni bir Supabase kolonu eklemeden genişletebilmek için — bkz. persistToSupabase). */
  let extra = {};
  try { extra = row?.worn ? JSON.parse(row.worn) : {}; } catch (e) { extra = {}; }
  return {
    tok: row?.tok ?? 80, mut: row?.mut ?? 70, enj: row?.enj ?? 90, xp: row?.xp ?? 0,
    coin: row?.coin ?? 15, items: row?.items || [],
    worn: { head: extra.head || '', face: extra.face || '', neck: extra.neck || '', bg: extra.bg || '' },
    claimedGoals: extra.claimedGoals || [],
    flappyBest: row?.flappy_best || 0
  };
}

/* Supabase'deki pets + game_states satırlarını petData/gameStates dizilerine
 * (aynı referansı koruyarak, in-place) yükler. */
export async function loadPetsForUser(userId) {
  if (!supabase) return false;
  const { data: pets, error } = await supabase.from('pets').select('*').eq('owner_id', userId).order('created_at');
  if (error || !pets || !pets.length) return false;
  const petIds = pets.map(p => p.id);
  const { data: states } = await supabase.from('game_states').select('*').in('pet_id', petIds);
  petData.length = 0;
  gameStates.length = 0;
  pets.forEach(p => {
    petData.push(mapDbPetToLocal(p));
    gameStates.push(mapDbStateToLocal((states || []).find(s => s.pet_id === p.id)));
  });
  appState.curPet = 0;
  return true;
}

export function enterGuestMode() {
  appState.session = null;
}

/* Uygulama açılışında: aktif bir Supabase oturumu varsa verileri oradan yükle,
 * yoksa misafir/localStorage moduyla devam et. main.js bu promise'i bekliyor. */
export const authReady = (async () => {
  if (!supabase) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    appState.session = session;
    await loadPetsForUser(session.user.id);
  }
})();

/* Yeni bir hayvan profili ekler (misafir modunda sadece localStorage, oturum
 * açıksa Supabase'e de satır ekler) ve onu aktif pet yapar. */
export async function addPet(fields) {
  const pet = {
    ad: (fields.ad || '').trim() || 'Dostum', tur: fields.tur || 'kedi', cins: fields.cins || '',
    cinsiyet: fields.cinsiyet || 'Dişi', dogum: fields.dogum || '', kilo: fields.kilo || '',
    cip: fields.cip || '', kan: fields.kan || '', kisir: fields.kisir || 'Hayır',
    alerji: fields.alerji || '', renk: fields.renk || 'gri', foto: fields.foto || ''
  };
  const state = { tok: 80, mut: 70, enj: 90, xp: 0, coin: 15, items: [], worn: {}, claimedGoals: [], flappyBest: 0 };
  if (supabase && appState.session) {
    try {
      const { data: row, error } = await supabase.from('pets').insert({
        owner_id: appState.session.user.id, ad: pet.ad, tur: pet.tur, cins: pet.cins, cinsiyet: pet.cinsiyet,
        dogum: pet.dogum || null, kilo: pet.kilo ? Number(pet.kilo) : null, cip: pet.cip, kan: pet.kan,
        kisir: pet.kisir, alerji: pet.alerji, renk: pet.renk, foto_url: pet.foto || null
      }).select().single();
      if (error) throw error;
      pet.id = row.id;
      await supabase.from('game_states').insert({ pet_id: pet.id, worn: JSON.stringify({ claimedGoals: [] }) });
    } catch (e) { console.warn('PatiDost: yeni hayvan Supabase\'e eklenemedi', e); }
  }
  petData.push(pet); gameStates.push(state);
  appState.curPet = petData.length - 1;
  await saveAll();
}

async function persistToSupabase() {
  if (!supabase || !appState.session) return;
  const p = petData[appState.curPet];
  const g = gameStates[appState.curPet];
  if (!p || !p.id) return;
  try {
    await supabase.from('pets').update({
      ad: p.ad, tur: p.tur, cins: p.cins, cinsiyet: p.cinsiyet, dogum: p.dogum || null,
      kilo: p.kilo ? Number(p.kilo) : null, cip: p.cip, kan: p.kan, kisir: p.kisir,
      alerji: p.alerji, renk: p.renk, foto_url: p.foto || null
    }).eq('id', p.id);
    await supabase.from('game_states').upsert({
      pet_id: p.id, tok: g.tok, mut: g.mut, enj: g.enj, xp: g.xp, coin: g.coin,
      items: g.items,
      worn: JSON.stringify({ ...g.worn, claimedGoals: g.claimedGoals || [] }),
      flappy_best: g.flappyBest || 0
    });
  } catch (e) { console.warn('PatiDost: Supabase kayıt hatası', e); }
}

export async function saveAll() {
  if (appState.session) { await persistToSupabase(); return; }
  try { localStorage.setItem('patidost', JSON.stringify({ pets: petData, game: gameStates })); }
  catch (e) { console.warn('PatiDost: kayıt başarısız (localStorage doldu olabilir)', e); }
}

export function gState() {
  return gameStates[appState.curPet];
}

export function petEmoji(i) {
  return petData[i === undefined ? appState.curPet : i].tur === 'kedi' ? '🐱' : '🐶';
}

export function yas(d) {
  if (!d) return 'yaş bilinmiyor';
  const y = (Date.now() - new Date(d).getTime()) / 31557600000;
  return y < 1 ? Math.max(1, Math.round(y * 12)) + ' aylık' : Math.floor(y) + ' yaş';
}

/* küçük DOM yardımcıları — birçok UI modülünde kullanılıyor */
export function el(id) { return document.getElementById(id); }
export function pID(id, v) { const e = document.getElementById(id); if (e) e.textContent = v; }
