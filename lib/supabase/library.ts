import { createClient } from "@/lib/supabase/client";
import { formatRelativeDate } from "@/lib/link-utils";

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
  archived_at?: string | null;
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
  createdAt: string;
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

export type LibraryLinkInput = Omit<LibraryLink, "addedDate" | "archivedAt" | "createdAt" | "favorite" | "id" | "logoColor"> & {
  id?: string;
  favorite?: boolean;
};

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
    addedDate: formatRelativeDate(row.created_at),
    createdAt: row.created_at,
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

const linkSelect = "id, title, url, source, domain, description, saved_reason, preview_title, preview_description, favicon_url, preview_logo_url, metadata_image_url, resource_type, collection_name, is_favorite, created_at, archived_at, link_tags(tags(name))";
const legacyLinkSelect = "id, title, url, source, domain, description, saved_reason, preview_title, preview_description, favicon_url, preview_logo_url, metadata_image_url, resource_type, collection_name, is_favorite, created_at, link_tags(tags(name))";

function isMissingArchiveColumn(error: { message: string } | null) {
  return Boolean(error?.message.toLowerCase().includes("archived_at"));
}

async function loadLinkRows(supabase: ReturnType<typeof createClient>) {
  const currentResult = await supabase
    .from("links")
    .select(linkSelect)
    .order("is_favorite", { ascending: false })
    .order("created_at", { ascending: false });

  if (!isMissingArchiveColumn(currentResult.error)) {
    return currentResult;
  }

  return supabase
    .from("links")
    .select(legacyLinkSelect)
    .order("is_favorite", { ascending: false })
    .order("created_at", { ascending: false });
}

async function getLink(linkId: string): Promise<LibraryLink> {
  const supabase = createClient();
  let result = await supabase
    .from("links")
    .select(linkSelect)
    .eq("id", linkId)
    .single();

  if (isMissingArchiveColumn(result.error)) {
    result = await supabase
      .from("links")
      .select(legacyLinkSelect)
      .eq("id", linkId)
      .single();
  }

  ensureSuccess(result.error);
  return mapLink(result.data as unknown as LinkRow, 0);
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

function isMissingRpc(error: { code?: string; message: string } | null) {
  return error?.code === "PGRST202" || Boolean(error?.message.toLowerCase().includes("save_link_with_tags"));
}
export async function loadLibrary(userId: string): Promise<LibrarySnapshot> {
  const supabase = createClient();
  const [linksResult, tagsResult, profileResult] = await Promise.all([
    loadLinkRows(supabase),
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

export type LibraryLinkPreviewInput = {
  href: string;
  domain: string;
  source: string;
  description?: string;
  previewTitle?: string;
  previewDescription?: string;
  faviconSrc?: string;
  previewLogoSrc?: string;
  metadataImageSrc?: string;
  type?: string;
};

export async function updateLibraryLinkPreview(
  linkId: string,
  expectedHref: string,
  preview: LibraryLinkPreviewInput
): Promise<LibraryLink | null> {
  const values = {
    url: preview.href,
    domain: preview.domain,
    source: preview.source,
    ...(preview.description ? { description: preview.description } : {}),
    ...(preview.previewTitle ? { preview_title: preview.previewTitle } : {}),
    ...(preview.previewDescription ? { preview_description: preview.previewDescription } : {}),
    ...(preview.faviconSrc ? { favicon_url: preview.faviconSrc } : {}),
    ...(preview.previewLogoSrc ? { preview_logo_url: preview.previewLogoSrc } : {}),
    ...(preview.metadataImageSrc ? { metadata_image_url: preview.metadataImageSrc } : {}),
    ...(preview.type ? { resource_type: preview.type } : {}),
  };
  const result = await createClient()
    .from("links")
    .update(values)
    .eq("id", linkId)
    .eq("url", expectedHref)
    .select("id")
    .maybeSingle();

  ensureSuccess(result.error);
  return result.data ? getLink(result.data.id) : null;
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

  const rpcResult = await supabase.rpc("save_link_with_tags", {
    p_link_id: link.id ?? null,
    p_link: values,
    p_tags: link.tags,
  });

  if (!rpcResult.error) {
    const savedLinkId = typeof rpcResult.data === "string" ? rpcResult.data : link.id;

    if (!savedLinkId) {
      throw new Error("The saved link could not be loaded.");
    }

    return getLink(savedLinkId);
  }

  if (!isMissingRpc(rpcResult.error)) {
    ensureSuccess(rpcResult.error);
  }

  // Keep older deployments usable until the atomic RPC migration is applied.
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
export async function saveProfileAvatar(userId: string, file: File) {
  const supabase = createClient();
  const objectPath = `${userId}/avatar`;
  const { error: uploadError } = await supabase.storage.from("avatars").upload(objectPath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: true,
  });
  ensureSuccess(uploadError);

  const { data } = supabase.storage.from("avatars").getPublicUrl(objectPath);
  const avatarUrl = `${data.publicUrl}?v=${Date.now()}`;
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, avatar_url: avatarUrl }, { onConflict: "id" });
  ensureSuccess(profileError);

  return avatarUrl;
}
export async function removeProfileAvatar(userId: string) {
  const supabase = createClient();
  const { error: removeError } = await supabase.storage.from("avatars").remove([`${userId}/avatar`]);
  ensureSuccess(removeError);
  const { error: profileError } = await supabase.from("profiles").upsert({ id: userId, avatar_url: null }, { onConflict: "id" });
  ensureSuccess(profileError);
}
