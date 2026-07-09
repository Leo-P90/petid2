import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn('PatiDost: Supabase ortam değişkenleri eksik (.env dosyasına bak) — misafir moduyla devam ediliyor.');
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
