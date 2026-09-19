import { focusScroll, imeOverlap } from '../src/core/keyboard';
import { palettes, geometry, secondaryText } from '../src/core/theme';
test('IME overlap does not double-pad an already resized screen', () => {
  expect(imeOverlap({ y: 84, height: 736 }, 500)).toBe(320);
  expect(imeOverlap({ y: 84, height: 416 }, 500)).toBe(0);
  expect(imeOverlap({ y: 84, height: 736 }, null)).toBe(0);
});
test('focus scrolling keeps the profile label, input and save group above Gboard', () => {
  expect(focusScroll(0, { y: 440, height: 200 }, { y: 84, height: 416 }, 500)).toBe(156);
  expect(focusScroll(156, { y: 284, height: 200 }, { y: 84, height: 416 }, 500)).toBe(156);
  expect(focusScroll(156, { y: 60, height: 200 }, { y: 84, height: 416 }, 500)).toBe(116);
});
test('small screen / large text / last field scrolls and offsets never become negative', () => {
  expect(focusScroll(20, { y: 360, height: 260 }, { y: 84, height: 300 }, 384)).toBe(272);
  expect(focusScroll(0, { y: 0, height: 48 }, { y: 84, height: 300 }, 384)).toBe(0);
});
test('approved B PetID brand and dark surface tokens stay centralized', () => {
  expect(palettes.light).toMatchObject({ green: '#16A36A', text: '#182033', background: '#FFF9F2', surface: '#FFFFFF', accent: '#8B7CF6', red: '#F43F5E', purple: '#8B7CF6' });
  expect(palettes.dark).toMatchObject({ background: '#14151D', surface: '#20212C', green: '#16A36A', purple: '#8B7CF6' });
  expect(geometry).toMatchObject({ radius: 20, touch: 48 });
});
function luminance(hex: string) {
  const c = hex.slice(1).match(/../g)!.map((v) => parseInt(v, 16) / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a: string, b: string) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test('small text and action labels have AA contrast in both themes', () => {
  for (const mode of ['light', 'dark'] as const) {
    const colors = palettes[mode];
    for (const surface of [colors.background, colors.surface, colors.greenSoft]) {
      expect(contrast(secondaryText[mode], surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(colors.text, surface)).toBeGreaterThanOrEqual(4.5);
    }
    expect(contrast(colors.accent, colors.onAccent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors.white, colors.greenDark)).toBeGreaterThanOrEqual(4.5);
  }
});
