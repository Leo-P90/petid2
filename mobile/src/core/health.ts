export const healthKinds = ['vaccine', 'medication', 'weight', 'exam', 'general'] as const;
export type HealthKind = typeof healthKinds[number];
export type HealthInput = { kind: HealthKind; title: string; occurred_on: string; due_on: string | null; notes: string | null; weight_kg: number | null };
export type HealthRecord = HealthInput & { id: string; owner_id: string; pet_id: string; created_at: string; updated_at: string };
export type HealthDocument = { id: string; owner_id: string; pet_id: string; record_id: string | null; storage_path: string; file_name: string; mime_type: string; size_bytes: number; created_at: string; updated_at: string };
export const fileTypes: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export function validateFile(mime: string, size: number, photo = false) {
  if (!fileTypes[mime] || (photo && mime === 'application/pdf') || !Number.isSafeInteger(size) || size <= 0 || size > 10 * 1024 * 1024) throw new Error('PDF, JPEG, PNG veya WebP; dosya boyutu 0–10 MB arasında olmalı.');
}
export function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function validateHealth(input: HealthInput): HealthInput {
  if (!healthKinds.includes(input.kind) || !input.title.trim() || input.title.trim().length > 120) throw new Error('Geçerli tür ve 1–120 karakter başlık girin.');
  if (!validDate(input.occurred_on) || (input.due_on !== null && (!validDate(input.due_on) || input.due_on < input.occurred_on))) throw new Error('Tarih YYYY-AA-GG olmalı; sonraki tarih kayıt tarihinden önce olamaz.');
  if (input.kind === 'weight' ? !(input.weight_kg !== null && Number.isFinite(input.weight_kg) && input.weight_kg > 0 && input.weight_kg <= 1000) : input.weight_kg !== null) throw new Error('Kilo ölçümü 0–1000 kg arasında olmalı.');
  if ((input.notes?.length ?? 0) > 5000) throw new Error('Not en fazla 5000 karakter olabilir.');
  return { ...input, title: input.title.trim(), notes: input.notes?.trim() || null };
}
