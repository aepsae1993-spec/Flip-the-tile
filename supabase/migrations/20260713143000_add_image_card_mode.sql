alter table public.word_sets
  add column if not exists content_type text not null default 'word'
  check (content_type in ('word', 'image'));

alter table public.word_cards
  add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('card-images', 'card-images', true, 3145728, array['image/webp']::text[])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "teachers read own card images" on storage.objects;
create policy "teachers read own card images"
on storage.objects for select to authenticated
using (
  bucket_id = 'card-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "approved teachers upload card images" on storage.objects;
create policy "approved teachers upload card images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'card-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.user_access access
    where access.user_id = (select auth.uid())
      and access.status = 'approved'
  )
);

drop policy if exists "approved teachers update own card images" on storage.objects;
create policy "approved teachers update own card images"
on storage.objects for update to authenticated
using (
  bucket_id = 'card-images'
  and owner_id = (select auth.uid())::text
)
with check (
  bucket_id = 'card-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and owner_id = (select auth.uid())::text
  and exists (
    select 1 from public.user_access access
    where access.user_id = (select auth.uid())
      and access.status = 'approved'
  )
);

drop policy if exists "approved teachers delete own card images" on storage.objects;
create policy "approved teachers delete own card images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'card-images'
  and owner_id = (select auth.uid())::text
  and exists (
    select 1 from public.user_access access
    where access.user_id = (select auth.uid())
      and access.status = 'approved'
  )
);
