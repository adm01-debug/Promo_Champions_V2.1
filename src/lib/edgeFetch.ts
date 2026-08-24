// Shared fetch helper for edge functions that require user JWT verification.
// Sends the active Supabase user's access_token as Bearer (falls back to
// the publishable key for unauthenticated scenarios). Includes apikey header
// so the Supabase gateway accepts the request.

import { supabase } from "@/integrations/supabase/client";

const PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "";

export async function fetchWithUserToken(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? PUBLISHABLE_KEY;
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("apikey", PUBLISHABLE_KEY);
  return fetch(url, { ...init, headers });
}