import type { Coordinates } from './services';
import type { Pet } from './model';

export type Subject = 'own' | 'other';
export type Situation = 'lost' | 'injured' | 'needs-help';
export type Species = Pet['species'] | 'Diğer / bilmiyorum';
export type SafePet = Pick<Pet, 'id' | 'name' | 'species' | 'age'>;
export type ReportDraft = {
  subject: Subject | null;
  pet: SafePet | null;
  species: Species | null;
  name: string;
  situation: Situation | null;
  description: string;
  photos: string[];
  location: { address: string; coordinates?: Coordinates; confirmed: boolean };
  observedAt: string;
  audience: { community: boolean; vets: boolean };
};
export type ReportPayload = Omit<ReportDraft, 'pet'> & {
  ownerId: string;
  pet: SafePet | null;
  communityLocation: string;
  status: 'open' | 'resolved';
};
// A future backend may implement these ports. This revision keeps every report local.
export type ReportPublishingPort = { publish: (report: ReportPayload) => Promise<{ id: string }> };
export type ReportModerationPort = { flag: (reportId: string, reason: string) => Promise<void> };
export const emptyReport = (): ReportDraft => ({ subject: null, pet: null, species: null, name: '', situation: null,
  description: '', photos: [], location: { address: '', confirmed: false }, observedAt: '', audience: { community: true, vets: false } });
export const situationLabel: Record<Situation, string> = { lost: 'Kayıp', injured: 'Yaralı', 'needs-help': 'Yardıma ihtiyacı var' };
export function createSubmissionGuard() {
  let inFlight = false;
  return async (work: () => Promise<void>): Promise<boolean> => {
    if (inFlight) return false;
    inFlight = true;
    try { await work(); return true; }
    finally { inFlight = false; }
  };
}
export function reportError(draft: ReportDraft, now = new Date()): string | null {
  if (!draft.subject) return 'Kimin için bildirdiğinizi seçin.';
  if (draft.subject === 'own' && !draft.pet) return 'Hayvanınızı seçin.';
  if (draft.subject === 'other' && !draft.species) return 'Hayvanın türünü seçin.';
  if (!draft.situation) return 'Ne olduğunu seçin.';
  const length = draft.description.trim().length;
  if (length < 20) return 'Açıklama en az 20 karakter olmalı.';
  if (length > 500) return 'Açıklama en fazla 500 karakter olabilir.';
  if (!draft.photos.length) return 'En az bir fotoğraf seçin.';
  if (draft.photos.length > 5) return 'En fazla 5 fotoğraf ekleyebilirsiniz.';
  if (!draft.location.address.trim() && !draft.location.coordinates) return 'Konum veya adres seçin.';
  if (!draft.location.confirmed) return 'Seçilen konumu onaylayın.';
  if (!draft.observedAt.trim()) return 'Görülme zamanını girin.';
  const observed = new Date(draft.observedAt);
  if (!Number.isFinite(observed.getTime())) return 'Geçerli bir zaman girin.';
  if (observed.getTime() > now.getTime()) return 'Gelecek zaman seçilemez.';
  if (!draft.audience.community && !draft.audience.vets) return 'En az bir görünürlük hedefi seçin.';
  return null;
}
export function publicReport(draft: ReportDraft, ownerId: string): ReportPayload {
  const pet = draft.subject === 'own' && draft.pet
    ? { id: draft.pet.id, name: draft.pet.name, species: draft.pet.species, age: draft.pet.age } : null;
  const address = draft.location.address.trim();
  return { ...draft, ownerId, pet, photos: [...draft.photos], description: draft.description.trim(),
    location: { ...draft.location }, communityLocation: address.split(/[ ,·]/)[0] || 'Yaklaşık bölge', status: 'open' };
}
