create table public.health_records (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid(), pet_id uuid not null,
 kind text not null check (kind in ('vaccine','medication','weight','exam','general')),
 title text not null check (char_length(btrim(title)) between 1 and 120),
 occurred_on date not null, due_on date,
 notes text check (char_length(notes) <= 5000), weight_kg numeric,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key (owner_id,pet_id) references public.pets(owner_id,id) on delete cascade,
 unique(owner_id,pet_id,id),
 check (due_on is null or due_on >= occurred_on),
 check ((kind='weight' and weight_kg is not null and weight_kg > 0 and weight_kg <= 1000) or (kind <> 'weight' and weight_kg is null))
);
create index health_records_pet_date_idx on public.health_records(owner_id,pet_id,occurred_on desc);
create table public.health_documents (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null default auth.uid(), pet_id uuid not null,
 record_id uuid,
 storage_path text not null unique,
 file_name text not null check (char_length(btrim(file_name)) between 1 and 255),
 mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png','image/webp')),
 size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 foreign key(owner_id,pet_id) references public.pets(owner_id,id) on delete cascade,
 foreign key(owner_id,pet_id,record_id) references public.health_records(owner_id,pet_id,id) on delete set null (record_id),
 check(split_part(storage_path,'/',1)=owner_id::text and split_part(storage_path,'/',2)=pet_id::text),
 check(storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}[.](pdf|jpg|png|webp)$')
);
create index health_documents_pet_idx on public.health_documents(owner_id,pet_id,record_id);
create trigger health_records_updated before update on public.health_records for each row execute function public.set_petid_updated_at();
create trigger health_documents_updated before update on public.health_documents for each row execute function public.set_petid_updated_at();
alter table public.health_records enable row level security;
alter table public.health_documents enable row level security;
revoke all on public.health_records,public.health_documents from public,anon,authenticated;
grant select,insert,update,delete on public.health_records,public.health_documents to authenticated;
create policy health_records_select on public.health_records for select to authenticated using ((select auth.uid())=owner_id);
create policy health_records_insert on public.health_records for insert to authenticated with check ((select auth.uid())=owner_id);
create policy health_records_update on public.health_records for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy health_records_delete on public.health_records for delete to authenticated using ((select auth.uid())=owner_id);
create policy health_documents_select on public.health_documents for select to authenticated using ((select auth.uid())=owner_id);
create policy health_documents_insert on public.health_documents for insert to authenticated with check ((select auth.uid())=owner_id);
create policy health_documents_update on public.health_documents for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy health_documents_delete on public.health_documents for delete to authenticated using ((select auth.uid())=owner_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('health-documents','health-documents',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp']);
update storage.buckets set file_size_limit=10485760 where id='pet-photos';
create policy health_objects_select on storage.objects for select to authenticated using (bucket_id='health-documents' and (storage.foldername(name))[1]=(select auth.uid())::text and array_length(storage.foldername(name),1)=2 and storage.filename(name) ~ '^[0-9a-f-]{36}[.](pdf|jpg|png|webp)$' and exists(select 1 from public.pets p where p.owner_id=(select auth.uid()) and p.id::text=(storage.foldername(storage.objects.name))[2]));
create policy health_objects_insert on storage.objects for insert to authenticated with check (bucket_id='health-documents' and (storage.foldername(name))[1]=(select auth.uid())::text and array_length(storage.foldername(name),1)=2 and storage.filename(name) ~ '^[0-9a-f-]{36}[.](pdf|jpg|png|webp)$' and exists(select 1 from public.pets p where p.owner_id=(select auth.uid()) and p.id::text=(storage.foldername(storage.objects.name))[2]));
create policy health_objects_update on storage.objects for update to authenticated using (bucket_id='health-documents' and (storage.foldername(name))[1]=(select auth.uid())::text and array_length(storage.foldername(name),1)=2 and storage.filename(name) ~ '^[0-9a-f-]{36}[.](pdf|jpg|png|webp)$' and exists(select 1 from public.pets p where p.owner_id=(select auth.uid()) and p.id::text=(storage.foldername(storage.objects.name))[2])) with check (bucket_id='health-documents' and (storage.foldername(name))[1]=(select auth.uid())::text and array_length(storage.foldername(name),1)=2 and storage.filename(name) ~ '^[0-9a-f-]{36}[.](pdf|jpg|png|webp)$' and exists(select 1 from public.pets p where p.owner_id=(select auth.uid()) and p.id::text=(storage.foldername(storage.objects.name))[2]));
create policy health_objects_delete on storage.objects for delete to authenticated using (bucket_id='health-documents' and (storage.foldername(name))[1]=(select auth.uid())::text and array_length(storage.foldername(name),1)=2 and storage.filename(name) ~ '^[0-9a-f-]{36}[.](pdf|jpg|png|webp)$' and exists(select 1 from public.pets p where p.owner_id=(select auth.uid()) and p.id::text=(storage.foldername(storage.objects.name))[2]));
