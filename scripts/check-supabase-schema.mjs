import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or Supabase public key.");
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const checks = [
  supabase
    .from("links")
    .select("id, title, url, source, domain, description, saved_reason, preview_title, preview_description, favicon_url, preview_logo_url, metadata_image_url, resource_type, collection_name, is_favorite, created_at, archived_at")
    .limit(1),
  supabase.from("profiles").select("id, display_name, avatar_url").limit(1),
  supabase.from("tags").select("id, user_id, name").limit(1),
  supabase.from("link_tags").select("link_id, tag_id").limit(1),
];

const results = await Promise.all(checks);
const failure = results.find((result) => result.error)?.error;

if (failure) {
  throw new Error(`Supabase schema is not ready: ${failure.message}`);
}

const rpcProbes = await Promise.all([
  supabase.rpc("save_link_with_tags", { p_link_id: null, p_link: {}, p_tags: [] }),
  supabase.rpc("consume_api_rate_limit", { p_scope: "schema-check", p_limit: 1, p_window_seconds: 60 }),
]);

const missingRpc = rpcProbes.find(
  ({ error }) => error?.code === "PGRST202" || error?.message.toLowerCase().includes("could not find the function")
)?.error;

if (missingRpc) {
  throw new Error("Supabase hardening migration is not applied. Run 20260711120000_harden_keepnoto_mvp.sql.");
}

const avatarProbe = await supabase.storage.from("avatars").list("", { limit: 1 });

if (avatarProbe.error?.message.toLowerCase().includes("bucket not found")) {
  throw new Error("Supabase avatars bucket is missing. Run 20260711120000_harden_keepnoto_mvp.sql.");
}

console.log("Supabase schema check passed.");
