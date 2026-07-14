drop policy if exists "published owned or member shared sets" on public.word_sets;
create policy "published owned or member shared sets"
on public.word_sets for select to authenticated
using (
  is_published
  or ((select auth.uid()) = teacher_id and (select private.is_approved_user()))
  or (
    (select private.is_approved_user())
    and exists (
      select 1 from public.word_set_shares shares
      where shares.word_set_id = word_sets.id
        and shares.recipient_id = (select auth.uid())
    )
  )
);
