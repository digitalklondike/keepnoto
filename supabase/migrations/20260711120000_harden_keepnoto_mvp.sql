do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'links_url_http_check'
      and conrelid = 'public.links'::regclass
  ) then
    alter table public.links
    add constraint links_url_http_check
    check (url ~* '^https?://') not valid;
  end if;
end;
$$;

drop policy if exists "Users can recreate their profile" on public.profiles;
create policy "Users can recreate their profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create or replace function public.save_link_with_tags(
  p_link_id uuid,
  p_link jsonb,
  p_tags text[] default array[]::text[]
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_link_id uuid;
  v_tag text;
  v_tag_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_link_id is null then
    insert into public.links (
      user_id, title, url, source, domain, description, saved_reason,
      preview_title, preview_description, favicon_url, preview_logo_url,
      metadata_image_url, resource_type, collection_name, is_favorite
    ) values (
      v_user_id,
      trim(p_link ->> 'title'),
      p_link ->> 'url',
      p_link ->> 'source',
      p_link ->> 'domain',
      coalesce(p_link ->> 'description', ''),
      nullif(trim(p_link ->> 'saved_reason'), ''),
      nullif(trim(p_link ->> 'preview_title'), ''),
      nullif(trim(p_link ->> 'preview_description'), ''),
      nullif(trim(p_link ->> 'favicon_url'), ''),
      nullif(trim(p_link ->> 'preview_logo_url'), ''),
      nullif(trim(p_link ->> 'metadata_image_url'), ''),
      coalesce(nullif(trim(p_link ->> 'resource_type'), ''), 'Link'),
      nullif(trim(p_link ->> 'collection_name'), ''),
      coalesce((p_link ->> 'is_favorite')::boolean, false)
    ) returning id into v_link_id;
  else
    update public.links
    set
      title = trim(p_link ->> 'title'),
      url = p_link ->> 'url',
      source = p_link ->> 'source',
      domain = p_link ->> 'domain',
      description = coalesce(p_link ->> 'description', ''),
      saved_reason = nullif(trim(p_link ->> 'saved_reason'), ''),
      preview_title = nullif(trim(p_link ->> 'preview_title'), ''),
      preview_description = nullif(trim(p_link ->> 'preview_description'), ''),
      favicon_url = nullif(trim(p_link ->> 'favicon_url'), ''),
      preview_logo_url = nullif(trim(p_link ->> 'preview_logo_url'), ''),
      metadata_image_url = nullif(trim(p_link ->> 'metadata_image_url'), ''),
      resource_type = coalesce(nullif(trim(p_link ->> 'resource_type'), ''), 'Link'),
      collection_name = nullif(trim(p_link ->> 'collection_name'), ''),
      is_favorite = coalesce((p_link ->> 'is_favorite')::boolean, false)
    where id = p_link_id and user_id = v_user_id
    returning id into v_link_id;

    if v_link_id is null then
      raise exception 'Saved link not found';
    end if;
  end if;

  delete from public.link_tags where link_id = v_link_id;

  for v_tag in
    select distinct lower(trim(value))
    from unnest(coalesce(p_tags, array[]::text[])) as tag_value(value)
    where char_length(trim(value)) between 1 and 32
  loop
    insert into public.tags (user_id, name)
    values (v_user_id, v_tag)
    on conflict (user_id, name) do update set name = excluded.name
    returning id into v_tag_id;

    insert into public.link_tags (link_id, tag_id)
    values (v_link_id, v_tag_id)
    on conflict do nothing;
  end loop;

  return v_link_id;
end;
$$;

revoke all on function public.save_link_with_tags(uuid, jsonb, text[]) from public;
grant execute on function public.save_link_with_tags(uuid, jsonb, text[]) to authenticated;

create table if not exists public.api_rate_limits (
  user_id uuid not null references auth.users (id) on delete cascade,
  scope text not null,
  window_start timestamptz not null,
  request_count integer not null default 1,
  primary key (user_id, scope, window_start)
);

alter table public.api_rate_limits enable row level security;

create index if not exists api_rate_limits_window_start_idx
on public.api_rate_limits (window_start);

create or replace function public.consume_api_rate_limit(
  p_scope text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_window_start timestamptz;
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_limit < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit configuration';
  end if;

  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );

  insert into public.api_rate_limits (user_id, scope, window_start, request_count)
  values (v_user_id, p_scope, v_window_start, 1)
  on conflict (user_id, scope, window_start)
  do update set request_count = public.api_rate_limits.request_count + 1
  returning request_count into v_count;

  delete from public.api_rate_limits
  where window_start < now() - interval '1 day';

  return query select
    v_count <= p_limit,
    greatest(0, p_limit - v_count),
    v_window_start + make_interval(secs => p_window_seconds);
end;
$$;

revoke all on function public.consume_api_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_api_rate_limit(text, integer, integer) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  1500000,
  array['image/gif', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
create policy "Avatar images are publicly readable"
on storage.objects for select
using (bucket_id = 'avatars');

drop policy if exists "Users can upload their avatar" on storage.objects;
create policy "Users can upload their avatar"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can update their avatar" on storage.objects;
create policy "Users can update their avatar"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Users can delete their avatar" on storage.objects;
create policy "Users can delete their avatar"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
