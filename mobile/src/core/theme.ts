import type { ThemeMode } from './model';
export const palettes = {
  light: { background: '#F3F8F7', surface: '#FFFFFF', text: '#183C3A', muted: '#526B69', accent: '#116C61', onAccent: '#FFFFFF', border: '#CADBD7', danger: '#A62E35' },
  dark: { background: '#102826', surface: '#183B37', text: '#F0F8F5', muted: '#B2CBC5', accent: '#8FE1CE', onAccent: '#102826', border: '#3C6058', danger: '#FFB3B6' },
};
export function parseTheme(value: string | null): ThemeMode {
  return value === 'dark' ? 'dark' : 'light';
}
export const THEME_KEY = 'petid.mobile.theme.v1';
