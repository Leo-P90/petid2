-- PetID V1 slice 3. Apply locally/test first; never contains project credentials.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 50),
  species text not null check (species in ('Kedi', 'Köpek')),
  birth_date date,
  age_label text check (age_label is null or char_length(age_label) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, id)
);
create index pets_owner_id_idx on public.pets(owner_id);

create table public.pet_photos (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  pet_id uuid not null,
  object_name text not null unique,
  created_at timestamptz not null default now(),
  constraint pet_photos_pet_owner_fk foreign key (owner_id, pet_id)
    references public.pets(owner_id, id) on delete cascade,
  constraint pet_photos_owner_path check (split_part(object_name, '/', 1) = owner_id::text),
  constraint pet_photos_pet_path check (split_part(object_name, '/', 2) = pet_id::text),
  constraint pet_photos_path_shape check (object_name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$')
);
create index pet_photos_owner_id_idx on public.pet_photos(owner_id);
create index pet_photos_pet_id_idx on public.pet_photos(pet_id);

create function public.set_petid_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
revoke all on function public.set_petid_updated_at() from public, anon, authenticated;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_petid_updated_at();
create trigger pets_updated before update on public.pets for each row execute function public.set_petid_updated_at();

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.pet_photos enable row level security;
revoke all on public.profiles, public.pets, public.pet_photos from anon;
revoke all on public.profiles, public.pets, public.pet_photos from authenticated;
grant select, insert, update, delete on public.profiles, public.pets, public.pet_photos to authenticated;

create policy profiles_select_own on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy profiles_delete_own on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy pets_select_own on public.pets for select to authenticated using ((select auth.uid()) = owner_id);
create policy pets_insert_own on public.pets for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy pets_update_own on public.pets for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy pets_delete_own on public.pets for delete to authenticated using ((select auth.uid()) = owner_id);

create policy pet_photos_select_own on public.pet_photos for select to authenticated using ((select auth.uid()) = owner_id);
create policy pet_photos_insert_own on public.pet_photos for insert to authenticated
with check ((select auth.uid()) = owner_id and exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy pet_photos_update_own on public.pet_photos for update to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id and exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = (select auth.uid())));
create policy pet_photos_delete_own on public.pet_photos for delete to authenticated using ((select auth.uid()) = owner_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-photos', 'pet-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy pet_objects_select_own on storage.objects for select to authenticated
using (bucket_id = 'pet-photos' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(storage.objects.name), 1) = 2
  and storage.filename(storage.objects.name) ~ '^[0-9a-f-]{36}[.](jpg|jpeg|png|webp)$'
  and exists (select 1 from public.pets p where p.owner_id = (select auth.uid()) and p.id::text = (storage.foldername(storage.objects.name))[2]));
create policy pet_objects_insert_own on storage.objects for insert to authenticated
with check (bucket_id = 'pet-photos' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(storage.objects.name), 1) = 2
  and storage.filename(storage.objects.name) ~ '^[0-9a-f-]{36}[.](jpg|jpeg|png|webp)$'
  and exists (select 1 from public.pets p where p.owner_id = (select auth.uid()) and p.id::text = (storage.foldername(storage.objects.name))[2]));
create policy pet_objects_update_own on storage.objects for update to authenticated
using (bucket_id = 'pet-photos' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(storage.objects.name), 1) = 2
  and storage.filename(storage.objects.name) ~ '^[0-9a-f-]{36}[.](jpg|jpeg|png|webp)$'
  and exists (select 1 from public.pets p where p.owner_id = (select auth.uid()) and p.id::text = (storage.foldername(storage.objects.name))[2]))
with check (bucket_id = 'pet-photos' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(storage.objects.name), 1) = 2
  and storage.filename(storage.objects.name) ~ '^[0-9a-f-]{36}[.](jpg|jpeg|png|webp)$'
  and exists (select 1 from public.pets p where p.owner_id = (select auth.uid()) and p.id::text = (storage.foldername(storage.objects.name))[2]));
create policy pet_objects_delete_own on storage.objects for delete to authenticated
using (bucket_id = 'pet-photos' and (storage.foldername(storage.objects.name))[1] = (select auth.uid())::text
  and array_length(storage.foldername(storage.objects.name), 1) = 2
  and storage.filename(storage.objects.name) ~ '^[0-9a-f-]{36}[.](jpg|jpeg|png|webp)$'
  and exists (select 1 from public.pets p where p.owner_id = (select auth.uid()) and p.id::text = (storage.foldername(storage.objects.name))[2]));
