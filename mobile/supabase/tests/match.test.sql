begin;
select no_plan();
insert into auth.users(id,email) values
 ('11111111-1111-4111-8111-111111111111','match-a@example.test'),
 ('22222222-2222-4222-8222-222222222222','match-b@example.test'),
 ('33333333-3333-4333-8333-333333333333','match-c@example.test');
insert into public.pets(id,owner_id,name,species) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','11111111-1111-4111-8111-111111111111','A cat','Kedi'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','11111111-1111-4111-8111-111111111111','A dog','Köpek'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3','11111111-1111-4111-8111-111111111111','A cat 2','Kedi'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','22222222-2222-4222-8222-222222222222','B cat','Kedi'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','22222222-2222-4222-8222-222222222222','B dog','Köpek'),
 ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1','33333333-3333-4333-8333-333333333333','C cat','Kedi');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select lives_ok($$insert into public.match_profiles(pet_id,species,display_name,active) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','Kedi','A cat',true),('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','Köpek','A dog',true),('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3','Kedi','A cat 2',true) returning pet_id$$,'owner INSERT RETURNING works without stale helper snapshot');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
insert into public.match_profiles(pet_id,species,display_name,active) values
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','Kedi','B cat',true),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','Köpek','B dog',true);
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
insert into public.match_profiles(pet_id,species,display_name,active) values ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1','Kedi','C cat',false);
reset role;
insert into public.pet_verifications(pet_id,status) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','verified'),('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','pending');
create temp table test_threads(kind text primary key,c uuid);
grant all on test_threads to authenticated;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select is((select count(*)::int from public.pets),3,'private pets only own');
select is((select count(*)::int from public.match_profiles),5,'eligible shared profiles, not inactive C');
select is((select count(*)::int from public.pet_verifications),1,'verification only own before mutual');
select throws_ok($$update public.match_profiles set owner_id='22222222-2222-4222-8222-222222222222' where pet_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,'42501',null,'cannot transfer shared profile');
select throws_ok($$update public.match_profiles set species='Köpek' where pet_id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,'42501',null,'profile species cannot be forged');
select throws_ok($$update public.pets set species='Köpek' where id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,'23514',null,'private pet species cannot invalidate match');
select throws_ok($$select public.match_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1')$$,'42501',null,'self rejected');
select throws_ok($$select public.match_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3')$$,'42501',null,'same owner rejected');
select throws_ok($$select public.match_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2')$$,'42501',null,'cross species rejected');
select throws_ok($$select public.match_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','cccccccc-cccc-4ccc-8ccc-ccccccccccc1')$$,'42501',null,'inactive rejected');
select throws_ok($$select public.match_like('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1')$$,'42501',null,'forged source rejected');
select is(public.match_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'),null::uuid,'one-sided no conversation');
select is((select count(*)::int from public.match_conversations),0,'one-sided no chat');
select public.match_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select is((select count(*)::int from public.match_likes),0,'cannot read other likes');
insert into test_threads values('cat',public.match_like('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'));
insert into test_threads values('dog',public.match_like('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2'));
select is(public.match_like('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'),(select c from test_threads where kind='cat'),'duplicate like idempotent');
select is((select count(*)::int from public.matches),2,'one match each species');
select is((select count(*)::int from public.match_conversations),2,'one conversation per match');
select is((select count(*)::int from public.match_participants),4,'participants derived pair');
select is((select count(*)::int from public.pet_verifications),2,'mutual sees necessary verification');
select throws_ok($$insert into public.pet_verifications values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','verified',now())$$,'42501',null,'cannot self verify');
select throws_ok($$update public.pet_verifications set status='verified'$$,'42501',null,'cannot edit verification');
select throws_ok($$insert into public.matches(pet_a,pet_b) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1')$$,'42501',null,'cannot manufacture match');
select throws_ok($$insert into public.match_messages(conversation_id,sender_pet,body,client_id) select c,'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','x',gen_random_uuid() from test_threads where kind='cat'$$,'42501',null,'messages only validated transaction');
select public.match_send((select c from test_threads where kind='cat'),'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','  hello  ','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
select public.match_send((select c from test_threads where kind='cat'),'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','hello','dddddddd-dddd-4ddd-8ddd-dddddddddddd');
select is((select count(*)::int from public.match_messages),1,'send retry idempotent');
select is((select body from public.match_messages),'hello','trimmed message');
select throws_ok($$select public.match_send((select c from test_threads where kind='cat'),'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','  ',gen_random_uuid())$$,'22023',null,'empty message rejected');
select throws_ok($$select public.match_send((select c from test_threads where kind='cat'),'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',repeat('x',501),gen_random_uuid())$$,'22023',null,'oversized message rejected');
select throws_ok($$select public.match_send((select c from test_threads where kind='dog'),'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','x',gen_random_uuid())$$,'42501',null,'wrong pet conversation rejected');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select lives_ok($$select public.match_read((select c from test_threads where kind='cat'),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',(select id from public.match_messages limit 1))$$,'read saved');
select is((select count(*)::int from public.match_reads),1,'read is pet/conversation scoped');
select throws_ok($$select public.match_read((select c from test_threads where kind='dog'),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',(select id from public.match_messages limit 1))$$,'22023',null,'cross thread read rejected');
select lives_ok($$insert into public.match_reports(target_pet,reason,description) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','spam','private report')$$,'report saved');
select lives_ok($$insert into public.match_media(pet_id,object_name) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','dddddddd-dddd-4ddd-8ddd-dddddddddddd.png')$$,'explicit match media saved');
select throws_ok($$insert into public.match_media(pet_id,object_name) values('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee.png')$$,'42501',null,'cannot attach another pet photo');
select throws_ok($$insert into public.match_media(pet_id,object_name) values('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','private/predictable.png')$$,'23514',null,'unpredictable path required');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select is((select count(*)::int from public.match_reports),0,'target cannot read report');
select is((select count(*)::int from public.match_media),1,'appropriate candidate sees explicitly shared media');
select lives_ok($$select public.match_unmatch((select c from test_threads where kind='dog'),'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2')$$,'unmatch closes conversation');
select throws_ok($$select public.match_send((select c from test_threads where kind='dog'),'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2','no',gen_random_uuid())$$,'42501',null,'unmatched send denied');
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
select is((select count(*)::int from public.match_conversations),0,'third party cannot read conversation');
select is((select count(*)::int from public.match_messages),0,'third party cannot read messages');
select is((select count(*)::int from public.match_media),0,'inactive third user cannot read media');
select is((select count(*)::int from public.pet_verifications),0,'third user cannot see verification');
select throws_ok($$select public.match_send((select c from test_threads where kind='cat'),'cccccccc-cccc-4ccc-8ccc-ccccccccccc1','no',gen_random_uuid())$$,'42501',null,'third party cannot send');
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select lives_ok($$select public.match_block('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1')$$,'owner block');
select is((select count(*)::int from public.match_conversations),0,'block hides conversations');
select is((select count(*)::int from public.match_messages),0,'block hides messages');
select throws_ok($$select public.match_send((select c from test_threads where kind='cat'),'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','no',gen_random_uuid())$$,'42501',null,'blocker cannot send');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select is((select count(*)::int from public.match_media),0,'block hides candidate media both directions');
select is((select count(*)::int from public.match_profiles),2,'block hides other owner discovery');
select throws_ok($$select public.match_send((select c from test_threads where kind='cat'),'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','no',gen_random_uuid())$$,'42501',null,'blocked cannot send');
select throws_ok($$select public.match_like('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1')$$,'42501',null,'blocked cannot like');
reset role;
select is((select count(*)::int from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and (c.relname like 'match_%' or c.relname in ('matches','pet_verifications')) and c.relkind='r' and not c.relrowsecurity),0,'all match tables have RLS');
select is((select count(*)::int from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'match_%' and p.prosecdef),0,'no exposed definer');
set local role anon;
select throws_ok($$select * from public.match_profiles$$,'42501',null,'anonymous profiles denied');
select throws_ok($$select public.match_like('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1')$$,'42501',null,'anonymous RPC denied');
select * from finish();
rollback;
