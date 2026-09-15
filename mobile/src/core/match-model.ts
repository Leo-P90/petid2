import type { Pet } from './model';
export type Candidate = { id: string; species: Pet['species']; name: string; age: string; breed: string; gender: string; distance: string; bio: string; compatibility: number; photo?: string; photoPosition?: { x: number; y: number }; verification?: string; mutual: boolean; opener: string; reply: string };
export type Message = { id: number; from: 'me' | 'demo'; text: string };
export type Conversation = { candidate: Candidate; messages: Message[]; unread: boolean };
export type MatchState = { participating: boolean; excluded: string[]; likes: string[]; conversations: Record<string, Conversation> };
export type MatchStore = Record<string, MatchState>;
export type MatchAction = { pet: Pick<Pet, 'id' | 'species'> } & (
  { type: 'toggle' } | { type: 'reset' } | { type: 'undo'; candidate: Candidate } | { type: 'pass'; candidate: Candidate } | { type: 'like'; candidate: Candidate } | { type: 'read'; candidate: Candidate } |
  { type: 'send'; candidate: Candidate; text: string } | { type: 'reply'; candidate: Candidate; text: string; visible?: boolean });
export const emptyMatch = (): MatchState => ({ participating: false, excluded: [], likes: [], conversations: {} });
export const discoverMatches = (pet: Pick<Pet, 'species'>, state: MatchState, pool: readonly Candidate[]) => pool.filter(c => c.species === pet.species && !state.excluded.includes(c.id));
export const validMessage = (text: string) => text.trim().length > 0 && text.trim().length <= 500;
export function matchReducer(store: MatchStore, action: MatchAction): MatchStore {
  const previous = store[action.pet.id] ?? emptyMatch();
  let next: MatchState;
  if (action.type === 'toggle') next = { ...previous, participating: !previous.participating };
  else if (action.type === 'reset') next = { ...previous, excluded: [] };
  else {
    const c = action.candidate;
    if (c.species !== action.pet.species) return store;
    if (action.type === 'undo') {
      if (!previous.participating || previous.likes.includes(c.id)) return store;
      next = { ...previous, excluded: previous.excluded.filter(id => id !== c.id) };
    } else if (action.type === 'pass' || action.type === 'like') {
      if (!previous.participating || previous.excluded.includes(c.id)) return store;
      next = { ...previous, excluded: [...previous.excluded, c.id] };
      if (action.type === 'like') {
        next.likes = previous.likes.includes(c.id) ? previous.likes : [...previous.likes, c.id];
        if (c.mutual && !previous.conversations[c.id]) next.conversations = { ...previous.conversations, [c.id]: { candidate: { ...c }, messages: [{ id: 1, from: 'demo', text: c.opener }], unread: true } };
      }
    } else {
      const thread = previous.conversations[c.id];
      if (!thread || !previous.likes.includes(c.id) || !thread.candidate.mutual || thread.candidate.species !== action.pet.species) return store;
      if (action.type === 'read') next = { ...previous, conversations: { ...previous.conversations, [c.id]: { ...thread, unread: false } } };
      else {
        if (!validMessage(action.text)) return store;
        const messages = [...thread.messages, { id: (thread.messages.at(-1)?.id ?? 0) + 1, from: action.type === 'send' ? 'me' as const : 'demo' as const, text: action.text.trim() }];
        next = { ...previous, conversations: { ...previous.conversations, [c.id]: { ...thread, messages, unread: action.type === 'reply' ? !action.visible : thread.unread } } };
      }
    }
  }
  return { ...store, [action.pet.id]: next };
}
