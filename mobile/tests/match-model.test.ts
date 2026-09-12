import { demoPets } from '../src/core/model';
import { matchDemo } from '../src/data/match-demo';
import { discoverMatches, emptyMatch, matchReducer, validMessage, type MatchStore } from '../src/core/match-model';
import { exitDuration, swipeChoice } from '../src/core/match-motion';
const [cat, dog] = demoPets; const [luna, ada, max] = matchDemo;
const start = (pet = cat) => matchReducer({}, { type: 'toggle', pet });
test('discovery strictly separates species and excludes adoption', () => {
  expect(discoverMatches(cat, emptyMatch(), matchDemo).every(c => c.species === 'Kedi')).toBe(true);
  expect(discoverMatches(dog, emptyMatch(), matchDemo).map(c => c.name)).toEqual(['Max', 'Maya']);
});
test('wrong species cannot like, match, open, send or reply even with injected conversation', () => {
  const s = start(); for (const type of ['pass', 'like', 'read'] as const) expect(matchReducer(s, { type, pet: cat, candidate: max })).toBe(s);
  const forged: MatchStore = { [cat.id]: { ...emptyMatch(), likes: [max.id], conversations: { [max.id]: { candidate: max, messages: [], unread: true } } } };
  expect(matchReducer(forged, { type: 'send', pet: cat, candidate: { ...max, species: 'Kedi' }, text: 'hi' })).toBe(forged);
  expect(matchReducer(forged, { type: 'reply', pet: cat, candidate: max, text: 'hi' })).toBe(forged);
});
test('pass, exhaustion and reset preserve likes and conversations without duplicates', () => {
  let s = start(); s = matchReducer(s, { type: 'pass', pet: cat, candidate: luna }); s = matchReducer(s, { type: 'like', pet: cat, candidate: ada });
  expect(discoverMatches(cat, s[cat.id], matchDemo)).toEqual([]); s = matchReducer(s, { type: 'reset', pet: cat });
  s = matchReducer(s, { type: 'like', pet: cat, candidate: ada }); expect(Object.keys(s[cat.id].conversations)).toEqual([ada.id]); expect(s[cat.id].likes).toEqual([ada.id]);
});
test('one-sided like records like only; mutual deterministically opens one conversation', () => {
  let s = matchReducer(start(), { type: 'like', pet: cat, candidate: luna }); expect(s[cat.id].likes).toContain(luna.id); expect(s[cat.id].conversations).toEqual({});
  s = matchReducer(s, { type: 'like', pet: cat, candidate: ada }); const again = matchReducer(s, { type: 'like', pet: cat, candidate: ada }); expect(again).toBe(s); expect(s[cat.id].conversations[ada.id].messages).toHaveLength(1);
});
test('pet states and delayed replies are isolated', () => {
  let s = matchReducer(start(), { type: 'like', pet: cat, candidate: ada }); const cats = s[cat.id]; s = matchReducer(s, { type: 'toggle', pet: dog }); s = matchReducer(s, { type: 'like', pet: dog, candidate: max }); expect(s[cat.id]).toBe(cats);
  s = matchReducer(s, { type: 'reply', pet: cat, candidate: ada, text: ada.reply, visible: false }); expect(s[dog.id].conversations[max.id].messages).toHaveLength(1); expect(s[cat.id].conversations[ada.id].unread).toBe(true);
});
test('unread/read and plain-text message validation', () => {
  let s = matchReducer(start(), { type: 'like', pet: cat, candidate: ada }); s = matchReducer(s, { type: 'read', pet: cat, candidate: ada }); expect(s[cat.id].conversations[ada.id].unread).toBe(false);
  for (const text of ['', '  ', 'x'.repeat(501)]) expect(matchReducer(s, { type: 'send', pet: cat, candidate: ada, text })).toBe(s);
  expect(validMessage('x'.repeat(500))).toBe(true); s = matchReducer(s, { type: 'send', pet: cat, candidate: ada, text: ' <script>literal</script> ' }); expect(s[cat.id].conversations[ada.id].messages.at(-1)?.text).toBe('<script>literal</script>');
  s = matchReducer(s, { type: 'reply', pet: cat, candidate: ada, text: ada.reply, visible: true }); expect(s[cat.id].conversations[ada.id].unread).toBe(false);
});
test('swipe threshold and reduced motion have deterministic accessible button equivalent', () => {
  expect(swipeChoice(94)).toBeNull(); expect(swipeChoice(95)).toBe('like'); expect(swipeChoice(-95)).toBe('pass'); expect(exitDuration(true)).toBe(0); expect(exitDuration(false)).toBe(220);
});
