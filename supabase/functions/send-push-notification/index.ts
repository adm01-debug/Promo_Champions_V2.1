import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import { fetchWithTrace } from "../_shared/fetch-with-timeout.ts";
import { chunkedIn } from "../_shared/chunked-in.ts";

// Constant-time string compare to avoid timing side-channels.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ── VAPID (RFC 8292) ─────────────────────────────────────────────────────
// Push services exigem identificação voluntária do servidor: sem o header
// `Authorization: vapid t=<jwt ES256>, k=<chave pública>` o envio é rejeitado
// silenciosamente. As chaves vêm dos secrets da function (VAPID_PUBLIC_KEY /
// VAPID_PRIVATE_KEY, formato base64url do `web-push generate-vapid-keys`).

const VAPID_EXPIRATION_SECONDS = 12 * 60 * 60;

function base64UrlDecode(value: string): Uint8Array | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let cachedVapidKey: Promise<CryptoKey> | null = null;

async function importVapidPrivateKey(
  publicKeyB64: string,
  privateKeyB64: string,
): Promise<CryptoKey | null> {
  if (!cachedVapidKey) {
    cachedVapidKey = (async () => {
      const publicBytes = base64UrlDecode(publicKeyB64);
      const privateBytes = base64UrlDecode(privateKeyB64);
      if (!publicBytes || publicBytes.length !== 65 || publicBytes[0] !== 0x04) {
        throw new Error("vapid_public_key_invalid");
      }
      if (!privateBytes || privateBytes.length !== 32) {
        throw new Error("vapid_private_key_invalid");
      }
      const jwk: JsonWebKey = {
        kty: "EC",
        crv: "P-256",
        x: base64UrlEncode(publicBytes.slice(1, 33)),
        y: base64UrlEncode(publicBytes.slice(33, 65)),
        d: base64UrlEncode(privateBytes),
      };
      return await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign"],
      );
    })();
    cachedVapidKey.catch(() => { cachedVapidKey = null; });
  }
  try {
    return await cachedVapidKey;
  } catch {
    return null;
  }
}

async function buildVapidAuthorization(
  endpoint: string,
  publicKeyB64: string,
  privateKeyB64: string,
): Promise<string | null> {
  const key = await importVapidPrivateKey(publicKeyB64, privateKeyB64);
  if (!key) return null;

  const subject = Deno.env.get("VAPID_SUBJECT") ??
    "mailto:admin@promobrindes.com.br";
  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" })),
  );
  const claims = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({
      aud: new URL(endpoint).origin,
      exp: Math.floor(Date.now() / 1000) + VAPID_EXPIRATION_SECONDS,
      sub: subject,
    })),
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      key,
      new TextEncoder().encode(`${header}.${claims}`) as unknown as ArrayBuffer,
    ),
  );
  return `vapid t=${header}.${claims}.${base64UrlEncode(signature)}, k=${publicKeyB64}`;
}

// ── Criptografia do payload (RFC 8291, content-coding aes128gcm) ──────────
// Assinatura VAPID só identifica o servidor — o push service também exige o
// corpo cifrado com as chaves da inscrição: ECDH efêmero com `p256dh`, IKM
// derivado do `auth` secret, CEK+nonce via HKDF-SHA256 e AES-128-GCM. Sem
// isso o service descarta a mensagem mesmo com Authorization válido.

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((acc, p) => acc + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

async function hmacSha256(
  keyBytes: Uint8Array,
  data: Uint8Array,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes as unknown as ArrayBuffer,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, data as unknown as ArrayBuffer),
  );
}

// HKDF-SHA256 com um único bloco de expand (saídas ≤ 32 bytes).
async function hkdfBlock(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  const prk = await hmacSha256(salt, ikm);
  const expanded = await hmacSha256(prk, concatBytes(info, Uint8Array.of(0x01)));
  return expanded.slice(0, length);
}

