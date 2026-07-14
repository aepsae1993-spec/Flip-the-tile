create table if not exists public.registration_attempts (
  key_hash text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts > 0)
);

alter table public.registration_attempts enable row level security;
revoke all on table public.registration_attempts from public, anon, authenticated;
grant select, insert, update, delete on table public.registration_attempts to service_role;

create or replace function public.consume_registration_attempt(
  p_key_hash text,
  p_max_attempts integer,
  p_window interval default interval '1 hour'
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_attempts integer;
begin
  if p_key_hash is null or length(p_key_hash) < 16 or p_max_attempts < 1 then
    return false;
  end if;

  insert into public.registration_attempts (key_hash, window_started_at, attempts)
  values (p_key_hash, now(), 1)
  on conflict (key_hash) do update
  set window_started_at = case
        when public.registration_attempts.window_started_at < now() - p_window then now()
        else public.registration_attempts.window_started_at
      end,
      attempts = case
        when public.registration_attempts.window_started_at < now() - p_window then 1
        else public.registration_attempts.attempts + 1
      end
  returning attempts into current_attempts;

  return current_attempts <= p_max_attempts;
end;
$$;

revoke all on function public.consume_registration_attempt(text, integer, interval) from public, anon, authenticated;
grant execute on function public.consume_registration_attempt(text, integer, interval) to service_role;
