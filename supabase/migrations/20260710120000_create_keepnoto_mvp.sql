create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  url text not null check (char_length(trim(url)) > 0),
  source text not null,
  domain text not null,
  description text not null default '',
  saved_reason text,
  preview_title text,
  preview_description text,
  favicon_url text,
  preview_logo_url text,
  metadata_image_url text,
  resource_type text not null default 'Link',
  collection_name text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 32),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.link_tags (
  link_id uuid not null references public.links (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (link_id, tag_id)
);

create index links_user_id_created_at_idx on public.links (user_id, created_at desc);
create index links_user_id_favorite_created_at_idx on public.links (user_id, is_favorite desc, created_at desc);
create index tags_user_id_name_idx on public.tags (user_id, name);
create index link_tags_tag_id_idx on public.link_tags (tag_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger links_set_updated_at
before update on public.links
for each row execute procedure public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, display_name, avatar_url, created_at, updated_at)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name'),
  raw_user_meta_data ->> 'avatar_url',
  created_at,
  now()
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.links enable row level security;
alter table public.tags enable row level security;
alter table public.link_tags enable row level security;

create policy "Users can view their profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users can update their profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can view their links"
on public.links for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their links"
on public.links for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their links"
on public.links for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their links"
on public.links for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their tags"
on public.tags for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their tags"
on public.tags for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their tags"
on public.tags for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their tags"
on public.tags for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their link tags"
on public.link_tags for select to authenticated
using (
  exists (
    select 1 from public.links
    where links.id = link_tags.link_id
      and links.user_id = (select auth.uid())
  )
);

create policy "Users can create their link tags"
on public.link_tags for insert to authenticated
with check (
  exists (
    select 1 from public.links
    where links.id = link_tags.link_id
      and links.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.tags
    where tags.id = link_tags.tag_id
      and tags.user_id = (select auth.uid())
  )
);

create policy "Users can delete their link tags"
on public.link_tags for delete to authenticated
using (
  exists (
    select 1 from public.links
    where links.id = link_tags.link_id
      and links.user_id = (select auth.uid())
  )
);

grant select, insert, update, delete on public.profiles, public.links, public.tags, public.link_tags to authenticated;
