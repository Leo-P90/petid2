import type { SupabaseClient } from '@supabase/supabase-js';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { randomUUID } from 'expo-crypto';
import type { Pet } from '../core/model';
import { validateFile } from '../core/health';

type PetRow = { id: string; name: string; species: Pet['species']; age_label: string | null; pet_photos?: { object_name: string }[] };
export class PetMutationError extends Error {
  readonly code = 'not-found-or-forbidden';
  constructor() { super('Pet record was not found or is not accessible.'); }
}
export function requireAffected<T>(data: T | null): T {
  if (!data) throw new PetMutationError();
  return data;
}
export const normalizeAge = (value: string | null) => value ?? '';
export function createPetRepository(client: SupabaseClient | null) {
  const requireClient = () => { if (!client) throw new Error('unconfigured'); return client; };
  async function hydrate(row: PetRow): Promise<Pet> {
    const signed = await Promise.all((row.pet_photos ?? []).map(async ({ object_name }) => {
      const { data, error } = await requireClient().storage.from('pet-photos').createSignedUrl(object_name, 3600);
      if (error) throw error; return { url: data.signedUrl, object_name };
    }));
    return { id: row.id, name: row.name, species: row.species, age: normalizeAge(row.age_label), photos: signed.map((item) => item.url), photoObjects: Object.fromEntries(signed.map((item) => [item.url, item.object_name])) };
  }
  return {
    configured: Boolean(client),
    async list(): Promise<Pet[]> { const { data, error } = await requireClient().from('pets').select('id,name,species,age_label,pet_photos(object_name)').order('created_at'); if (error) throw error; return Promise.all(((data ?? []) as PetRow[]).map(hydrate)); },
    async create(input: Pick<Pet, 'name' | 'species' | 'age'>): Promise<Pet> { const { data, error } = await requireClient().from('pets').insert({ name: input.name.trim(), species: input.species, age_label: input.age.trim() }).select('id,name,species,age_label').single(); if (error) throw error; return hydrate(data as PetRow); },
    async update(id: string, changes: Partial<Pick<Pet, 'name' | 'species' | 'age'>>): Promise<void> { const body = { ...(changes.name === undefined ? {} : { name: changes.name.trim() }), ...(changes.species === undefined ? {} : { species: changes.species }), ...(changes.age === undefined ? {} : { age_label: changes.age.trim() || null }) }; if (!Object.keys(body).length) return; const { data, error } = await requireClient().from('pets').update(body).eq('id', id).select('id').maybeSingle(); if (error) throw error; requireAffected(data); },
    async remove(id: string): Promise<void> {
      const { data: matchMedia, error: matchError } = await requireClient().from('match_media').select('object_name').eq('pet_id', id); if (matchError) throw matchError;
      const matchPaths = (matchMedia ?? []).map((item) => item.object_name as string);
      if (matchPaths.length) { const { error } = await requireClient().storage.from('match-media').remove(matchPaths); if (error) throw error; }
      const { data: documents, error: documentError } = await requireClient().from('health_documents').select('storage_path').eq('pet_id', id); if (documentError) throw documentError;
      const documentPaths = (documents ?? []).map((item) => item.storage_path as string);
      if (documentPaths.length) { const { error } = await requireClient().storage.from('health-documents').remove(documentPaths); if (error) throw error; }
      const { data: photos, error: readError } = await requireClient().from('pet_photos').select('object_name').eq('pet_id', id); if (readError) throw readError;
      const names = (photos ?? []).map((item) => item.object_name as string);
      if (names.length) { const { error } = await requireClient().storage.from('pet-photos').remove(names); if (error) throw error; }
      const { data, error } = await requireClient().from('pets').delete().eq('id', id).select('id').maybeSingle(); if (error) throw error; requireAffected(data);
    },
    async uploadPhoto(ownerId: string, petId: string, uri: string): Promise<{ url: string; objectName: string }> {
      // Native bytes come from Expo's file API, never RN fetch/Blob/FormData.
      const file = Platform.OS === 'web' ? await (await fetch(uri)).blob() : new File(uri);
      const mime = file.type || 'image/jpeg'; const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
      validateFile(mime, file.size, true);
      const randomId = randomUUID();
      const objectName = `${ownerId}/${petId}/${randomId}.${extensions[mime]}`;
      const { error: uploadError } = await requireClient().storage.from('pet-photos').upload(objectName, await file.arrayBuffer(), { contentType: mime, upsert: false });
      if (uploadError) throw uploadError;
      const { error: metadataError } = await requireClient().from('pet_photos').insert({ owner_id: ownerId, pet_id: petId, object_name: objectName });
      if (metadataError) { await requireClient().storage.from('pet-photos').remove([objectName]); throw metadataError; }
      const { data, error } = await requireClient().storage.from('pet-photos').createSignedUrl(objectName, 3600); if (error) throw error;
      return { url: data.signedUrl, objectName };
    },
    async removePhoto(objectName: string): Promise<void> {
      const { error: storageError } = await requireClient().storage.from('pet-photos').remove([objectName]); if (storageError) throw storageError;
      const { data, error } = await requireClient().from('pet_photos').delete().eq('object_name', objectName).select('id').maybeSingle(); if (error) throw error; requireAffected(data);
    },
    async refreshPhotos(pet: Pet): Promise<Pet> {
      const names = Object.values(pet.photoObjects ?? {});
      return hydrate({ id: pet.id, name: pet.name, species: pet.species, age_label: pet.age || null, pet_photos: names.map((object_name) => ({ object_name })) });
    },
  };
}
