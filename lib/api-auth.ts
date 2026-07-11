import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedApiContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return error || !user ? null : { supabase, user };
}
