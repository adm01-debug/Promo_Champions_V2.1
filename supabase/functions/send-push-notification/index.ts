import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { fetchWithTimeout } from "../_shared/fetch-with-timeout.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";

// Constant-time string compare to avoid timing side-channels.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const response = await fetchWithTimeout(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
        'Urgency': 'high'
      },
      body: payload
    });

    if (response.ok) {
      return { success: true, status: response.status };
    } else {
      return { success: false, status: response.status, error: await response.text() };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

Deno.serve(withRequestId('send-push-notification', async (req, _ctx) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // ── Authentication ────────────────────────────────────────────────────
  // Service-to-service calls (e.g. new-device-alert) arrive with the
  // service-role key as the Bearer token. User-originated calls carry a
  // regular JWT and are restricted to pushing only to their own user_id.
  // Unauthenticated callers are rejected to prevent push-phishing.
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized: missing bearer token' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const token = authHeader.slice(7); // strip "Bearer "

  // Check if this is an internal service-to-service call.
  const isServiceCall = safeEqual(token, supabaseServiceKey);

  let callerUserId: string | null = null;
  if (!isServiceCall) {
    // Validate as a user JWT.
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: authErr } = await anonClient.auth.getUser();
    if (authErr || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    callerUserId = user.id;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { user_ids, title, body: notifBody, icon, tag, url, data } = body;

    // Input validation
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'user_ids array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (user_ids.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Maximum 100 user_ids per request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (title && typeof title !== 'string') {
      return new Response(
        JSON.stringify({ error: 'title must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Scope check: non-service callers may only push to their own user_id.
    if (!isServiceCall && callerUserId) {
      const unauthorized = user_ids.some((id: string) => id !== callerUserId);
      if (unauthorized) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: users may only push to their own user_id' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Chunked p/ evitar overflow de URL (mesmo com limite de 100, tokens longos podem passar de 4KB).
    const subscriptions = await chunkedIn<{ id: string; user_id: string; endpoint: string; p256dh: string; auth: string }>(
      user_ids,
      (chunk) => supabase
        .from('push_subscriptions')
        .select('id, user_id, endpoint, p256dh, auth')
        .in('user_id', chunk)
        .limit(1000),
      { parallel: true, label: 'send-push-notification.subscriptions' },
    );

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = JSON.stringify({
      title: title || 'Nova Notificação',
      body: notifBody || 'Você tem uma nova notificação',
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: tag || 'notification',
      data: { url: url || '/', ...data },
      requireInteraction: true
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const result = await sendWebPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          payload,
        );

        if (!result.success && (result.status === 404 || result.status === 410)) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }

        return { success: result.success, user_id: sub.user_id };
      })
    );

    const sent = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length;

    return new Response(
      JSON.stringify({ success: true, sent, failed: results.length - sent, total: subscriptions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('send-push-notification error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}));
