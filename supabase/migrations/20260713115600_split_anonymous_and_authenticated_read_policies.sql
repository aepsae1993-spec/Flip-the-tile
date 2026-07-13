drop policy if exists "public profiles owner or admin" on public.profiles;
create policy "public profiles" on public.profiles for select to anon using (is_public);
create policy "authenticated profiles owner or admin" on public.profiles for select to authenticated
using (is_public or (select auth.uid()) = id or (select private.is_admin()));

drop policy if exists "published sets or approved owner" on public.word_sets;
create policy "published sets" on public.word_sets for select to anon using (is_published);
create policy "published sets or approved owner" on public.word_sets for select to authenticated
using (is_published or ((select auth.uid()) = teacher_id and (select private.is_approved_user())));

drop policy if exists "cards follow published or approved owner set" on public.word_cards;
create policy "published set cards" on public.word_cards for select to anon
using (exists (select 1 from public.word_sets ws where ws.id = word_set_id and ws.is_published));
create policy "published or approved owner set cards" on public.word_cards for select to authenticated
using (exists (select 1 from public.word_sets ws where ws.id = word_set_id and (ws.is_published or (ws.teacher_id = (select auth.uid()) and (select private.is_approved_user())))));
