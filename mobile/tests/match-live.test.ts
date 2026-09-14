import { eligibleCandidate, matchMessage, profileInput, uniqueMessages, unread, type MatchProfile, type LiveMessage } from '../src/core/match-live';
import { createMatchRepository } from '../src/services/match';
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
