import { createSubmissionGuard, reportError, publicReport, type ReportDraft } from '../src/core/report';

const complete: ReportDraft = {
  subject: 'own', pet: { id: 'mia', name: 'Mia', species: 'Kedi', age: '2 yaş' }, species: 'Kedi', name: 'Mia',
  situation: 'lost', description: 'Park girişinde son kez görüldü.', photos: ['file:///one.jpg'],
  location: { address: 'Kadıköy park girişi', confirmed: true, coordinates: { latitude: 40.99, longitude: 29.03 } },
  observedAt: '2026-09-18T12:00', audience: { community: true, vets: false },
};
test('own and other reports require distinct safe subject details', () => {
  expect(reportError({ ...complete, subject: null })).toBe('Kimin için bildirdiğinizi seçin.');
  expect(reportError({ ...complete, subject: 'other', pet: null, species: null })).toBe('Hayvanın türünü seçin.');
  expect(reportError({ ...complete, subject: 'other', pet: null, species: 'Diğer / bilmiyorum', name: '' })).toBeNull();
});
test('three situations are exclusive and must be selected', () => {
  expect(reportError({ ...complete, situation: null })).toBe('Ne olduğunu seçin.');
  for (const situation of ['lost', 'injured', 'needs-help'] as const) expect(reportError({ ...complete, situation })).toBeNull();
});
test('description is 20–500 characters and photos are required, at most five', () => {
  expect(reportError({ ...complete, description: 'kısa' })).toMatch(/20/);
  expect(reportError({ ...complete, description: 'x'.repeat(501) })).toMatch(/500/);
  expect(reportError({ ...complete, photos: [] })).toMatch(/fotoğraf/);
  expect(reportError({ ...complete, photos: Array(6).fill('file:///x') })).toMatch(/5/);
});
test('location requires confirmation, time cannot be future, and at least one audience is required', () => {
  expect(reportError({ ...complete, location: { ...complete.location, confirmed: false } })).toMatch(/onaylayın/);
  expect(reportError({ ...complete, observedAt: '2999-01-01T12:00' })).toMatch(/gelecek/i);
  expect(reportError({ ...complete, audience: { community: false, vets: false } })).toMatch(/en az bir/i);
});
test('public payload strips private pet photos, health records and precise community location', () => {
  const input = { ...complete, pet: { ...complete.pet!, photos: ['private.jpg'], healthRecords: ['secret'] } } as ReportDraft;
  const payload = publicReport(input, 'owner-1');
  expect(JSON.stringify(payload)).not.toMatch(/private|secret|healthRecords/);
  expect(payload.pet).toEqual({ id: 'mia', name: 'Mia', species: 'Kedi', age: '2 yaş' });
  expect(payload.communityLocation).toBe('Kadıköy');
  expect(payload.location.coordinates).toEqual({ latitude: 40.99, longitude: 29.03 });
  expect(payload.ownerId).toBe('owner-1');
});
test('a pending publication ignores double taps and permits retry after failure', async () => {
  const submit = createSubmissionGuard();
  let reject!: (reason: Error) => void;
  const work = jest.fn(() => new Promise<void>((_, fail) => { reject = fail; }));
  const first = submit(work);
  expect(await submit(work)).toBe(false);
  expect(work).toHaveBeenCalledTimes(1);
  reject(new Error('offline'));
  await expect(first).rejects.toThrow('offline');
  expect(await submit(async () => {})).toBe(true);
});
