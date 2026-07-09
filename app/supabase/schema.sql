-- PatiDost — ilk Supabase şeması (faz 1: auth + pets + game_states)
-- auth.users Supabase tarafından otomatik yönetilir; burada sadece uygulamaya
-- özel tabloları ve Row Level Security (RLS) politikalarını tanımlıyoruz.

-- ---------- profiles ----------
-- auth.users'a 1:1 ek bilgi (Ad Soyad gibi kayıt formunda toplanan alanlar)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  ad_soyad text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Kullanıcı kendi profilini görebilir"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Kullanıcı kendi profilini güncelleyebilir"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Kullanıcı kendi profilini oluşturabilir"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------- pets ----------
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  ad text not null,
  tur text not null check (tur in ('kedi', 'kopek', 'diger')),
  cins text,
  cinsiyet text,
  dogum date,
  kilo numeric,
  cip text,
  kan text,
  kisir text,
  alerji text,
  renk text default 'gri',
  foto_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pets enable row level security;

create policy "Kullanıcı kendi hayvanlarını görebilir"
  on public.pets for select
  using (auth.uid() = owner_id);

create policy "Kullanıcı kendi hayvanını ekleyebilir"
  on public.pets for insert
  with check (auth.uid() = owner_id);

create policy "Kullanıcı kendi hayvanını güncelleyebilir"
  on public.pets for update
  using (auth.uid() = owner_id);

create policy "Kullanıcı kendi hayvanını silebilir"
  on public.pets for delete
  using (auth.uid() = owner_id);

-- ---------- game_states ----------
-- pixel oyun ilerlemesi — her pet ile 1:1
create table if not exists public.game_states (
  pet_id uuid primary key references public.pets(id) on delete cascade,
  tok numeric not null default 80,
  mut numeric not null default 70,
  enj numeric not null default 90,
  xp numeric not null default 0,
  coin integer not null default 15,
  items jsonb not null default '[]'::jsonb,
  worn text default '',
  flappy_best integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.game_states enable row level security;

create policy "Kullanıcı kendi oyun durumunu görebilir"
  on public.game_states for select
  using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

create policy "Kullanıcı kendi oyun durumunu güncelleyebilir"
  on public.game_states for update
  using (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

create policy "Kullanıcı kendi oyun durumunu oluşturabilir"
  on public.game_states for insert
  with check (exists (select 1 from public.pets p where p.id = pet_id and p.owner_id = auth.uid()));

-- ---------- updated_at otomatik güncelleme ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pets_set_updated_at
  before update on public.pets
  for each row execute function public.set_updated_at();

create trigger game_states_set_updated_at
  before update on public.game_states
  for each row execute function public.set_updated_at();

-- ---------- pet-fotograflari storage bucket (faz 2 — henüz uygulanmadı) ----------
-- Not: bucket oluşturma genelde Dashboard/Storage API üzerinden yapılır;
-- burada sadece referans olsun diye not düşüyoruz:
-- bucket adı: "pet-photos", public: false, RLS ile owner_id bazlı erişim.
-- Şu an fotoğraflar pets.foto_url kolonunda data-URL (base64) olarak tutuluyor.

-- ---------- otomatik kullanıcı sağlama (kayıt sırasında) ----------
-- signUp() email onayı bekleyen bir kullanıcı için session/JWT DÖNMEZ, bu yüzden
-- client-taraflı insert'ler (auth.uid() gerektiren RLS politikaları) bu anda
-- başarısız olur. Çözüm: auth.users üzerinde SECURITY DEFINER bir trigger —
-- RLS'i bypass ederek profil + varsayılan pet + game_state satırlarını
-- oluşturur. auth.signUp() çağrısı artık `options.data` içinde ad_soyad ve
-- pet_type gönderiyor (bkz. src/ui/auth.js).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_pet_id uuid;
begin
  insert into public.profiles (id, ad_soyad)
  values (new.id, coalesce(new.raw_user_meta_data->>'ad_soyad', 'Dost'));

  insert into public.pets (owner_id, ad, tur, renk)
  values (
    new.id,
    'Dostum',
    coalesce(new.raw_user_meta_data->>'pet_type', 'kedi'),
    'gri'
  )
  returning id into new_pet_id;

  insert into public.game_states (pet_id) values (new_pet_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger fonksiyonları sadece Postgres trigger mekanizmasından çağrılmalı;
-- anon/authenticated rollerinin bunları doğrudan RPC (/rest/v1/rpc/...) olarak
-- çağırmasını engelle (Supabase security advisor uyarısı).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
