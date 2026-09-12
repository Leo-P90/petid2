import { appendPhotos, discover, validCoordinates } from '../src/core/model';
import { parseTheme } from '../src/core/theme';
test('discovery is same species and excludes passed/liked candidates', () => {
  expect(discover('Kedi', []).every((pet) => pet.species === 'Kedi')).toBe(true);
  expect(discover('Köpek', []).map((pet) => pet.name)).toEqual(['Max']);
  expect(discover('Kedi', ['demo-luna']).map((pet) => pet.name)).toEqual(['Ada']);
});
test('photos deduplicate and cap at five without mutating original', () => {
  const photos = ['a'];
  expect(appendPhotos(photos, ['a', 'b', 'c', 'd', 'e', 'f'])).toEqual(['a', 'b', 'c', 'd', 'e']);
  expect(photos).toEqual(['a']);
});
test('invalid coordinate values cannot be used in drafts', () => {
  expect(validCoordinates(41, 29)).toBe(true);
  expect(validCoordinates(91, 29)).toBe(false);
  expect(validCoordinates(0, NaN)).toBe(false);
});
test('theme storage values are bounded', () => {
  expect(parseTheme('dark')).toBe('dark');
  expect(parseTheme(null)).toBe('light');
  expect(parseTheme('malformed')).toBe('light');
});
