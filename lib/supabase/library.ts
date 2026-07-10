import { createClient } from "@/lib/supabase/client";

const linkLogoColors = [
  "var(--favicon-1)",
  "var(--favicon-2)",
  "var(--favicon-3)",
  "var(--favicon-4)",
  "var(--favicon-5)",
];

type LinkRow = {
  id: string;
  title: string;
  url: string;
  source: string;
  domain: string;
  description: string;
  saved_reason: string | null;
  preview_title: string | null;
  preview_description: string | null;
  favicon_url: string | null;
  preview_logo_url: string | null;
  metadata_image_url: string | null;
  resource_type: string;
  collection_name: string | null;
  is_favorite: boolean;
  created_at: string;
  archived_at: string | null;
  link_tags: Array<{ tags: { name: string } | null }> | null;
};

export type LibraryLink = {
  id: string;
  title: string;
  domain: string;
  source: string;
  description: string;
  savedReason?: string;
  previewTitle: string;
  previewDescription: string;
  href: string;
  faviconSrc?: string;
  previewLogoSrc?: string;
  metadataImageSrc?: string;
  type: string;
  collection: string | null;
  tags: string[];
  addedDate: string;
  logoColor: string;
  favorite: boolean;
  archivedAt?: string;
};

export type LibraryProfile = {
  name: string;
  avatarDataUrl?: string;
};

export type LibrarySnapshot = {
  links: LibraryLink[];
  archivedLinks: LibraryLink[];
  profile: LibraryProfile | null;
  tags: string[];
};

export type LibraryLinkInput = Omit<LibraryLink, "addedDate" | "archivedAt" | "favorite" | "id" | "logoColor"> & {
  id?: string;
  favorite?: boolean;
};

function relativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  const elapsedMilliseconds = Date.now() - timestamp;
  const minutes = Math.max(0, Math.floor(elapsedMilliseconds / 60_000));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return days === 1 ? "1 day ago" : `${days} days ago`;
}

function mapLink(row: LinkRow, index: number): LibraryLink {
  return {
    id: row.id,
    title: row.title,
    domain: row.domain,
    source: row.source,
    description: row.description,
    savedReason: row.saved_reason ?? undefined,
    previewTitle: row.preview_title ?? row.title,
    previewDescription: row.preview_description ?? row.description,
    href: row.url,
    faviconSrc: row.favicon_url ?? undefined,
    previewLogoSrc: row.preview_logo_url ?? undefined,
    metadataImageSrc: row.metadata_image_url ?? undefined,
    type: row.resource_type,
    collection: row.collection_name,
    tags: row.link_tags?.flatMap((item) => (item.tags?.name ? [item.tags.name] : [])) ?? [],
    addedDate: relativeDate(row.created_at),
    logoColor: linkLogoColors[index % linkLogoColors.length],
    favorite: row.is_favorite,
    archivedAt: row.archived_at ?? undefined,
  };
}

function ensureSuccess(error: { message: string } | null) {
  if (error) {
    throw new Error(error.message);
  }
}

async function getLink(linkId: string): Promise<LibraryLink> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("links")
    .select("id, title, url, source, domain, description, saved_reason, preview_title, preview_description, favicon_url, preview_logo_url, metadata_image_url, resource_type, collection_name, is_favorite, created_at, archived_at, link_tags(tags(name))")
    .eq("id", linkId)
    .single();

  ensureSuccess(error);
  return mapLink(data as unknown as LinkRow, 0);
}

async function syncLinkTags(linkId: string, userId: string, tags: string[]) {
  const supabase = createClient();
  const uniqueTags = Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));

  const { error: deleteError } = await supabase.from("link_tags").delete().eq("link_id", linkId);
  ensureSuccess(deleteError);

  if (uniqueTags.length === 0) {
    return;
  }

  const { error: upsertError } = await supabase
    .from("tags")
    .upsert(uniqueTags.map((name) => ({ user_id: userId, name })), { onConflict: "user_id,name", ignoreDuplicates: true });
  ensureSuccess(upsertError);

  const { data: tagRows, error: tagError } = await supabase.from("tags").select("id").in("name", uniqueTags);
  ensureSuccess(tagError);

  const { error: insertError } = await supabase
    .from("link_tags")
    .insert((tagRows ?? []).map(({ id }) => ({ link_id: linkId, tag_id: id })));
  ensureSuccess(insertError);
}

