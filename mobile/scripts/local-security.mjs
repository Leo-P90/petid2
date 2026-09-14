import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { createClient } from '@supabase/supabase-js';

const url = process.env.LOCAL_SUPABASE_URL || 'http://127.0.0.1:54321';
assert.match(url, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
const key = process.env.LOCAL_SUPABASE_PUBLISHABLE_KEY;
assert.ok(key, 'LOCAL_SUPABASE_PUBLISHABLE_KEY is required; never use a live project');
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = (result) => { assert.equal(result.error, null, result.error?.message); return result.data; };
const a = client(), b = client(), anon = client();
const suffix = randomUUID();
for (const [who, name] of [[a, 'a'], [b, 'b']]) {
  ok(await who.auth.signUp({ email: `${name}-${suffix}@example.test`, password: `Local-test-${suffix}!` }));
  ok(await who.auth.signInWithPassword({ email: `${name}-${suffix}@example.test`, password: `Local-test-${suffix}!` }));
}
const owner = ok(await a.auth.getUser()).user.id;
const pet = ok(await a.from('pets').insert({ name: 'Local test', species: 'Kedi' }).select().single());
const otherPet = ok(await b.from('pets').insert({ name: 'Other test', species: 'Kedi' }).select().single());
const record = ok(await a.from('health_records').insert({ pet_id: pet.id, kind: 'exam', title: 'Local exam', occurred_on: '2026-09-14' }).select().single());
for (const [bucket, table, pathField, ext, mime, body] of [
  ['pet-photos', 'pet_photos', 'object_name', 'png', 'image/png', Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1sAAAAASUVORK5CYII=', 'base64')],
  ['health-documents', 'health_documents', 'storage_path', 'pdf', 'application/pdf', Buffer.from('%PDF-1.4\n% local synthetic document\n%%EOF')],
]) {
  const path = `${owner}/${pet.id}/${randomUUID()}.${ext}`;
  const storage = a.storage.from(bucket), other = b.storage.from(bucket);
  ok(await storage.upload(path, body, { contentType: mime }));
  ok(await storage.upload(path, body, { contentType: mime, upsert: true }));
  const row = { owner_id: owner, pet_id: pet.id, [pathField]: path, ...(table === 'health_documents' ? { record_id: record.id, file_name: 'local.pdf', mime_type: mime, size_bytes: body.length } : {}) };
  const metadata = ok(await a.from(table).insert(row).select().single());
  assert.equal(ok(await a.from(table).select().eq('id', metadata.id)).length, 1);
  ok(await a.from(table).update({ [pathField]: path }).eq('id', metadata.id).select().single());
  assert.equal(ok(await b.from(table).select()).length, 0);
  assert.deepEqual(ok(await b.from(table).update({ [pathField]: path }).eq('id', metadata.id).select()), []);
  assert.deepEqual(ok(await b.from(table).delete().eq('id', metadata.id).select()), []);
  assert.ok((await b.from(table).insert(row)).error);
  assert.ok((await other.download(path)).error);
  assert.ok((await other.createSignedUrl(path, 300)).error);
  assert.ok((await other.upload(path, body, { contentType: mime, upsert: true })).error);
  await other.remove([path]);
  ok(await storage.download(path));
  assert.ok((await anon.storage.from(bucket).download(path)).error);
  assert.ok((await storage.upload(`${owner}/${otherPet.id}/${randomUUID()}.${ext}`, body, { contentType: mime })).error);
  const signed = ok(await storage.createSignedUrl(path, 300));
  assert.equal((await fetch(signed.signedUrl)).status, 200);
  assert.equal(ok(await other.list(`${owner}/${pet.id}`)).length, 0);
  assert.ok((await storage.upload(`${owner}/${pet.id}/${randomUUID()}.${ext}`, Buffer.alloc(10485761), { contentType: mime })).error);
  assert.ok((await storage.upload(`${owner}/${pet.id}/${randomUUID()}.${ext}`, body, { contentType: 'text/html' })).error);
  ok(await storage.remove([path]));
  ok(await a.from(table).delete().eq('id', metadata.id).select().single());
  console.log(`${bucket}: owner upload/read/upsert/sign/delete; cross-user + anonymous/path/MIME/size isolation PASS`);
}
for (const [table, row] of [['health_records', record], ['pets', pet]]) {
  assert.equal(ok(await b.from(table).select().eq('id', row.id)).length, 0);
  assert.deepEqual(ok(await b.from(table).update(table === 'pets' ? { name: 'forbidden' } : { title: 'forbidden' }).eq('id', row.id).select()), []);
  assert.deepEqual(ok(await b.from(table).delete().eq('id', row.id).select()), []);
  assert.ok((await anon.from(table).select()).error);
  ok(await a.from(table).update(table === 'pets' ? { name: 'updated' } : { title: 'updated' }).eq('id', row.id).select().single());
}
ok(await a.from('health_records').delete().eq('id', record.id).select().single());
ok(await a.from('pets').delete().eq('id', pet.id).select().single());
ok(await b.from('pets').delete().eq('id', otherPet.id).select().single());
ok(await a.auth.signOut()); ok(await b.auth.signOut());
console.log('Two-user local API/Storage matrix PASS. Synthetic auth users are discarded with the local stack.');
