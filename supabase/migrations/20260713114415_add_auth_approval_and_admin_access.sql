create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table if not exists public.user_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'teacher' check (role in ('admin', 'teacher')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'suspended')),
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists user_access_email_lower_idx on public.user_access (lower(email));
create index if not exists user_access_status_idx on public.user_access(status);
alter table public.user_access enable row level security;

create or replace function private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.user_access ua where ua.user_id = (select auth.uid()) and ua.role = 'admin' and ua.status = 'approved'
  );
$$;
create or replace function private.is_approved_user() returns boolean language sql stable security definer set search_path = '' as $$
  select (select auth.uid()) is not null and exists (
    select 1 from public.user_access ua where ua.user_id = (select auth.uid()) and ua.status = 'approved'
  );
$$;
revoke all on function private.is_admin() from public;
revoke all on function private.is_approved_user() from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_approved_user() to authenticated;

create policy "users read own access or admins read all" on public.user_access for select to authenticated
using ((select auth.uid()) = user_id or (select private.is_admin()));
create policy "admins update user access" on public.user_access for update to authenticated
using ((select private.is_admin())) with check ((select private.is_admin()));
grant select, update on public.user_access to authenticated;
revoke all on public.user_access from anon;

create or replace function private.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested_username text;
  requested_display_name text;
  is_bootstrap_admin boolean;
begin
  requested_username := lower(coalesce(nullif(trim(new.raw_user_meta_data ->> 'username'), ''), 'teacher_' || substr(new.id::text, 1, 8)));
  requested_display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1));
  is_bootstrap_admin := lower(new.email) = 'aepsae1993@gmail.com';
  insert into public.profiles (id, display_name, username, school_name, is_public)
  values (new.id, requested_display_name, requested_username, nullif(trim(new.raw_user_meta_data ->> 'school_name'), ''), true)
  on conflict (id) do nothing;
  insert into public.user_access (user_id, email, role, status, approved_at, approved_by)
  values (new.id, lower(new.email), case when is_bootstrap_admin then 'admin' else 'teacher' end, case when is_bootstrap_admin then 'approved' else 'pending' end, case when is_bootstrap_admin then now() else null end, case when is_bootstrap_admin then new.id else null end)
  on conflict (user_id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;
revoke all on function private.handle_new_user() from public;
create trigger on_auth_user_created_wordflip after insert on auth.users for each row execute function private.handle_new_user();

insert into public.user_access (user_id, email, role, status, approved_at, approved_by)
select u.id, lower(u.email), case when lower(u.email) = 'aepsae1993@gmail.com' then 'admin' else 'teacher' end, case when lower(u.email) = 'aepsae1993@gmail.com' then 'approved' else 'pending' end, case when lower(u.email) = 'aepsae1993@gmail.com' then now() else null end, case when lower(u.email) = 'aepsae1993@gmail.com' then u.id else null end
from auth.users u on conflict (user_id) do nothing;

drop policy if exists "public profiles or owner" on public.profiles;
drop policy if exists "teachers insert own profile" on public.profiles;
drop policy if exists "teachers update own profile" on public.profiles;
create policy "public profiles owner or admin" on public.profiles for select to anon, authenticated
using (is_public or (select auth.uid()) = id or ((select auth.uid()) is not null and (select private.is_admin())));
create policy "users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "users update own profile or admin" on public.profiles for update to authenticated
using ((select auth.uid()) = id or (select private.is_admin())) with check ((select auth.uid()) = id or (select private.is_admin()));

drop policy if exists "published sets or owner" on public.word_sets;
drop policy if exists "teachers insert own sets" on public.word_sets;
drop policy if exists "teachers update own sets" on public.word_sets;
drop policy if exists "teachers delete own sets" on public.word_sets;
create policy "published sets or approved owner" on public.word_sets for select to anon, authenticated
using (is_published or ((select auth.uid()) = teacher_id and (select private.is_approved_user())));
create policy "approved teachers insert own sets" on public.word_sets for insert to authenticated
with check ((select auth.uid()) = teacher_id and (select private.is_approved_user()));
create policy "approved teachers update own sets" on public.word_sets for update to authenticated
using ((select auth.uid()) = teacher_id and (select private.is_approved_user()))
with check ((select auth.uid()) = teacher_id and (select private.is_approved_user()));
create policy "approved teachers delete own sets" on public.word_sets for delete to authenticated
using ((select auth.uid()) = teacher_id and (select private.is_approved_user()));

drop policy if exists "cards follow set visibility" on public.word_cards;
drop policy if exists "teachers insert cards in own sets" on public.word_cards;
drop policy if exists "teachers update cards in own sets" on public.word_cards;
drop policy if exists "teachers delete cards in own sets" on public.word_cards;
create policy "cards follow published or approved owner set" on public.word_cards for select to anon, authenticated
using (exists (select 1 from public.word_sets ws where ws.id = word_set_id and (ws.is_published or (ws.teacher_id = (select auth.uid()) and (select private.is_approved_user())))));
create policy "approved teachers insert cards" on public.word_cards for insert to authenticated
with check ((select private.is_approved_user()) and exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.teacher_id = (select auth.uid())));
create policy "approved teachers update cards" on public.word_cards for update to authenticated
using ((select private.is_approved_user()) and exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.teacher_id = (select auth.uid())))
with check ((select private.is_approved_user()) and exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.teacher_id = (select auth.uid())));
create policy "approved teachers delete cards" on public.word_cards for delete to authenticated
using ((select private.is_approved_user()) and exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.teacher_id = (select auth.uid())));
