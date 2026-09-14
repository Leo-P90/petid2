import type { Pet } from './model';
export type MatchProfile = {
  pet_id: string; owner_id: string; species: Pet['species']; display_name: string;
  birth_date: string | null; age_label: string | null; breed: string; sex: 'Dişi' | 'Erkek' | 'Belirtilmedi';
  bio: string; city: string; district: string; active: boolean;
};
export type MatchProfileInput = Omit<MatchProfile, 'owner_id' | 'pet_id' | 'species'>;
export type MatchMedia = { id: string; pet_id: string; object_name: string };
export type LiveMessage = { id: string; conversation_id: string; sender_pet: string; client_id: string; body: string; created_at: string };
export type ReadState = { conversation_id: string; pet_id: string; last_message_id: string | null; read_at: string };
export type Verification = { pet_id: string; status: 'pending' | 'verified' | 'rejected' };
export type LiveThread = { id: string; candidate: MatchProfile; messages: LiveMessage[]; reads: ReadState[]; verification: Verification['status'] | null };
export type MatchSnapshot = { profile: MatchProfile | null; candidates: MatchProfile[]; threads: LiveThread[]; media: MatchMedia[] };
export function matchMessage(text: string) {
  const body = text.trim(); if (!body || [...body].length > 500) throw new Error('Mesaj 1–500 karakter olmalı.'); return body;
}
export function eligibleCandidate(own: MatchProfile, other: MatchProfile) {
  return own.active && other.active && own.pet_id !== other.pet_id && own.owner_id !== other.owner_id && own.species === other.species;
}
export function profileInput(input: MatchProfileInput): MatchProfileInput {
  const next = { ...input, display_name: input.display_name.trim(), bio: input.bio.trim(), city: input.city.trim(), district: input.district.trim(), breed: input.breed.trim() };
  if (!next.display_name || [...next.display_name].length > 50 || [...next.bio].length > 500 || next.city.length > 80 || next.district.length > 80 || next.breed.length > 80 || (next.age_label?.length ?? 0) > 40) throw new Error('Profil alanlarını kontrol edin.');
  if (!['Dişi', 'Erkek', 'Belirtilmedi'].includes(next.sex)) throw new Error('Geçersiz cinsiyet.');
  if (next.birth_date && (!/^\d{4}-\d{2}-\d{2}$/.test(next.birth_date) || new Date(next.birth_date).toISOString().slice(0, 10) !== next.birth_date || next.birth_date > new Date().toISOString().slice(0, 10))) throw new Error('Geçersiz doğum tarihi.');
  return next;
}
export const uniqueMessages = (rows: LiveMessage[]) => [...new Map(rows.map(row => [row.id, row])).values()].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
export function unread(thread: LiveThread, petId: string) {
  const last = thread.messages.at(-1); const read = thread.reads.find(row => row.pet_id === petId);
  return !!last && last.sender_pet !== petId && read?.last_message_id !== last.id;
}
