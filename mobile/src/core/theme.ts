import type { ThemeMode } from './model';
import brandTokens from './brand-tokens.json';
// Approved B / Gece Lavanta tokens; readable small text uses AA foreground variants.
export const secondaryText = { light: '#666272', dark: '#C4BECF' };
export const palettes = brandTokens;
export const geometry = { radius: 20, buttonRadius: 14, touch: 48, pagePadding: 18, gap: 14 };
export function parseTheme(value: string | null): ThemeMode {
  return value === 'dark' ? 'dark' : 'light';
}
export const THEME_KEY = 'petid.mobile.theme.v1';
// PatiMatch stays charcoal even when the general application theme is light.
export function statusBarStyle(mode: 'light' | 'dark', pathname: string): 'light' | 'dark' {
  return mode === 'dark' || pathname.endsWith('/match') ? 'light' : 'dark';
}
