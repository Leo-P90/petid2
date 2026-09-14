-- Slice 5: explicit opt-in data, never a view of private pets/health/photos.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
create table public.match_profiles (
  pet_id uuid primary key, owner_id uuid not null default auth.uid(),
  species text not null check (species in ('Kedi','Köpek')),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 50),
  birth_date date check (birth_date is null or birth_date <= current_date),
  age_label text check (char_length(age_label) <= 40),
  breed text not null default '' check (char_length(breed) <= 80),
  sex text not null default 'Belirtilmedi' check (sex in ('Dişi','Erkek','Belirtilmedi')),
  bio text not null default '' check (char_length(bio) <= 500),
  city text not null default '' check (char_length(city) <= 80),
  district text not null default '' check (char_length(district) <= 80),
  active boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (owner_id,pet_id) references public.pets(owner_id,id) on delete cascade
);
create index match_profiles_owner_idx on public.match_profiles(owner_id);
create index match_profiles_discovery_idx on public.match_profiles(species,active);
create table public.match_likes (
  liker_pet uuid not null references public.match_profiles(pet_id) on delete cascade,
  liked_pet uuid not null references public.match_profiles(pet_id) on delete cascade,
  created_at timestamptz not null default now(), primary key(liker_pet,liked_pet), check(liker_pet <> liked_pet)
);
create index match_likes_target_idx on public.match_likes(liked_pet);
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  pet_a uuid not null references public.match_profiles(pet_id) on delete cascade,
  pet_b uuid not null references public.match_profiles(pet_id) on delete cascade,
  active boolean not null default true, created_at timestamptz not null default now(),
  unique(pet_a,pet_b), check(pet_a < pet_b)
);
create index matches_pet_b_idx on public.matches(pet_b);
create table public.match_conversations (
  id uuid primary key default gen_random_uuid(), match_id uuid not null unique references public.matches(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.match_participants (
  conversation_id uuid not null references public.match_conversations(id) on delete cascade,
  pet_id uuid not null references public.match_profiles(pet_id) on delete cascade,
  primary key(conversation_id,pet_id)
);
create index match_participants_pet_idx on public.match_participants(pet_id);
create table public.match_messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null,
  sender_pet uuid not null, client_id uuid not null,
  body text not null check (body = regexp_replace(body,'^[[:space:]]+|[[:space:]]+$','','g') and char_length(body) between 1 and 500),
  created_at timestamptz not null default now(), unique(conversation_id,sender_pet,client_id),
  foreign key(conversation_id,sender_pet) references public.match_participants(conversation_id,pet_id) on delete cascade
);
create index match_messages_thread_idx on public.match_messages(conversation_id,created_at,id);
create index match_messages_sender_idx on public.match_messages(sender_pet);
create table public.match_reads (
  conversation_id uuid not null, pet_id uuid not null,
  last_message_id uuid references public.match_messages(id) on delete set null,
  read_at timestamptz not null default now(), primary key(conversation_id,pet_id),
  foreign key(conversation_id,pet_id) references public.match_participants(conversation_id,pet_id) on delete cascade
);
create index match_reads_pet_idx on public.match_reads(pet_id);
create index match_reads_message_idx on public.match_reads(last_message_id);
create table public.match_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), primary key(blocker_id,blocked_id), check(blocker_id <> blocked_id)
);
create index match_blocks_target_idx on public.match_blocks(blocked_id);
create table public.match_reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_pet uuid not null references public.match_profiles(pet_id) on delete cascade,
  reason text not null check(reason in ('spam','harassment','unsafe','other')),
  description text not null default '' check(char_length(description) <= 500), created_at timestamptz not null default now()
);
create index match_reports_reporter_idx on public.match_reports(reporter_id);
create index match_reports_target_idx on public.match_reports(target_pet);
create table public.pet_verifications (
  pet_id uuid primary key references public.match_profiles(pet_id) on delete cascade,
  status text not null check(status in ('pending','verified','rejected')),
  updated_at timestamptz not null default now()
);
create table public.match_media (
  id uuid primary key default gen_random_uuid(), pet_id uuid not null references public.match_profiles(pet_id) on delete cascade,
  object_name text not null unique check(object_name ~ '^[0-9a-f-]{36}[.](jpg|png|webp)$'),
  created_at timestamptz not null default now()
);
create index match_media_pet_idx on public.match_media(pet_id);

