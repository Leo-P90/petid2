export function validSupabaseConfig(url: string, key: string, local: boolean) {
  const localUrl = /^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2):\d+$/.test(url);
  if (local) return localUrl && key.startsWith('sb_publishable_') && !key.includes('YOUR_');
  return /^https:\/\/[^/]+\.supabase\.co$/.test(url) && key.startsWith('sb_publishable_') && !url.includes('YOUR_') && !key.includes('YOUR_');
}
