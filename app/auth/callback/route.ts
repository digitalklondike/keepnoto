import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const loginUrl = new URL("/login", requestUrl.origin);

  if (!code) {
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    loginUrl.searchParams.set("error", "oauth_callback_failed");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL("/", requestUrl.origin));
}