// Shared fetch helper for edge functions that require user JWT verification.
// Sends the active Supabase user's access_token as Bearer (falls back to
// the publishable key for unauthenticated scenarios). Includes apikey header
// so the Supabase gateway accepts the request.

import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/env';

const PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY ?? SUPABASE_PUBLISHABLE_KEY ?? '';

export async function fetchWithUserToken(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? PUBLISHABLE_KEY;
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('apikey', PUBLISHABLE_KEY);
  headers.set('X-Request-Id', crypto.randomUUID());
  return fetch(url, { ...init, headers });
}
