-- Run this file in a Supabase SQL editor for the first project setup.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  username text not null unique check (username ~ '^[a-z0-9_-]{3,40}$'),
  school_name text,
  bio text,
  avatar_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.word_sets (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text,
  subject text not null default 'ภาษาไทย',
  grade_min smallint check (grade_min between 1 and 12),
  grade_max smallint check (grade_max between 1 and 12 and grade_max >= grade_min),
  theme_key text not null default 'sky',
  content_type text not null default 'word' check (content_type in ('word', 'image')),
  is_published boolean not null default false,
  public_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.word_cards (
  id uuid primary key default gen_random_uuid(),
  word_set_id uuid not null references public.word_sets(id) on delete cascade,
  position integer not null check (position > 0),
  word_text text not null check (char_length(word_text) between 1 and 160),
  image_url text,
  hint_text text,
  score integer not null default 1 check (score > 0),
  created_at timestamptz not null default now(),
  unique (word_set_id, position)
);

create index if not exists word_sets_teacher_id_idx on public.word_sets(teacher_id);
create index if not exists word_cards_word_set_id_idx on public.word_cards(word_set_id);

alter table public.profiles enable row level security;
alter table public.word_sets enable row level security;
alter table public.word_cards enable row level security;

grant select on public.profiles, public.word_sets, public.word_cards to anon;
grant select, insert, update, delete on public.profiles, public.word_sets, public.word_cards to authenticated;

create policy "public profiles or owner" on public.profiles for select to anon, authenticated
using (is_public or (select auth.uid()) = id);
create policy "teachers insert own profile" on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);
create policy "teachers update own profile" on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "published sets or owner" on public.word_sets for select to anon, authenticated
using (is_published or (select auth.uid()) = teacher_id);
create policy "teachers insert own sets" on public.word_sets for insert to authenticated
with check ((select auth.uid()) = teacher_id);
create policy "teachers update own sets" on public.word_sets for update to authenticated
using ((select auth.uid()) = teacher_id) with check ((select auth.uid()) = teacher_id);
create policy "teachers delete own sets" on public.word_sets for delete to authenticated
using ((select auth.uid()) = teacher_id);

create policy "cards follow set visibility" on public.word_cards for select to anon, authenticated
using (exists (select 1 from public.word_sets ws where ws.id = word_set_id and (ws.is_published or ws.teacher_id = (select auth.uid()))));
create policy "teachers insert cards in own sets" on public.word_cards for insert to authenticated
with check (exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.teacher_id = (select auth.uid())));
create policy "teachers update cards in own sets" on public.word_cards for update to authenticated
using (exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.teacher_id = (select auth.uid())))
with check (exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.teacher_id = (select auth.uid())));
create policy "teachers delete cards in own sets" on public.word_cards for delete to authenticated
using (exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.teacher_id = (select auth.uid())));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('card-images', 'card-images', true, 3145728, array['image/webp']::text[])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "teachers read own card images" on storage.objects for select to authenticated
using (bucket_id = 'card-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "approved teachers upload card images" on storage.objects for insert to authenticated
with check (
  bucket_id = 'card-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
create policy "approved teachers update own card images" on storage.objects for update to authenticated
using (bucket_id = 'card-images' and owner_id = (select auth.uid())::text)
with check (
  bucket_id = 'card-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
);
create policy "approved teachers delete own card images" on storage.objects for delete to authenticated
using (
  bucket_id = 'card-images'
  and owner_id = (select auth.uid())::text
);
