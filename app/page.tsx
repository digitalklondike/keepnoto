import { redirect } from "next/navigation";

import { KeepnotoWorkspace } from "@/components/keepnoto/workspace";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    redirect("/login");
  }

  return <KeepnotoWorkspace session={{ id: user.id, email: user.email }} />;
}
