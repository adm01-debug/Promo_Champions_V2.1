import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  authenticateInboundEmailWebhook,
  authenticateMultichannelStatusWebhook,
  hmacSha1Base64,
  hmacSha256Base64,
  hmacSha256Hex,
  timingSafeEqual,
  twilioSigningPayload,
  verifyMetaWebhookHandshake,
  verifyResendSvixSignature,
  verifySendGridSignature,
} from "./webhook-auth.ts";

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function asPem(bytes: Uint8Array): string {
  const lines = toBase64(bytes).match(/.{1,64}/g)?.join("\n") ?? "";
  return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}

function encodeDerInteger(value: Uint8Array): Uint8Array {
  let start = 0;
  while (start < value.length - 1 && value[start] === 0) start++;
  let integer = value.slice(start);
  if ((integer[0] & 0x80) !== 0) integer = new Uint8Array([0, ...integer]);
  return new Uint8Array([0x02, integer.length, ...integer]);
}

function p1363ToDer(signature: Uint8Array): Uint8Array {
  const body = new Uint8Array([
    ...encodeDerInteger(signature.slice(0, 32)),
    ...encodeDerInteger(signature.slice(32)),
  ]);
  return new Uint8Array([0x30, body.length, ...body]);
}

Deno.test("HMAC genérico rejeita corpo e assinatura adulterados", async () => {
  const body = '{"event":"delivered"}';
  const secret = "segredo-de-teste";
  const signature = await hmacSha256Hex(secret, body);
  const auth = await authenticateMultichannelStatusWebhook(
    new Headers({ "x-webhook-signature": signature }),
    body,
    "https://example.test/webhook",
    (name) => name === "MULTICHANNEL_WEBHOOK_SECRET" ? secret : undefined,
  );
  assertEquals(auth, { ok: true, provider: "generic" });

  const inbound = await authenticateInboundEmailWebhook(
    new Headers({ "x-webhook-signature": signature }),
    body,
    (name) => name === "INBOUND_EMAIL_WEBHOOK_SECRET" ? secret : undefined,
  );
  assertEquals(inbound, { ok: true, provider: "generic" });

  const metaSecret = "meta-secret-de-teste";
  const metaSignature = `sha256=${await hmacSha256Hex(metaSecret, body)}`;
  const meta = await authenticateMultichannelStatusWebhook(
    new Headers({ "x-hub-signature-256": metaSignature }),
    body,
    "https://example.test/webhook",
    (name) => name === "META_APP_SECRET" ? metaSecret : undefined,
  );
  assertEquals(meta, { ok: true, provider: "meta_cloud" });

  const forged = await authenticateMultichannelStatusWebhook(
    new Headers({ "x-webhook-signature": signature }),
    `${body}!`,
    "https://example.test/webhook",
    (name) => name === "MULTICHANNEL_WEBHOOK_SECRET" ? secret : undefined,
  );
  assertEquals(forged, { ok: false, status: 401, code: "invalid_signature" });
});

Deno.test("Resend Svix exige assinatura recente sobre o corpo bruto", async () => {
  const rawSecret = encoder.encode("resend-secret-de-teste-32-bytes-000");
  const secret = `whsec_${toBase64(rawSecret)}`;
  const body = '{"type":"email.received"}';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const id = "msg_test_123";
  const signature = await hmacSha256Base64(
    rawSecret,
    `${id}.${timestamp}.${body}`,
  );
  const headers = new Headers({
    "svix-id": id,
    "svix-timestamp": timestamp,
    "svix-signature": `v1,${signature}`,
  });

  assert(await verifyResendSvixSignature(secret, body, headers));
  assertEquals(
    await verifyResendSvixSignature(secret, `${body}!`, headers),
    false,
  );
  assertEquals(
    await verifyResendSvixSignature(
      secret,
      body,
      headers,
      Date.now() + 6 * 60 * 1000,
    ),
    false,
  );
});

Deno.test("SendGrid ECDSA valida DER e rejeita replay vencido", async () => {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"],
  ) as CryptoKeyPair;
  const publicKey = asPem(
    new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey)),
  );
  const body = '[{"event":"delivered"}]';
  const timestamp = String(Math.floor(Date.now() / 1000));
  const rawSignature = new Uint8Array(
    await crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      keyPair.privateKey,
      encoder.encode(`${timestamp}${body}`),
    ),
  );
  const derSignature = toBase64(p1363ToDer(rawSignature));

  assert(
    await verifySendGridSignature(publicKey, body, timestamp, derSignature),
  );
  assertEquals(
    await verifySendGridSignature(
      publicKey,
      `${body}!`,
      timestamp,
      derSignature,
    ),
    false,
  );
  assertEquals(
    await verifySendGridSignature(
      publicKey,
      body,
      timestamp,
      derSignature,
      Date.now() + 6 * 60 * 1000,
    ),
    false,
  );
});

