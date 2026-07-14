alter table public.word_sets
  add column if not exists is_shared_with_members boolean not null default false;

create index if not exists word_sets_member_shared_created_at_idx
  on public.word_sets(created_at desc)
  where is_shared_with_members;

drop policy if exists "published owned or member shared sets" on public.word_sets;
create policy "published owned or member shared sets"
on public.word_sets for select to authenticated
using (
  is_published
  or ((select auth.uid()) = teacher_id and (select private.is_approved_user()))
  or (is_shared_with_members and (select private.is_approved_user()))
  or (
    (select private.is_approved_user())
    and exists (
      select 1 from public.word_set_shares shares
      where shares.word_set_id = word_sets.id
        and shares.recipient_id = (select auth.uid())
    )
  )
);

drop policy if exists "published owned or member shared cards" on public.word_cards;
create policy "published owned or member shared cards"
on public.word_cards for select to authenticated
using (
  exists (
    select 1 from public.word_sets sets
    where sets.id = word_set_id
      and (
        sets.is_published
        or (sets.teacher_id = (select auth.uid()) and (select private.is_approved_user()))
        or (sets.is_shared_with_members and (select private.is_approved_user()))
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
