import { validateFile, validateHealth, type HealthInput } from '../src/core/health';
import { validSupabaseConfig } from '../src/core/supabase-config';
const base: HealthInput = { kind: 'exam', title: 'Kontrol', occurred_on: '2026-09-14', due_on: null, notes: null, weight_kg: null };
test.each(['2026-02-30', '2026-13-01', '14/09/2026', ''])('rejects invalid date %s', (occurred_on) => {
  expect(() => validateHealth({ ...base, occurred_on })).toThrow();
});
test('validates chronological due dates and kind-specific weight', () => {
  expect(validateHealth(base)).toEqual(base);
  expect(() => validateHealth({ ...base, due_on: '2026-09-13' })).toThrow();
  for (const weight_kg of [0, -1, NaN, Infinity, 1001, null]) expect(() => validateHealth({ ...base, kind: 'weight', weight_kg })).toThrow();
  expect(validateHealth({ ...base, kind: 'weight', weight_kg: 4.25 }).weight_kg).toBe(4.25);
  expect(() => validateHealth({ ...base, weight_kg: 4 })).toThrow();
});
test('validates actual byte size and strict mime allowlist', () => {
  expect(() => validateFile('application/pdf', 10485760)).not.toThrow();
  for (const size of [0, -1, NaN, Infinity, 10485761]) expect(() => validateFile('image/png', size)).toThrow();
  for (const mime of ['image/svg+xml', 'text/html', 'application/octet-stream', '']) expect(() => validateFile(mime, 1)).toThrow();
  expect(() => validateFile('application/pdf', 1, true)).toThrow();
});
test('local mode accepts only loopback/emulator endpoints and public keys', () => {
  const key = 'sb_publishable_test';
  expect(validSupabaseConfig('http://127.0.0.1:54321', key, true)).toBe(true);
  expect(validSupabaseConfig('http://10.0.2.2:54321', key, true)).toBe(true);
  expect(validSupabaseConfig('https://live.supabase.co', key, true)).toBe(false);
  expect(validSupabaseConfig('http://evil.test:54321', key, true)).toBe(false);
  expect(validSupabaseConfig('http://localhost:54321', 'sb_secret_test', true)).toBe(false);
  expect(validSupabaseConfig('http://localhost:54321', key, false)).toBe(false);
});
