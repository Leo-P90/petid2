import { go } from './navigation.js';
import { toast } from './toast.js';
import { supabase } from '../state/supabase-client.js';
import { appState, loadPetsForUser } from '../state/store.js';
import { renderAll } from './profile.js';

let authIsReg = true, agreeOK = false, pickedType = 'kedi';

export function openAuth(mode) { authMode(mode || 'kayit'); go('kayit'); }

export function authMode(m) {
  authIsReg = (m !== 'giris');
  document.getElementById('tabKayit').classList.toggle('on', authIsReg);
  document.getElementById('tabGiris').classList.toggle('on', !authIsReg);
  document.querySelectorAll('#scr-kayit .reg-only').forEach(e => e.style.display = authIsReg ? '' : 'none');
  document.getElementById('authBtn').textContent = authIsReg ? 'Hesap Oluştur' : 'Giriş Yap';
  document.getElementById('authSub').textContent = authIsReg ? 'Can dostunun dijital dünyasına ilk adım' : 'Tekrar hoş geldin — seni özledik 🐾';
  document.getElementById('authFoot').innerHTML = authIsReg
    ? 'Zaten hesabın var mı? <a onclick="authMode(\'giris\')">Giriş yap</a>'
    : 'Hesabın yok mu? <a onclick="authMode(\'kayit\')">Kayıt ol</a>';
  ['fName', 'fMail', 'fPass'].forEach(id => document.getElementById(id).classList.remove('bad'));
}

export function togglePass(el, id) {
  const inp = document.getElementById(id);
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  el.textContent = show ? '🙈' : '👁️';
}

export function pickPetType(el) {
  document.querySelectorAll('#scr-kayit .pettype .pt').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  pickedType = el.dataset.t;
}

export function toggleAgree() {
  agreeOK = !agreeOK;
  const b = document.getElementById('agreeBox');
  b.classList.toggle('on', agreeOK);
  b.textContent = agreeOK ? '✓' : '';
}

const TUR_MAP = { kedi: 'kedi', kopek: 'kopek', diger: 'diger' };

export async function submitAuth() {
  const ad = document.getElementById('kAd').value.trim();
  const mail = document.getElementById('kMail').value.trim();
  const pass = document.getElementById('kPass').value;
  let ok = true;
  const bad = (id, cond) => { document.getElementById(id).classList.toggle('bad', cond); if (cond) ok = false; };
  if (authIsReg) bad('fName', ad.length < 2);
  bad('fMail', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail));
  bad('fPass', pass.length < 6);
  if (!ok) { toast('⚠️ Lütfen alanları kontrol et'); return; }
  if (authIsReg && !agreeOK) { toast('📋 Koşulları kabul etmelisin'); return; }

  if (!supabase) { toast('⚠️ Supabase bağlı değil — .env dosyasını kontrol et'); return; }

  const authBtn = document.getElementById('authBtn');
  authBtn.disabled = true;

  try {
    if (authIsReg) {
      /* profil + varsayılan pet + game_state satırları artık sunucu tarafında,
       * auth.users üzerindeki bir trigger ile otomatik oluşturuluyor (bkz.
       * supabase/schema.sql — handle_new_user). Böylece e-posta onayı zorunlu
       * olsa bile (oturum/JWT henüz yokken) RLS bu adımı engellemiyor. */
      const { data, error } = await supabase.auth.signUp({
        email: mail,
        password: pass,
        options: { data: { ad_soyad: ad, pet_type: TUR_MAP[pickedType] || 'kedi' } }
      });
      if (error) { toast('⚠️ ' + error.message); return; }
      if (data.session) {
        appState.session = data.session;
        await loadPetsForUser(data.user.id);
        renderAll();
        toast('🎉 Hoş geldin ' + (ad.split(' ')[0] || 'dostum') + '! Hesabın oluşturuldu 🐾');
      } else {
        toast('📧 Hesabın oluşturuldu — giriş yapmadan önce e-postanı onaylaman gerekebilir.');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email: mail, password: pass });
      if (error) { toast('⚠️ ' + error.message); return; }
      appState.session = data.session;
      await loadPetsForUser(data.user.id);
      renderAll();
      toast('✓ Giriş yapıldı: ' + mail);
    }
  } finally {
    authBtn.disabled = false;
  }

  setTimeout(() => go('profil'), 700);
}

export async function signOut() {
  if (supabase && appState.session) await supabase.auth.signOut();
  appState.session = null;
  location.reload();
}