async function encryptPushPayload(
  subscription: { p256dh: string; auth: string },
  payload: string,
): Promise<Uint8Array | null> {
  try {
    const uaPublic = base64UrlDecode(subscription.p256dh);
    const authSecret = base64UrlDecode(subscription.auth);
    if (!uaPublic || uaPublic.length !== 65 || uaPublic[0] !== 0x04) return null;
    if (!authSecret || authSecret.length !== 16) return null;

    const uaKey = await crypto.subtle.importKey(
      "jwk",
      {
        kty: "EC",
        crv: "P-256",
        x: base64UrlEncode(uaPublic.slice(1, 33)),
        y: base64UrlEncode(uaPublic.slice(33, 65)),
      },
      { name: "ECDH", namedCurve: "P-256" },
      false,
      [],
    );
    const asKeys = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"],
    );
    const asPublic = new Uint8Array(
      await crypto.subtle.exportKey("raw", asKeys.publicKey),
    );
    const ecdhSecret = new Uint8Array(
      await crypto.subtle.deriveBits(
        { name: "ECDH", public: uaKey },
        asKeys.privateKey,
        256,
      ),
    );

    // RFC 8291 §3.4: o auth_secret do subscriber é o salt do extract que
    // produz o PRK; o info leva as duas chaves públicas não-comprimidas.
    const keyInfo = concatBytes(
      new TextEncoder().encode("WebPush: info"),
      Uint8Array.of(0x00),
      uaPublic,
      asPublic,
    );
    const ikm = await hkdfBlock(authSecret, ecdhSecret, keyInfo, 32);

    // CEK e nonce do registro único: salt aleatório + HKDF sobre o IKM.
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const cek = await hkdfBlock(
      salt,
      ikm,
      new TextEncoder().encode("Content-Encoding: aes128gcm\0"),
      16,
    );
    const nonce = await hkdfBlock(
      salt,
      ikm,
      new TextEncoder().encode("Content-Encoding: nonce\0"),
      12,
    );

    // aes128gcm: plaintext + delimitador 0x02 (registro final) antes do GCM.
    const plainBytes = concatBytes(
      new TextEncoder().encode(payload),
      Uint8Array.of(0x02),
    );
    const aesKey = await crypto.subtle.importKey(
      "raw",
      cek as unknown as ArrayBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt"],
    );
    const ciphertext = new Uint8Array(
      await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: nonce as unknown as ArrayBuffer },
        aesKey,
        plainBytes as unknown as ArrayBuffer,
      ),
    );

    // Corpo ECE: salt(16) | rs uint32 | idlen(1) | pubkey efêmera(65) | ct.
    const header = new Uint8Array(16 + 4 + 1 + 65);
    header.set(salt, 0);
    new DataView(header.buffer).setUint32(16, 4096, false);
    header[20] = 65;
    header.set(asPublic, 21);
    return concatBytes(header, ciphertext);
  } catch {
    return null;
  }
}

async function sendWebPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  requestId: string,
  vapid: { publicKey: string; privateKey: string },
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const authorization = await buildVapidAuthorization(
      subscription.endpoint,
      vapid.publicKey,
      vapid.privateKey,
    );
    if (!authorization) {
      return { success: false, error: 'vapid_signing_failed' };
    }

    const body = await encryptPushPayload(subscription, payload);
    if (!body) {
      return { success: false, error: 'push_payload_encryption_failed' };
    }

    const response = await fetchWithTrace(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'TTL': '86400',
        'Urgency': 'high',
        'Authorization': authorization
      },
      body: body as unknown as BodyInit
    }, {
      requestId,
      fnName: 'send-push-notification',
      operation: 'web_push',
      log: 'silent',
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

Deno.serve(withRequestId('send-push-notification', async (req, ctx) => {
  const corsHeaders = getCorsHeaders(req);
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

  // VAPID obrigatório: antes do fix o envio seguia sem assinatura e o push
  // service descartava cada mensagem — hoje falha explicitamente até o
  // usuário cadastrar os secrets.
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  if (!vapidPublicKey || !vapidPrivateKey) {
    return new Response(
      JSON.stringify({ error: 'vapid_not_configured', message: 'Cadastre VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY nos secrets da function' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
          ctx.requestId,
          { publicKey: vapidPublicKey, privateKey: vapidPrivateKey },
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
    ctx.log('error', 'send_push_notification_failed');
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}));