export async function loadLibrary(userId: string): Promise<LibrarySnapshot> {
  const supabase = createClient();
  const [linksResult, tagsResult, profileResult] = await Promise.all([
    supabase
      .from("links")
      .select("id, title, url, source, domain, description, saved_reason, preview_title, preview_description, favicon_url, preview_logo_url, metadata_image_url, resource_type, collection_name, is_favorite, created_at, archived_at, link_tags(tags(name))")
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("tags").select("name").order("name"),
    supabase.from("profiles").select("display_name, avatar_url").eq("id", userId).maybeSingle(),
  ]);

  ensureSuccess(linksResult.error);
  ensureSuccess(tagsResult.error);
  ensureSuccess(profileResult.error);

  const linkRows = (linksResult.data ?? []) as unknown as LinkRow[];
  const activeRows = linkRows.filter((row) => !row.archived_at);
  const archivedRows = linkRows
    .filter((row) => Boolean(row.archived_at))
    .sort((a, b) => new Date(b.archived_at ?? 0).getTime() - new Date(a.archived_at ?? 0).getTime());

  return {
    links: activeRows.map(mapLink),
    archivedLinks: archivedRows.map(mapLink),
    tags: (tagsResult.data ?? []).map(({ name }) => name),
    profile: profileResult.data
      ? {
          name: profileResult.data.display_name ?? "Keepnoto user",
          avatarDataUrl: profileResult.data.avatar_url ?? undefined,
        }
      : null,
  };
}

export async function saveLibraryLink(userId: string, link: LibraryLinkInput): Promise<LibraryLink> {
  const supabase = createClient();
  const values = {
    user_id: userId,
    title: link.title,
    url: link.href,
    source: link.source,
    domain: link.domain,
    description: link.description,
    saved_reason: link.savedReason ?? null,
    preview_title: link.previewTitle,
    preview_description: link.previewDescription,
    favicon_url: link.faviconSrc ?? null,
    preview_logo_url: link.previewLogoSrc ?? null,
    metadata_image_url: link.metadataImageSrc ?? null,
    resource_type: link.type,
    collection_name: link.collection,
    is_favorite: link.favorite ?? false,
  };

  const result = link.id
    ? await supabase.from("links").update(values).eq("id", link.id).select("id").single()
    : await supabase.from("links").insert(values).select("id").single();

  ensureSuccess(result.error);

  if (!result.data) {
    throw new Error("The saved link could not be loaded.");
  }

  await syncLinkTags(result.data.id, userId, link.tags);

  return getLink(result.data.id);
}

export async function archiveLibraryLink(linkId: string) {
  const archivedAt = new Date().toISOString();
  const { error } = await createClient()
    .from("links")
    .update({ archived_at: archivedAt, is_favorite: false })
    .eq("id", linkId);
  ensureSuccess(error);
  return archivedAt;
}

export async function restoreLibraryLink(linkId: string) {
  const { error } = await createClient().from("links").update({ archived_at: null }).eq("id", linkId);
  ensureSuccess(error);
}

export async function deleteLibraryLinkPermanently(linkId: string) {
  const { error } = await createClient().from("links").delete().eq("id", linkId);
  ensureSuccess(error);
}

export async function setLibraryLinkFavorite(linkId: string, isFavorite: boolean) {
  const { error } = await createClient().from("links").update({ is_favorite: isFavorite }).eq("id", linkId);
  ensureSuccess(error);
}

export async function renameLibraryTag(userId: string, currentName: string, nextName: string) {
  const result = await createClient()
    .from("tags")
    .update({ name: nextName })
    .eq("user_id", userId)
    .eq("name", currentName)
    .select("name")
    .single();

  ensureSuccess(result.error);

  if (!result.data) {
    throw new Error("The tag could not be renamed.");
  }

  return result.data.name;
}

export async function deleteLibraryTag(userId: string, name: string) {
  const result = await createClient()
    .from("tags")
    .delete()
    .eq("user_id", userId)
    .eq("name", name)
    .select("id")
    .single();

  ensureSuccess(result.error);

  if (!result.data) {
    throw new Error("The tag could not be deleted.");
  }
}
export async function saveProfileName(userId: string, name: string) {
  const { error } = await createClient().from("profiles").upsert({ id: userId, display_name: name }, { onConflict: "id" });
  ensureSuccess(error);
}
