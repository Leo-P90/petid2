import type { SupabaseClient } from '@supabase/supabase-js';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { randomUUID } from 'expo-crypto';
import { eligibleCandidate, matchMessage, profileInput, uniqueMessages, type MatchProfile, type MatchProfileInput, type MatchSnapshot, type MatchMedia, type LiveMessage, type ReadState, type Verification } from '../core/match-live';
import type { Pet } from '../core/model';
const columns = 'pet_id,owner_id,species,display_name,birth_date,age_label,breed,sex,bio,city,district,active';
export function secureRequestId() { return randomUUID(); }
// RN Blob lacks arrayBuffer(); FileReader uses the native Blob module.
export function nativeBlobBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Fotoğraf okunamadı.'));
    reader.onload = () => { const value = reader.result; if (typeof value !== 'string' || !value.includes(',')) reject(new Error('Geçersiz fotoğraf verisi.')); else resolve(value.slice(value.indexOf(',') + 1)); };
    reader.readAsDataURL(blob);
  });
}
export function createMatchRepository(client: SupabaseClient | null) {
  const db = () => { if (!client) throw new Error('PatiMatch bağlantısı yapılandırılmadı.'); return client; };
  async function rpc(name: string, args: Record<string, unknown>) { const { data, error } = await db().rpc(name, args); if (error) throw error; return data; }
  return {
    async snapshot(petId: string): Promise<MatchSnapshot> {
      const ownResult = await db().from('match_profiles').select(columns).eq('pet_id', petId).maybeSingle(); if (ownResult.error) throw ownResult.error;
      const profile = ownResult.data as MatchProfile | null;
      if (!profile) return { profile: null, candidates: [], threads: [], media: [] };
      const [pool, likes, participants, media, ownVerification] = await Promise.all([
        db().from('match_profiles').select(columns).eq('species', profile.species).eq('active', true).neq('owner_id', profile.owner_id),
        db().from('match_likes').select('liked_pet').eq('liker_pet', petId),
        db().from('match_participants').select('conversation_id').eq('pet_id', petId),
        db().from('match_media').select('id,pet_id,object_name').eq('pet_id', petId),
        db().from('pet_verifications').select('status').eq('pet_id', petId).maybeSingle(),
      ]); for (const result of [pool, likes, participants, media, ownVerification]) if (result.error) throw result.error;
      const threads = await Promise.all((participants.data ?? []).map(async ({ conversation_id: id }) => {
        const [members, messages, reads] = await Promise.all([
          db().from('match_participants').select('pet_id').eq('conversation_id', id).neq('pet_id', petId),
          db().from('match_messages').select('*').eq('conversation_id', id).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(200),
          db().from('match_reads').select('*').eq('conversation_id', id),
        ]); for (const result of [members, messages, reads]) if (result.error) throw result.error;
        const target = members.data?.[0]?.pet_id; if (!target) return null;
        const [candidate, verification] = await Promise.all([
          db().from('match_profiles').select(columns).eq('pet_id', target).maybeSingle(),
          db().from('pet_verifications').select('status').eq('pet_id', target).maybeSingle(),
        ]); if (candidate.error) throw candidate.error; if (verification.error) throw verification.error;
        if (!candidate.data) return null;
        return { id, candidate: candidate.data as MatchProfile, messages: uniqueMessages((messages.data ?? []) as LiveMessage[]), reads: (reads.data ?? []) as ReadState[], verification: (verification.data?.status ?? null) as Verification['status'] | null };
      }));
      return { profile, candidates: ((pool.data ?? []) as MatchProfile[]).filter(other => eligibleCandidate(profile, other) && !likes.data?.some(like => like.liked_pet === other.pet_id)), threads: threads.filter(row => row !== null), media: (media.data ?? []) as MatchMedia[], ownVerification: (ownVerification.data?.status ?? null) as Verification['status'] | null };
    },
    async saveProfile(ownerId: string, pet: Pick<Pet, 'id' | 'species'>, input: MatchProfileInput) {
      const { error } = await db().from('match_profiles').upsert({ ...profileInput(input), owner_id: ownerId, pet_id: pet.id, species: pet.species }, { onConflict: 'pet_id' }); if (error) throw error;
    },
    async like(source: MatchProfile, target: MatchProfile): Promise<string | null> {
      if (!eligibleCandidate(source, target)) throw new Error('Yalnız başka sahibin aktif aynı tür profili beğenilebilir.');
      return rpc('match_like', { source_pet: source.pet_id, target_pet: target.pet_id });
    },
    async send(c: string, p: string, body: string, requestId: string) { return rpc('match_send', { c, p, text_body: matchMessage(body), request_id: requestId }); },
    async read(c: string, p: string, messageId: string | null) { await rpc('match_read', { c, p, message_id: messageId }); },
    async block(p: string, target: string) { await rpc('match_block', { p, target }); },
    async unmatch(c: string, p: string) { await rpc('match_unmatch', { c, p }); },
    async report(target: string, reason: 'spam' | 'harassment' | 'unsafe' | 'other', description: string) {
      if (!['spam', 'harassment', 'unsafe', 'other'].includes(reason) || [...description.trim()].length > 500) throw new Error('Şikâyet alanlarını kontrol edin.');
      const { error } = await db().from('match_reports').insert({ target_pet: target, reason, description: description.trim() }); if (error) throw error;
    },
    async upload(petId: string, uri: string) {
      const source = Platform.OS === 'web' ? await (await fetch(uri)).blob() : new File(uri);
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(source.type) || source.size < 1 || source.size > 5242880) throw new Error('JPEG, PNG veya WebP · en fazla 5 MB.');
      // Decode pixels into a NEW bitmap; never copy source EXIF/GPS metadata.
      const context = ImageManipulator.manipulate(uri); let rendered: Awaited<ReturnType<typeof context.renderAsync>> | undefined; let savedUri = '';
      try {
        rendered = await context.renderAsync();
        const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 }); savedUri = saved.uri;
        const file = Platform.OS === 'web' ? await (await fetch(saved.uri)).blob() : new File(saved.uri);
        if (file.size < 1 || file.size > 5242880) throw new Error('Paylaşılan fotoğraf en fazla 5 MB olmalı.');
        const object_name = `${secureRequestId()}.jpg`; const storage = db().storage.from('match-media');
        const { data, error } = await db().from('match_media').insert({ pet_id: petId, object_name }).select('id').single(); if (error) throw error;
        const { error: uploadError } = await storage.upload(object_name, await file.arrayBuffer(), { contentType: 'image/jpeg', upsert: false });
        if (uploadError) { const rollback = await db().from('match_media').delete().eq('id', data.id); if (rollback.error) throw new Error('Yükleme ve temizleme başarısız; yeniden deneyin.'); throw uploadError; }
      } finally { rendered?.release(); context.release(); if (Platform.OS !== 'web' && savedUri) { const cached = new File(savedUri); if (cached.exists) cached.delete(); } }
    },
    async removeMedia(media: MatchMedia) {
      const storage = await db().storage.from('match-media').remove([media.object_name]); if (storage.error) throw storage.error;
      const { error } = await db().from('match_media').delete().eq('id', media.id); if (error) throw error;
    },
    async photo(petId: string): Promise<{ uri: string; dispose: () => void } | null> {
      const { data, error } = await db().from('match_media').select('object_name').eq('pet_id', petId).order('created_at').limit(1).maybeSingle(); if (error) throw error; if (!data) return null;
      const result = await db().storage.from('match-media').download(data.object_name); if (result.error) throw result.error;
      if (Platform.OS === 'web') { const uri = URL.createObjectURL(result.data); return { uri, dispose: () => URL.revokeObjectURL(uri) }; }
      const file = new File(Paths.cache, `match-${secureRequestId()}.${data.object_name.split('.').at(-1)}`);
      const bytes = await nativeBlobBase64(result.data);
      file.create(); file.write(bytes, { encoding: 'base64' });
      (result.data as Blob & { close?: () => void }).close?.();
      return { uri: file.uri, dispose: () => { if (file.exists) file.delete(); } };
    },
  };
}
