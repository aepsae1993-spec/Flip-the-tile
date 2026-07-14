create table if not exists public.word_set_shares (
  id uuid primary key default gen_random_uuid(),
  word_set_id uuid not null references public.word_sets(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  recipient_email text not null,
  created_at timestamptz not null default now(),
  constraint word_set_shares_not_self check (owner_id <> recipient_id),
  constraint word_set_shares_unique_recipient unique (word_set_id, recipient_id)
);

create index if not exists word_set_shares_owner_id_idx
  on public.word_set_shares(owner_id);
create index if not exists word_set_shares_recipient_id_idx
  on public.word_set_shares(recipient_id);
create index if not exists word_set_shares_word_set_id_idx
  on public.word_set_shares(word_set_id);

alter table public.word_set_shares enable row level security;
revoke all on table public.word_set_shares from anon;
revoke all on table public.word_set_shares from authenticated;
grant select, delete on table public.word_set_shares to authenticated;

create policy "approved members read their shares"
on public.word_set_shares for select to authenticated
using (
  (select private.is_approved_user())
  and ((select auth.uid()) = owner_id or (select auth.uid()) = recipient_id)
);

create policy "approved members remove their shares"
on public.word_set_shares for delete to authenticated
using (
  (select private.is_approved_user())
  and ((select auth.uid()) = owner_id or (select auth.uid()) = recipient_id)
);

create or replace function public.share_word_set_with_member(
  p_word_set_id uuid,
  p_recipient_email text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  normalized_email text := lower(trim(p_recipient_email));
  member_id uuid;
  share_id uuid;
begin
  if caller_id is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  if not exists (
    select 1 from public.user_access access
    where access.user_id = caller_id and access.status = 'approved'
  ) then
    raise exception using errcode = '42501', message = 'ACCOUNT_NOT_APPROVED';
  end if;

  if not exists (
    select 1 from public.word_sets sets
    where sets.id = p_word_set_id and sets.teacher_id = caller_id
  ) then
    raise exception using errcode = '42501', message = 'SET_NOT_OWNED';
  end if;

  select access.user_id
    into member_id
  from public.user_access access
  where lower(access.email) = normalized_email
    and access.status = 'approved'
  limit 1;

  if member_id is null then
    raise exception using errcode = 'P0002', message = 'MEMBER_NOT_FOUND';
  end if;

  if member_id = caller_id then
    raise exception using errcode = '22023', message = 'CANNOT_SHARE_WITH_SELF';
  end if;

  insert into public.word_set_shares (
    word_set_id,
    owner_id,
    recipient_id,
    recipient_email
  )
  values (
    p_word_set_id,
    caller_id,
    member_id,
    normalized_email
  )
  on conflict (word_set_id, recipient_id)
  do update set recipient_email = excluded.recipient_email
  returning id into share_id;

  return share_id;
end;
$$;

revoke all on function public.share_word_set_with_member(uuid, text) from public;
revoke all on function public.share_word_set_with_member(uuid, text) from anon;
grant execute on function public.share_word_set_with_member(uuid, text) to authenticated;

drop policy if exists "published sets or approved owner" on public.word_sets;
create policy "published owned or member shared sets"
on public.word_sets for select to authenticated
using (
  is_published
  or ((select auth.uid()) = teacher_id and (select private.is_approved_user()))
  or (
    (select private.is_approved_user())
    and exists (
      select 1 from public.word_set_shares shares
      where shares.word_set_id = id
        and shares.recipient_id = (select auth.uid())
    )
  )
);

drop policy if exists "published or approved owner set cards" on public.word_cards;
create policy "published owned or member shared cards"
on public.word_cards for select to authenticated
using (
  exists (
    select 1 from public.word_sets sets
    where sets.id = word_set_id
      and (
        sets.is_published
        or (sets.teacher_id = (select auth.uid()) and (select private.is_approved_user()))
        or (
          (select private.is_approved_user())
          and exists (
            select 1 from public.word_set_shares shares
            where shares.word_set_id = sets.id
              and shares.recipient_id = (select auth.uid())
          )
        )
      )
  )
);