Deno.test("Twilio usa URL e parâmetros form-urlencoded canônicos", async () => {
  const token = "twilio-token-de-teste";
  const url =
    "https://example.test/functions/v1/multichannel-status-webhook?source=twilio";
  const body = "MessageStatus=delivered&MessageSid=SM123&To=%2B5511999999999";
  const payload = twilioSigningPayload(
    url,
    body,
    "application/x-www-form-urlencoded",
  );
  const signature = await hmacSha1Base64(token, payload);
  const auth = await authenticateMultichannelStatusWebhook(
    new Headers({
      "content-type": "application/x-www-form-urlencoded",
      "x-twilio-signature": signature,
    }),
    body,
    url,
    (name) => name === "TWILIO_AUTH_TOKEN" ? token : undefined,
  );
  assertEquals(auth, { ok: true, provider: "twilio" });
  assertEquals(
    await authenticateMultichannelStatusWebhook(
      new Headers({
        "content-type": "application/x-www-form-urlencoded",
        "x-twilio-signature": signature,
      }),
      `${body}&Body=alterado`,
      url,
      (name) => name === "TWILIO_AUTH_TOKEN" ? token : undefined,
    ),
    { ok: false, status: 401, code: "invalid_signature" },
  );
});

Deno.test("autenticação falha fechada para segredo ausente, ambiguidade e handshake Meta", async () => {
  const body = '{"message_id":"m1"}';
  const missingConfig = await authenticateInboundEmailWebhook(
    new Headers({ "x-webhook-signature": "a".repeat(64) }),
    body,
    () => undefined,
  );
  assertEquals(missingConfig, {
    ok: false,
    status: 503,
    code: "webhook_not_configured",
  });

  const ambiguous = await authenticateInboundEmailWebhook(
    new Headers({
      "x-webhook-signature": "a".repeat(64),
      "svix-id": "msg_ambiguous",
    }),
    body,
    () => "unused",
  );
  assertEquals(ambiguous, {
    ok: false,
    status: 401,
    code: "ambiguous_signature",
  });

  const url = new URL(
    "https://example.test/?hub.mode=subscribe&hub.verify_token=meta-token&hub.challenge=ok",
  );
  assertEquals(
    verifyMetaWebhookHandshake(
      url,
      (name) => name === "META_WEBHOOK_VERIFY_TOKEN" ? "meta-token" : undefined,
    ),
    { ok: true, provider: "meta_cloud" },
  );
  assertEquals(
    verifyMetaWebhookHandshake(url, () => undefined),
    { ok: false, status: 503, code: "webhook_not_configured" },
  );
  assert(timingSafeEqual("mesmo", "mesmo"));
  assertEquals(timingSafeEqual("mesmo", "outro"), false);
});

Deno.test("guard-rails: autenticação antecede service_role e endpoints públicos são declarados", async () => {
  const inboundSource = await Deno.readTextFile(
    new URL("../inbound-email-webhook/index.ts", import.meta.url),
  );
  const multichannelSource = await Deno.readTextFile(
    new URL("../multichannel-status-webhook/index.ts", import.meta.url),
  );
  const config = await Deno.readTextFile(
    new URL("../../config.toml", import.meta.url),
  );

  assert(
    inboundSource.indexOf(
      "const authentication = await authenticateInboundEmailWebhook",
    ) <
      inboundSource.indexOf("const admin = createClient"),
    "inbound-email-webhook precisa autenticar antes do client privilegiado",
  );
  assert(
    multichannelSource.indexOf(
      "const authentication = await authenticateMultichannelStatusWebhook",
    ) <
      multichannelSource.indexOf("const supabase = createClient"),
    "multichannel-status-webhook precisa autenticar antes do client privilegiado",
  );
  assert(
    !inboundSource.includes("user-agent"),
    "o provedor não pode ser inferido do User-Agent",
  );
  assert(
    config.includes("[functions.inbound-email-webhook]\nverify_jwt = false"),
  );
  assert(
    config.includes(
      "[functions.multichannel-status-webhook]\nverify_jwt = false",
    ),
  );
});