-- All privileged logic lives outside exposed schemas, with caller authorization.
create function private.owns_match_pet(p uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.match_profiles where pet_id=p and owner_id=auth.uid())
$$;
create function private.match_blocked(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is null or exists(select 1 from public.match_blocks where (blocker_id=a and blocked_id=b) or (blocker_id=b and blocked_id=a))
$$;
create function private.can_match_pair(a uuid,b uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.match_profiles x join public.match_profiles y on y.pet_id=b
 where x.pet_id=a and x.owner_id=auth.uid() and x.active and y.active and x.species=y.species and x.owner_id<>y.owner_id
 and not private.match_blocked(x.owner_id,y.owner_id))
$$;
create function private.can_match_conversation(c uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.match_conversations v join public.matches m on m.id=v.match_id
 join public.match_profiles a on a.pet_id=m.pet_a join public.match_profiles b on b.pet_id=m.pet_b
 where v.id=c and m.active and auth.uid() in (a.owner_id,b.owner_id) and not private.match_blocked(a.owner_id,b.owner_id))
$$;
create function private.can_view_match(p uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (private.owns_match_pet(p) or exists(select 1 from public.match_profiles own
 where own.owner_id=auth.uid() and private.can_match_pair(own.pet_id,p)) or exists(select 1 from public.match_conversations c
 join public.matches m on c.match_id=m.id where p in(m.pet_a,m.pet_b) and private.can_match_conversation(c.id)))
$$;
create function private.can_view_verification(p uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (private.owns_match_pet(p) or exists(select 1 from public.match_conversations c join public.matches m on c.match_id=m.id
 where p in(m.pet_a,m.pet_b) and private.can_match_conversation(c.id)))
$$;
create function private.validate_match_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or new.owner_id<>auth.uid() or not exists(select 1 from public.pets p where p.id=new.pet_id and p.owner_id=auth.uid() and p.species=new.species)
 then raise exception 'invalid match pet' using errcode='42501'; end if;
 if tg_op='UPDATE' and (new.pet_id<>old.pet_id or new.owner_id<>old.owner_id or new.species<>old.species) then raise exception 'immutable match identity' using errcode='42501'; end if;
 new.updated_at=now(); return new;
end $$;
create trigger match_profile_validate before insert or update on public.match_profiles for each row execute function private.validate_match_profile();
-- A private pet cannot change species out from under an active shared profile.
create function private.protect_match_species() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.match_profiles where pet_id=old.id and species<>new.species) then raise exception 'remove match profile before changing species' using errcode='23514'; end if;
 return new;
end $$;
create trigger match_pet_species before update of species on public.pets for each row execute function private.protect_match_species();
create function private.validate_match_pair() returns trigger language plpgsql security definer set search_path='' as $$
declare a uuid; b uuid;
begin
 if tg_table_name='match_likes' then a=new.liker_pet; b=new.liked_pet; else a=new.pet_a; b=new.pet_b; end if;
 if auth.uid() is null or not (private.can_match_pair(a,b) or private.can_match_pair(b,a)) then raise exception 'invalid match pair' using errcode='42501'; end if;
 return new;
end $$;
create trigger match_likes_validate before insert on public.match_likes for each row execute function private.validate_match_pair();
create trigger matches_validate before insert on public.matches for each row execute function private.validate_match_pair();
create function private.lock_match_owners(a uuid,b uuid) returns void language plpgsql security invoker set search_path='' as $$
begin perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(least(a,b)::text||greatest(a,b)::text,0)); end $$;
create function private.match_like(source_pet uuid,target_pet uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid; b uuid; mid uuid; cid uuid;
begin
 if not private.owns_match_pet(source_pet) then raise exception 'not owner' using errcode='42501'; end if;
 select owner_id into a from public.match_profiles where pet_id=source_pet;
 select owner_id into b from public.match_profiles where pet_id=target_pet;
 if b is null then raise exception 'unavailable target' using errcode='42501'; end if;
 perform private.lock_match_owners(a,b);
 if not private.can_match_pair(source_pet,target_pet) then raise exception 'ineligible target' using errcode='42501'; end if;
 insert into public.match_likes(liker_pet,liked_pet) values(source_pet,target_pet) on conflict do nothing;
 if exists(select 1 from public.match_likes where liker_pet=target_pet and liked_pet=source_pet) then
  insert into public.matches(pet_a,pet_b) values(least(source_pet,target_pet),greatest(source_pet,target_pet)) on conflict do nothing;
  select id into mid from public.matches where pet_a=least(source_pet,target_pet) and pet_b=greatest(source_pet,target_pet) and active;
  if mid is not null then
   insert into public.match_conversations(match_id) values(mid) on conflict do nothing;
   select id into cid from public.match_conversations where match_id=mid;
   insert into public.match_participants(conversation_id,pet_id) values(cid,source_pet),(cid,target_pet) on conflict do nothing;
  end if;
 end if;
 return cid;
end $$;
create function private.match_send(c uuid,p uuid,text_body text,request_id uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare a uuid; b uuid; result uuid; cleaned text;
begin
 if not private.owns_match_pet(p) then raise exception 'not owner' using errcode='42501'; end if;
 select x.owner_id,y.owner_id into a,b from public.match_conversations v join public.matches m on m.id=v.match_id
 join public.match_profiles x on x.pet_id=m.pet_a join public.match_profiles y on y.pet_id=m.pet_b where v.id=c;
 if a is null then raise exception 'unavailable conversation' using errcode='42501'; end if;
 perform private.lock_match_owners(a,b);
 if not private.can_match_conversation(c) or not exists(select 1 from public.match_participants where conversation_id=c and pet_id=p)
 then raise exception 'conversation denied' using errcode='42501'; end if;
 cleaned=regexp_replace(text_body,'^[[:space:]]+|[[:space:]]+$','','g');
 if cleaned is null or char_length(cleaned) not between 1 and 500 or request_id is null then raise exception 'invalid message' using errcode='22023'; end if;
 insert into public.match_messages(conversation_id,sender_pet,body,client_id) values(c,p,cleaned,request_id) on conflict do nothing;
 select id into result from public.match_messages where conversation_id=c and sender_pet=p and client_id=request_id;
 return result;
end $$;
create function private.match_read(c uuid,p uuid,message_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare a uuid; b uuid;
begin
 select x.owner_id,y.owner_id into a,b from public.match_conversations v join public.matches m on m.id=v.match_id
 join public.match_profiles x on x.pet_id=m.pet_a join public.match_profiles y on y.pet_id=m.pet_b where v.id=c;
 if a is null then raise exception 'conversation denied' using errcode='42501'; end if;
 perform private.lock_match_owners(a,b);
 if not private.owns_match_pet(p) or not private.can_match_conversation(c) or not exists(select 1 from public.match_participants where conversation_id=c and pet_id=p)
 then raise exception 'conversation denied' using errcode='42501'; end if;
 if message_id is not null and not exists(select 1 from public.match_messages where id=message_id and conversation_id=c) then raise exception 'invalid read message' using errcode='22023'; end if;
 insert into public.match_reads(conversation_id,pet_id,last_message_id) values(c,p,message_id)
 on conflict(conversation_id,pet_id) do update set last_message_id=excluded.last_message_id,read_at=now()
 where public.match_reads.last_message_id is null or exists(
 select 1 from public.match_messages newer left join public.match_messages older on older.id=public.match_reads.last_message_id
 where newer.id=excluded.last_message_id and (older.id is null or (newer.created_at,newer.id) >= (older.created_at,older.id)));
end $$;
create function private.match_block(p uuid,target uuid) returns void language plpgsql security definer set search_path='' as $$
declare other uuid;
begin
 if not private.owns_match_pet(p) or not private.can_view_match(target) then raise exception 'target denied' using errcode='42501'; end if;
 select owner_id into other from public.match_profiles where pet_id=target;
 if other=auth.uid() then raise exception 'same owner' using errcode='22023'; end if;
 perform private.lock_match_owners(auth.uid(),other);
 insert into public.match_blocks(blocker_id,blocked_id) values(auth.uid(),other) on conflict do nothing;
end $$;
create function private.match_unmatch(c uuid,p uuid) returns void language plpgsql security definer set search_path='' as $$
declare a uuid; b uuid;
begin
 if not private.owns_match_pet(p) or not private.can_match_conversation(c) or not exists(select 1 from public.match_participants where conversation_id=c and pet_id=p) then raise exception 'conversation denied' using errcode='42501'; end if;
 select x.owner_id,y.owner_id into a,b from public.match_conversations v join public.matches m on m.id=v.match_id
 join public.match_profiles x on x.pet_id=m.pet_a join public.match_profiles y on y.pet_id=m.pet_b where v.id=c;
 perform private.lock_match_owners(a,b);
 update public.matches set active=false where id=(select match_id from public.match_conversations where id=c);
end $$;
-- Thin invoker RPC entry points; no public SECURITY DEFINER API.
create function public.match_like(source_pet uuid,target_pet uuid) returns uuid language sql security invoker set search_path='' as $$ select private.match_like(source_pet,target_pet) $$;
create function public.match_send(c uuid,p uuid,text_body text,request_id uuid) returns uuid language sql security invoker set search_path='' as $$ select private.match_send(c,p,text_body,request_id) $$;
create function public.match_read(c uuid,p uuid,message_id uuid) returns void language sql security invoker set search_path='' as $$ select private.match_read(c,p,message_id) $$;
create function public.match_block(p uuid,target uuid) returns void language sql security invoker set search_path='' as $$ select private.match_block(p,target) $$;
create function public.match_unmatch(c uuid,p uuid) returns void language sql security invoker set search_path='' as $$ select private.match_unmatch(c,p) $$;

do $$ declare t text; f record; begin
 foreach t in array array['match_profiles','match_likes','matches','match_conversations','match_participants','match_messages','match_reads','match_blocks','match_reports','pet_verifications','match_media'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
 end loop;
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='private' or (n.nspname='public' and p.proname in ('match_like','match_send','match_read','match_block','match_unmatch')) loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  -- Trigger functions are not callable; grant only explicit RPC/helpers.
  if f.signature::text not like '%validate_%' and f.signature::text not like '%protect_%' then execute format('grant execute on function %s to authenticated',f.signature); end if;
 end loop;
end $$;
grant insert,update,delete on public.match_profiles to authenticated;
grant insert,delete on public.match_media to authenticated;
grant insert on public.match_reports to authenticated;
create policy match_profiles_read on public.match_profiles for select to authenticated using(owner_id=(select auth.uid()) or private.can_view_match(pet_id));
create policy match_profiles_insert on public.match_profiles for insert to authenticated with check(owner_id=(select auth.uid()));
create policy match_profiles_update on public.match_profiles for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy match_profiles_delete on public.match_profiles for delete to authenticated using(owner_id=(select auth.uid()));
create policy match_likes_read on public.match_likes for select to authenticated using(private.owns_match_pet(liker_pet));
create policy matches_read on public.matches for select to authenticated using(exists(select 1 from public.match_conversations c where c.match_id=matches.id and private.can_match_conversation(c.id)));
create policy match_conversations_read on public.match_conversations for select to authenticated using(private.can_match_conversation(id));
create policy match_participants_read on public.match_participants for select to authenticated using(private.can_match_conversation(conversation_id));
create policy match_messages_read on public.match_messages for select to authenticated using(private.can_match_conversation(conversation_id));
create policy match_reads_read on public.match_reads for select to authenticated using(private.can_match_conversation(conversation_id));
create policy match_blocks_read on public.match_blocks for select to authenticated using(blocker_id=(select auth.uid()));
create policy match_reports_read on public.match_reports for select to authenticated using(reporter_id=(select auth.uid()));
create policy match_reports_insert on public.match_reports for insert to authenticated with check(reporter_id=(select auth.uid()) and private.can_view_match(target_pet) and not private.owns_match_pet(target_pet));
create policy pet_verifications_read on public.pet_verifications for select to authenticated using(private.can_view_verification(pet_id));
create policy match_media_read on public.match_media for select to authenticated using(private.can_view_match(pet_id));
create policy match_media_insert on public.match_media for insert to authenticated with check(private.owns_match_pet(pet_id));
create policy match_media_delete on public.match_media for delete to authenticated using(private.owns_match_pet(pet_id));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('match-media','match-media',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy match_objects_read on storage.objects for select to authenticated using(bucket_id='match-media' and exists(select 1 from public.match_media m where m.object_name=name and private.can_view_match(m.pet_id)));
create policy match_objects_insert on storage.objects for insert to authenticated with check(bucket_id='match-media' and exists(select 1 from public.match_media m where m.object_name=name and private.owns_match_pet(m.pet_id)));
create policy match_objects_delete on storage.objects for delete to authenticated using(bucket_id='match-media' and exists(select 1 from public.match_media m where m.object_name=name and private.owns_match_pet(m.pet_id)));
-- No Realtime publication/broadcast: authenticated polling always rechecks RLS,
-- including block/unmatch. Native clients do not issue signed candidate URLs.
-- Already downloaded bytes (or URLs issued by an external authorized client)
-- cannot be recalled: Storage authorization is checked at request/issuance time.
