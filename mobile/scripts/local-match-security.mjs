import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { createClient } from '@supabase/supabase-js';
const url = process.env.LOCAL_SUPABASE_URL || 'http://127.0.0.1:54321';
assert.match(url, /^http:\/\/(127\.0\.0\.1|localhost):\d+$/);
const key = process.env.LOCAL_SUPABASE_PUBLISHABLE_KEY; assert.ok(key);
const client = () => createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const ok = r => { assert.equal(r.error, null, r.error?.message); return r.data; };
const deny = r => assert.ok(r.error, 'request must be denied');
const a = client(), b = client(), c = client(), anon = client(); const suffix = randomUUID();
for (const [who, name] of [[a, 'a'], [b, 'b'], [c, 'c']]) {
  const credentials = { email: `match-${name}-${suffix}@example.test`, password: `Local-${suffix}!` };
  ok(await who.auth.signUp(credentials)); ok(await who.auth.signInWithPassword(credentials));
}
async function pet(who, species, active = true) {
  const row = ok(await who.from('pets').insert({ name: 'Synthetic match test', species }).select().single());
  return ok(await who.from('match_profiles').insert({ pet_id: row.id, species, display_name: row.name, active, city: 'Test city' }).select().single());
}
const ac = await pet(a, 'Kedi'), ad = await pet(a, 'Köpek'), ac2 = await pet(a, 'Kedi');
const bc = await pet(b, 'Kedi'), bd = await pet(b, 'Köpek'), cc = await pet(c, 'Kedi', false);
const like = (who, source, target) => who.rpc('match_like', { source_pet: source.pet_id, target_pet: target.pet_id });
for (const [source, target] of [[ac, ac], [ac, ac2], [ac, bd], [ac, cc], [bc, ac]]) deny(await like(a, source, target));
assert.equal(ok(await like(a, ac, bc)), null);
assert.deepEqual(ok(await b.from('match_likes').select()), []);
assert.equal(ok(await a.from('match_conversations').select()).length, 0);
const cat = ok(await like(b, bc, ac)); assert.ok(cat);
assert.equal(ok(await like(a, ac, bc)), cat); assert.equal(ok(await like(b, bc, ac)), cat);
// Concurrent mutual likes exercise advisory locking + pair/conversation uniqueness.
const dogResults = await Promise.all([like(a, ad, bd), like(b, bd, ad)]); dogResults.forEach(ok);
const dog = ok(await like(a, ad, bd)); assert.ok(dog);
assert.equal(ok(await a.from('match_conversations').select()).length, 2);
assert.equal(ok(await a.from('match_participants').select()).length, 4);
const send = (who, conversation, source, body, id = randomUUID()) => who.rpc('match_send', { c: conversation, p: source.pet_id, text_body: body, request_id: id });
const request = randomUUID(); const message = ok(await send(a, cat, ac, '  hello  ', request));
assert.equal(ok(await send(a, cat, ac, 'hello', request)), message);
assert.equal(ok(await b.from('match_messages').select().eq('conversation_id', cat)).length, 1);
assert.equal(ok(await b.from('match_messages').select().eq('id', message).single()).body, 'hello');
deny(await send(a, cat, ac, ' ')); deny(await send(a, cat, ac, '\n\t')); deny(await send(a, cat, ac, 'x'.repeat(501)));
deny(await send(a, dog, ac, 'wrong pet')); deny(await send(c, cat, cc, 'third user'));
assert.deepEqual(ok(await c.from('match_messages').select()), []);
ok(await b.rpc('match_read', { c: cat, p: bc.pet_id, message_id: message }));
assert.equal(ok(await a.from('match_reads').select().eq('pet_id', bc.pet_id).single()).last_message_id, message);
deny(await a.rpc('match_read', { c: dog, p: ad.pet_id, message_id: message }));
deny(await b.from('pet_verifications').insert({ pet_id: bc.pet_id, status: 'verified' }));
deny(await b.from('pet_verifications').update({ status: 'verified' }).eq('pet_id', bc.pet_id));
// Server-controlled status visibility itself is additionally exercised by pgTAP.
const report = ok(await a.from('match_reports').insert({ target_pet: bc.pet_id, reason: 'spam', description: 'private synthetic report' }).select().single());
assert.deepEqual(ok(await b.from('match_reports').select().eq('id', report.id)), []);
assert.deepEqual(ok(await c.from('match_reports').select().eq('id', report.id)), []);
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP1sAAAAASUVORK5CYII=', 'base64');
const object = `${randomUUID()}.png`;
ok(await a.from('match_media').insert({ pet_id: ac.pet_id, object_name: object }));
ok(await a.storage.from('match-media').upload(object, image, { contentType: 'image/png' }));
ok(await b.storage.from('match-media').download(object));
deny(await c.storage.from('match-media').download(object)); deny(await anon.storage.from('match-media').download(object));
deny(await b.storage.from('match-media').upload(object, image, { contentType: 'image/png', upsert: true }));
deny(await a.storage.from('match-media').upload(`${randomUUID()}.png`, image, { contentType: 'image/png' }));
deny(await a.from('match_media').insert({ pet_id: bc.pet_id, object_name: `${randomUUID()}.png` }));
const unsafe = `${randomUUID()}.png`; ok(await a.from('match_media').insert({ pet_id: ac.pet_id, object_name: unsafe }));
deny(await a.storage.from('match-media').upload(unsafe, image, { contentType: 'text/html' }));
deny(await a.storage.from('match-media').upload(unsafe, Buffer.alloc(5242881), { contentType: 'image/png' }));
// Private gallery metadata/objects remain inaccessible even after mutual match.
const privatePath = `${ac.owner_id}/${ac.pet_id}/${randomUUID()}.png`;
ok(await a.storage.from('pet-photos').upload(privatePath, image, { contentType: 'image/png' }));
ok(await a.from('pet_photos').insert({ owner_id: ac.owner_id, pet_id: ac.pet_id, object_name: privatePath }));
deny(await b.storage.from('pet-photos').download(privatePath));
assert.deepEqual(ok(await b.from('pet_photos').select().eq('pet_id', ac.pet_id)), []);
assert.deepEqual(ok(await b.from('pets').select().eq('id', ac.pet_id)), []);
ok(await a.rpc('match_unmatch', { c: dog, p: ad.pet_id })); deny(await send(b, dog, bd, 'unmatched'));
ok(await a.rpc('match_block', { p: ac.pet_id, target: bc.pet_id }));
deny(await send(a, cat, ac, 'blocked')); deny(await send(b, cat, bc, 'blocked'));
deny(await b.storage.from('match-media').download(object));
assert.deepEqual(ok(await b.from('match_profiles').select().eq('owner_id', ac.owner_id)), []);
assert.deepEqual(ok(await a.from('match_profiles').select().eq('owner_id', bc.owner_id)), []);
assert.deepEqual(ok(await b.from('match_conversations').select()), []);
deny(await like(b, bc, ac)); deny(await anon.from('match_profiles').select());
ok(await a.storage.from('match-media').remove([object])); ok(await a.storage.from('pet-photos').remove([privatePath]));
for (const [who, pets] of [[a, [ac, ad, ac2]], [b, [bc, bd]], [c, [cc]]]) {
  for (const p of pets) ok(await who.from('pets').delete().eq('id', p.pet_id));
  ok(await who.auth.signOut());
}
console.log('Three synthetic local users: cat/dog mutual, concurrent idempotency, owner/species rejection, message/read, block/unmatch, report/media/private-photo isolation PASS.');
