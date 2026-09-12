import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createAuthAdapter, type AuthAdapter } from '../services/auth';
import { supabase } from '../services/supabase';
import * as Linking from 'expo-linking';

type Status = 'loading' | 'unconfigured' | 'signedOut' | 'signedIn' | 'error';
type AuthState = {
  status: Status; session: Session | null; demo: boolean; busy: boolean; message: string;
  useDemo: () => void; useAccount: () => void; signIn: (e: string, p: string) => Promise<void>;
  signUp: (e: string, p: string) => Promise<void>; recover: (e: string) => Promise<void>;
  signOut: () => Promise<void>; updatePassword: (p: string) => Promise<void>;
};
const fallback: AuthState = { status: 'unconfigured', session: null, demo: true, busy: false, message: '', useDemo() {}, useAccount() {}, async signIn() {}, async signUp() {}, async recover() {}, async signOut() {}, async updatePassword() {} };
const Context = createContext<AuthState>(fallback);
const genericError = 'İşlem tamamlanamadı. Bilgileri kontrol edip yeniden deneyin.';
const defaultAdapter = createAuthAdapter(supabase);
export function AuthProvider({ children, adapter = defaultAdapter }: { children: ReactNode; adapter?: AuthAdapter }) {
  const [status, setStatus] = useState<Status>(adapter.configured ? 'loading' : 'unconfigured');
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState(!adapter.configured);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  useEffect(() => {
    let active = true;
    adapter.session().then((next) => { if (active) { setSession(next); setStatus(next ? 'signedIn' : adapter.configured ? 'signedOut' : 'unconfigured'); } })
      .catch(() => { if (active) setStatus('error'); });
    const stop = adapter.listen((next) => { if (!active) return; setSession(next); setStatus(next ? 'signedIn' : 'signedOut'); });
    return () => { active = false; stop(); };
  }, [adapter]);
  useEffect(() => {
    if (!adapter.configured) return;
    const handle = (url: string | null) => {
      if (!url || Linking.parse(url).path !== 'reset-password') return;
      setBusy(true); adapter.exchangeRecoveryUrl(url).catch(() => setMessage(genericError)).finally(() => setBusy(false));
    };
    void Linking.getInitialURL().then(handle);
    const listener = Linking.addEventListener('url', ({ url }) => handle(url));
    return () => listener.remove();
  }, [adapter]);
  async function perform(work: () => Promise<void>, success = '') { setBusy(true); setMessage(''); try { await work(); setMessage(success); } catch { setMessage(genericError); } finally { setBusy(false); } }
  const value = useMemo<AuthState>(() => ({ status, session, demo, busy, message,
    useDemo: () => setDemo(true), useAccount: () => setDemo(false),
    signIn: (e, p) => perform(() => adapter.signIn(e.trim(), p)),
    signUp: (e, p) => perform(() => adapter.signUp(e.trim(), p), 'E-posta doğrulama bağlantısı gönderildiyse gelen kutunuzu kontrol edin.'),
    recover: (e) => perform(() => adapter.recover(e.trim()), 'Parola yenileme bağlantısı gönderildi.'),
    signOut: () => perform(() => adapter.signOut()),
    updatePassword: (p) => perform(() => adapter.updatePassword(p), 'Parolanız güncellendi.'),
  }), [status, session, demo, busy, message, adapter]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useAuth = () => useContext(Context);
