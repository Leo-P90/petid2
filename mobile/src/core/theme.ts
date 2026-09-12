import type { ThemeMode } from './model';
import brandTokens from './brand-tokens.json';
// PetID preserved-shell.css tokens; dark surfaces come from .phone.dark.
// Original gray/green are preserved; readable small text uses AA foreground variants.
export const secondaryText = { light: '#62726C', dark: '#96A69F' };
export const palettes = brandTokens;
export const geometry = { radius: 20, buttonRadius: 14, touch: 48, pagePadding: 18, gap: 14 };
export function parseTheme(value: string | null): ThemeMode {
  return value === 'dark' ? 'dark' : 'light';
}
export const THEME_KEY = 'petid.mobile.theme.v1';
