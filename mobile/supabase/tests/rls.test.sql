begin;
select plan(12);

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'owner-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'owner-b@example.test');

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select lives_ok($$insert into public.profiles(id) values ('11111111-1111-4111-8111-111111111111')$$, 'owner inserts own profile');
select throws_ok($$insert into public.profiles(id) values ('22222222-2222-4222-8222-222222222222')$$, '42501', null, 'owner cannot insert another profile');
select lives_ok($$insert into public.pets(name,species,age_label) values ('Mavi','Kedi','2 yaş')$$, 'owner inserts own pet');
select is((select count(*)::int from public.pets), 1, 'owner sees own pet');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select is((select count(*)::int from public.pets), 0, 'second user cannot select first user pet');
select results_eq($$update public.pets set name='Çalınan' where name='Mavi' returning id$$, array[]::uuid[], 'second user cannot update first user pet');
select results_eq($$delete from public.pets where name='Mavi' returning id$$, array[]::uuid[], 'second user cannot delete first user pet');
select throws_ok($$insert into public.pets(owner_id,name,species) values ('11111111-1111-4111-8111-111111111111','Sahte','Kedi')$$, '42501', null, 'second user cannot insert for first user');

reset role;
set local role anon;
select throws_ok($$select * from public.profiles$$, '42501', null, 'anon cannot select profiles');
select throws_ok($$select * from public.pets$$, '42501', null, 'anon cannot select pets');
select throws_ok($$select * from public.pet_photos$$, '42501', null, 'anon cannot select photo metadata');
select throws_ok($$insert into public.pets(name,species) values ('Anon','Kedi')$$, '42501', null, 'anon cannot insert pets');

select * from finish();
rollback;
