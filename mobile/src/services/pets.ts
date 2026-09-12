import type { SupabaseClient } from '@supabase/supabase-js';
import type { Pet } from '../core/model';

type PetRow = { id: string; name: string; species: Pet['species']; age_label: string; pet_photos?: { object_name: string }[] };
export function createPetRepository(client: SupabaseClient | null) {
  const requireClient = () => { if (!client) throw new Error('unconfigured'); return client; };
  async function hydrate(row: PetRow): Promise<Pet> {
    const signed = await Promise.all((row.pet_photos ?? []).map(async ({ object_name }) => {
      const { data, error } = await requireClient().storage.from('pet-photos').createSignedUrl(object_name, 3600);
      if (error) throw error; return { url: data.signedUrl, object_name };
    }));
    return { id: row.id, name: row.name, species: row.species, age: row.age_label, photos: signed.map((item) => item.url), photoObjects: Object.fromEntries(signed.map((item) => [item.url, item.object_name])) };
  }
  return {
    configured: Boolean(client),
    async list(): Promise<Pet[]> { const { data, error } = await requireClient().from('pets').select('id,name,species,age_label,pet_photos(object_name)').order('created_at'); if (error) throw error; return Promise.all(((data ?? []) as PetRow[]).map(hydrate)); },
    async create(input: Pick<Pet, 'name' | 'species' | 'age'>): Promise<Pet> { const { data, error } = await requireClient().from('pets').insert({ name: input.name.trim(), species: input.species, age_label: input.age.trim() }).select('id,name,species,age_label').single(); if (error) throw error; return hydrate(data as PetRow); },
    async update(id: string, changes: Partial<Pick<Pet, 'name' | 'species' | 'age'>>): Promise<void> { const body = { ...(changes.name === undefined ? {} : { name: changes.name.trim() }), ...(changes.species === undefined ? {} : { species: changes.species }), ...(changes.age === undefined ? {} : { age_label: changes.age.trim() }) }; if (!Object.keys(body).length) return; const { error } = await requireClient().from('pets').update(body).eq('id', id); if (error) throw error; },
    async remove(id: string): Promise<void> {
      const { data: photos, error: readError } = await requireClient().from('pet_photos').select('object_name').eq('pet_id', id); if (readError) throw readError;
      const names = (photos ?? []).map((item) => item.object_name as string);
      if (names.length) { const { error } = await requireClient().storage.from('pet-photos').remove(names); if (error) throw error; }
      const { error } = await requireClient().from('pets').delete().eq('id', id); if (error) throw error;
    },
    async uploadPhoto(ownerId: string, petId: string, uri: string): Promise<{ url: string; objectName: string }> {
      const response = await fetch(uri); const blob = await response.blob();
      const mime = blob.type || 'image/jpeg'; const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
      if (!extensions[mime] || blob.size > 5 * 1024 * 1024) throw new Error('unsupported photo');
      const randomId = globalThis.crypto?.randomUUID?.(); if (!randomId) throw new Error('secure uuid unavailable');
      const objectName = `${ownerId}/${petId}/${randomId}.${extensions[mime]}`;
      const { error: uploadError } = await requireClient().storage.from('pet-photos').upload(objectName, await blob.arrayBuffer(), { contentType: mime, upsert: false });
      if (uploadError) throw uploadError;
      const { error: metadataError } = await requireClient().from('pet_photos').insert({ owner_id: ownerId, pet_id: petId, object_name: objectName });
      if (metadataError) { await requireClient().storage.from('pet-photos').remove([objectName]); throw metadataError; }
      const { data, error } = await requireClient().storage.from('pet-photos').createSignedUrl(objectName, 3600); if (error) throw error;
      return { url: data.signedUrl, objectName };
    },
    async removePhoto(objectName: string): Promise<void> {
      const { error: storageError } = await requireClient().storage.from('pet-photos').remove([objectName]); if (storageError) throw storageError;
      const { error } = await requireClient().from('pet_photos').delete().eq('object_name', objectName); if (error) throw error;
    },
  };
}
