import type { SupabaseClient } from '@supabase/supabase-js';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { fileTypes, validateFile, validateHealth, type HealthInput, type HealthRecord, type HealthDocument } from '../core/health';
import type { SelectedFile } from '../core/services';
import { requireAffected } from './pets';

export function createHealthRepository(client: SupabaseClient | null) {
  function db() { if (!client) throw new Error('unconfigured'); return client; }
  return {
    async records(petId: string): Promise<HealthRecord[]> {
      const { data, error } = await db().from('health_records').select('*').eq('pet_id', petId).order('occurred_on', { ascending: false }).order('created_at', { ascending: false });
      if (error) throw error; return data ?? [];
    },
    async save(ownerId: string, petId: string, input: HealthInput, id?: string) {
      const values = validateHealth(input);
      const query = id ? db().from('health_records').update(values).eq('id', id).eq('pet_id', petId).eq('owner_id', ownerId) : db().from('health_records').insert({ ...values, owner_id: ownerId, pet_id: petId });
      const { data, error } = await query.select('id').maybeSingle(); if (error) throw error; requireAffected(data);
    },
    async remove(petId: string, id: string) {
      const { data, error } = await db().from('health_records').delete().eq('pet_id', petId).eq('id', id).select('id').maybeSingle(); if (error) throw error; requireAffected(data);
    },
    async documents(petId: string): Promise<HealthDocument[]> {
      const { data, error } = await db().from('health_documents').select('*').eq('pet_id', petId).order('created_at', { ascending: false }); if (error) throw error; return data ?? [];
    },
    async upload(ownerId: string, petId: string, selected: SelectedFile, recordId: string | null = null) {
      const file = Platform.OS === 'web' ? await (await fetch(selected.uri)).blob() : new File(selected.uri);
      const mime = selected.mimeType || file.type;
      validateFile(mime, file.size);
      if (!selected.name.trim() || selected.name.length > 255) throw new Error('Geçersiz dosya adı.');
      const uuid = randomUUID();
      const path = `${ownerId}/${petId}/${uuid}.${fileTypes[mime]}`;
      const storage = db().storage.from('health-documents');
      const { error } = await storage.upload(path, await file.arrayBuffer(), { contentType: mime, upsert: false }); if (error) throw error;
      const { error: metadataError } = await db().from('health_documents').insert({ owner_id: ownerId, pet_id: petId, record_id: recordId, storage_path: path, file_name: selected.name, mime_type: mime, size_bytes: file.size });
      if (metadataError) { const { error: rollbackError } = await storage.remove([path]); if (rollbackError) throw new Error('Belge kaydedilemedi; yüklenen dosyanın temizlenmesi de başarısız. Yeniden deneyin.'); throw metadataError; }
    },
    async signedUrl(path: string) {
      const { data, error } = await db().storage.from('health-documents').createSignedUrl(path, 300); if (error) throw error; return data.signedUrl;
    },
    async removeDocument(attachment: HealthDocument) {
      const { error: storageError } = await db().storage.from('health-documents').remove([attachment.storage_path]); if (storageError) throw storageError;
      const { data, error } = await db().from('health_documents').delete().eq('id', attachment.id).eq('pet_id', attachment.pet_id).select('id').maybeSingle(); if (error) throw error; requireAffected(data);
    },
  };
}

