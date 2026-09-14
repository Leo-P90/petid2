import { eligibleCandidate, matchMessage, profileInput, uniqueMessages, unread, type MatchProfile, type LiveMessage } from '../src/core/match-live';
import { createMatchRepository, nativeBlobBase64 } from '../src/services/match';
const own: MatchProfile = { pet_id: 'a', owner_id: 'owner-a', species: 'Kedi', display_name: 'A', active: true, birth_date: null, age_label: null, breed: '', sex: 'Belirtilmedi', bio: '', city: '', district: '' };
const other = { ...own, pet_id: 'b', owner_id: 'owner-b' };
test.each([{ ...other, species: 'Köpek' as const }, { ...other, active: false }, { ...other, owner_id: own.owner_id }, own])('ineligible candidate rejected in model and service: %j', async row => {
  expect(eligibleCandidate(own, row)).toBe(false);
  const rpc = jest.fn(); await expect(createMatchRepository({ rpc } as never).like(own, row)).rejects.toThrow(); expect(rpc).not.toHaveBeenCalled();
});
test.each(['', '  ', 'x'.repeat(501)])('invalid message is never sent', async text => {
  expect(() => matchMessage(text)).toThrow(); const rpc = jest.fn(); await expect(createMatchRepository({ rpc } as never).send('c', 'p', text, 'request')).rejects.toThrow(); expect(rpc).not.toHaveBeenCalled();
});
test('trim and Unicode codepoint limit match PostgreSQL', () => { expect(matchMessage(' hello ')).toBe('hello'); expect([...matchMessage('🐾'.repeat(500))]).toHaveLength(500); });
test('like/send preserve idempotent transaction arguments; database errors propagate', async () => {
  const rpc = jest.fn(async () => ({ data: 'conversation', error: null as unknown })); const repo = createMatchRepository({ rpc } as never);
  await expect(repo.like(own, other)).resolves.toBe('conversation'); expect(rpc).toHaveBeenCalledWith('match_like', { source_pet: 'a', target_pet: 'b' });
  await repo.send('c', 'a', ' hello ', 'stable-request'); expect(rpc).toHaveBeenCalledWith('match_send', { c: 'c', p: 'a', text_body: 'hello', request_id: 'stable-request' });
  rpc.mockResolvedValue({ data: '', error: new Error('blocked') }); await expect(repo.send('c', 'a', 'hello', 'stable-request')).rejects.toThrow('blocked');
});
test('read/block/unmatch use scoped RPCs, report validation rejects unsafe input', async () => {
  const rpc = jest.fn(async () => ({ data: null, error: null })); const repo = createMatchRepository({ rpc } as never);
  await repo.read('c', 'a', 'm'); await repo.block('a', 'b'); await repo.unmatch('c', 'a');
  expect(rpc).toHaveBeenCalledWith('match_read', { c: 'c', p: 'a', message_id: 'm' }); expect(rpc).toHaveBeenCalledWith('match_block', { p: 'a', target: 'b' }); expect(rpc).toHaveBeenCalledWith('match_unmatch', { c: 'c', p: 'a' });
  await expect(repo.report('b', 'spam', 'x'.repeat(501))).rejects.toThrow();
});
test('profile validation keeps approximate fields, rejects long/empty/date/sex input', () => {
  expect(profileInput({ ...own, display_name: ' A ', city: ' City ' }).city).toBe('City');
  for (const changes of [{ display_name: ' ' }, { bio: 'x'.repeat(501) }, { birth_date: '2026-02-30' }, { sex: 'forged' }]) expect(() => profileInput({ ...own, ...changes } as never)).toThrow();
});
test('message deduplication and pet-scoped unread survive reopen', () => {
  const first: LiveMessage = { id: '1', conversation_id: 'c', sender_pet: 'a', client_id: 'r', body: 'one', created_at: '2026-01-01' };
  const last = { ...first, id: '2', sender_pet: 'b', body: 'two', created_at: '2026-01-02' };
  const messages = uniqueMessages([last, first, last]); expect(messages.map(row => row.id)).toEqual(['1', '2']);
  const thread = { id: 'c', candidate: other, messages, reads: [], verification: null }; expect(unread(thread, 'a')).toBe(true);
  expect(unread({ ...thread, reads: [{ conversation_id: 'c', pet_id: 'a', last_message_id: '2', read_at: 'now' }] }, 'a')).toBe(false);
});
test('unconfigured repository fails closed', async () => { await expect(createMatchRepository(null).snapshot('p')).rejects.toThrow(); });
test('RN photo reader does not need Blob.arrayBuffer', async () => {
  const original = globalThis.FileReader;
  const reader: { result: string; onload: null | (() => void); onerror: null | (() => void); readAsDataURL: jest.Mock } = { result: 'data:image/png;base64,cGl4ZWxz', onload: null, onerror: null, readAsDataURL: jest.fn() };
  reader.readAsDataURL.mockImplementation(() => reader.onload?.());
  globalThis.FileReader = jest.fn(() => reader) as never;
  try { const blob = {} as Blob; await expect(nativeBlobBase64(blob)).resolves.toBe('cGl4ZWxz'); expect(reader.readAsDataURL).toHaveBeenCalledWith(blob); }
  finally { globalThis.FileReader = original; }
});
test('repository rehydrates conversations/read/verification without demo data and filters discovery', async () => {
  const message = { id: 'm', conversation_id: 'c', sender_pet: 'b', client_id: 'r', body: 'Persisted message', created_at: '2026-09-14' };
  const tables: Record<string, Record<string, unknown>[]> = {
    match_profiles: [own, other, { ...other, pet_id: 'dog', species: 'Köpek' }, { ...other, pet_id: 'same', owner_id: 'owner-a' }],
    match_likes: [], match_participants: [{ pet_id: 'a', conversation_id: 'c' }, { pet_id: 'b', conversation_id: 'c' }],
    match_media: [], match_messages: [message, message], match_reads: [{ pet_id: 'a', conversation_id: 'c', last_message_id: 'm', read_at: 'now' }],
    pet_verifications: [{ pet_id: 'a', status: 'pending' }, { pet_id: 'b', status: 'verified' }],
  };
  function from(table: string) {
    let rows = tables[table];
    const chain = { select: () => chain, order: () => chain, limit: () => chain,
      eq: (key: string, value: unknown) => { rows = rows.filter(row => row[key] === value); return chain; },
      neq: (key: string, value: unknown) => { rows = rows.filter(row => row[key] !== value); return chain; },
      maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
      then: (resolve: (value: unknown) => unknown) => Promise.resolve({ data: rows, error: null }).then(resolve),
    }; return chain;
  }
  const repo = createMatchRepository({ from } as never);
  const snapshot = await repo.snapshot('a'); expect(snapshot.candidates.map(row => row.pet_id)).toEqual(['b']);
  expect(snapshot.ownVerification).toBe('pending'); expect(snapshot.threads[0].verification).toBe('verified');
  expect(snapshot.threads[0].messages).toEqual([message]); expect(unread(snapshot.threads[0], 'a')).toBe(false);
  expect((await repo.snapshot('a')).threads).toEqual(snapshot.threads);
});
