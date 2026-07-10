alter table public.links
add column if not exists archived_at timestamptz;

create index if not exists links_user_id_archived_at_idx
on public.links (user_id, archived_at desc)
where archived_at is not null;

create extension if not exists pg_cron;

select cron.schedule(
  'purge-keepnoto-archived-links',
  '0 * * * *',
  $$
    delete from public.links
    where archived_at is not null
      and archived_at <= now() - interval '7 days';
  $$
);
