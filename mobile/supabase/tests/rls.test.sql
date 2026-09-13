begin;
select plan(33);
set local storage.allow_delete_query = 'true';
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','a@example.test'),
 ('22222222-2222-4222-8222-222222222222','b@example.test');

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select lives_ok($$insert into public.profiles(id) values ('11111111-1111-4111-8111-111111111111')$$,'A inserts own profile');
select throws_ok($$insert into public.profiles(id) values ('22222222-2222-4222-8222-222222222222')$$,'42501',null,'A cannot insert B profile');
select lives_ok($$insert into public.pets(id,name,species,age_label) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','Mavi','Kedi',null)$$,'A inserts pet with null age');
select lives_ok($$insert into storage.objects(bucket_id,name,owner_id) values ('pet-photos','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa.jpg','11111111-1111-4111-8111-111111111111')$$,'A inserts own object');
select lives_ok($$insert into public.pet_photos(owner_id,pet_id,object_name) values ('11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa.jpg')$$,'A inserts metadata');
select throws_ok($$update public.pets set owner_id='22222222-2222-4222-8222-222222222222'$$,'42501',null,'A cannot transfer ownership');
select throws_ok($$update public.pet_photos set owner_id='22222222-2222-4222-8222-222222222222'$$,'42501',null,'A cannot transfer metadata ownership');

reset role; set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select is((select count(*)::int from public.pets),0,'B cannot read A pet');
select results_eq($$update public.pets set name='X' returning id$$,array[]::uuid[],'B cannot update A pet');
select results_eq($$delete from public.pets returning id$$,array[]::uuid[],'B cannot delete A pet');
select throws_ok($$insert into public.pets(owner_id,name,species) values ('11111111-1111-4111-8111-111111111111','X','Kedi')$$,'42501',null,'B cannot insert A-owned pet');
select results_eq($$update public.pets set owner_id='22222222-2222-4222-8222-222222222222' returning id$$,array[]::uuid[],'B cannot claim A pet');
select is((select count(*)::int from public.pet_photos),0,'B cannot read A metadata');
select results_eq($$update public.pet_photos set object_name=object_name returning id$$,array[]::uuid[],'B cannot update A metadata');
select results_eq($$delete from public.pet_photos returning id$$,array[]::uuid[],'B cannot delete A metadata');
select throws_ok($$insert into public.pet_photos(owner_id,pet_id,object_name) values ('22222222-2222-4222-8222-222222222222','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb.jpg')$$,'42501',null,'B cannot attach metadata to A pet');
select is((select count(*)::int from storage.objects where bucket_id='pet-photos'),0,'B cannot read A object');
select results_eq($$update storage.objects set metadata='{}' returning id$$,array[]::uuid[],'B cannot update A object');
select results_eq($$delete from storage.objects returning id$$,array[]::uuid[],'B cannot delete A object');
select throws_ok($$insert into storage.objects(bucket_id,name,owner_id) values ('pet-photos','11111111-1111-4111-8111-111111111111/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb.jpg','22222222-2222-4222-8222-222222222222')$$,'42501',null,'B cannot insert A path');
select throws_ok($$insert into storage.objects(bucket_id,name,owner_id) values ('pet-photos','22222222-2222-4222-8222-222222222222/cccccccc-cccc-4ccc-8ccc-cccccccccccc/bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb.jpg','22222222-2222-4222-8222-222222222222')$$,'42501',null,'unknown pet path rejected');
select lives_ok($$insert into public.pets(id,name,species) values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','Pati','Köpek')$$,'B inserts own pet');
select lives_ok($$insert into storage.objects(bucket_id,name,owner_id) values ('pet-photos','22222222-2222-4222-8222-222222222222/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb.png','22222222-2222-4222-8222-222222222222')$$,'B inserts own object');
select is((select count(*)::int from storage.objects where bucket_id='pet-photos'),1,'B selects own object (upsert SELECT)');
select lives_ok($$update storage.objects set metadata='{}' where name like '22222222-%'$$,'B updates own object (upsert UPDATE)');
select lives_ok($$delete from storage.objects where name like '22222222-%'$$,'B deletes own object');
select throws_ok($$insert into storage.objects(bucket_id,name,owner_id) values ('pet-photos','22222222-2222-4222-8222-222222222222/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb/extra/file.jpg','22222222-2222-4222-8222-222222222222')$$,'42501',null,'nested path rejected');

reset role; set local role anon;
select throws_ok($$select * from public.pets$$,'42501',null,'anon cannot read pets');
select throws_ok($$select * from public.pet_photos$$,'42501',null,'anon cannot read metadata');
select is((select count(*)::int from storage.objects where bucket_id='pet-photos'),0,'anon cannot read objects');
select results_eq($$update storage.objects set metadata='{}' returning id$$,array[]::uuid[],'anon cannot update objects');
select results_eq($$delete from storage.objects returning id$$,array[]::uuid[],'anon cannot delete objects');
select throws_ok($$insert into storage.objects(bucket_id,name) values ('pet-photos','anon/file.jpg')$$,'42501',null,'anon cannot insert objects');
select * from finish();
rollback;
