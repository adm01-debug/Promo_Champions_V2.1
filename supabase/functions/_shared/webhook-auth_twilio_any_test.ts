// Testes de verifyTwilioSignatureAny — a variante multi-token/multi-URL usada
// pelos webhooks de voz (twilio-call-status / twilio-call-twiml). Gera a
// assinatura exatamente como a Twilio (HMAC-SHA1 base64 sobre url + params
// ordenados) e valida aceitação/rejeição.
import { assertEquals } from "jsr:@std/assert";
import { verifyTwilioSignatureAny } from "./webhook-auth.ts";

async function twilioSign(authToken: string, url: string, form: Record<string, string>): Promise<string> {
  const sorted = Object.entries(form).sort(([a], [b]) => (a === b ? 0 : a < b ? -1 : 1));
  const payload = url + sorted.map(([k, v]) => `${k}${v}`).join("");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

const FORM = { CallSid: "CA123", CallStatus: "completed", CallDuration: "42" };
const RAW_BODY = new URLSearchParams(FORM).toString();
const CT = "application/x-www-form-urlencoded";
const URL_A = "https://example.supabase.co/functions/v1/twilio-call-status";
const URL_B = "https://gateway.internal/functions/v1/twilio-call-status";

Deno.test("aceita assinatura do token do tenant (2º da lista)", async () => {
  const sig = await twilioSign("tenant-token", URL_A, FORM);
  const ok = await verifyTwilioSignatureAny(
    ["global-token", "tenant-token"],
    [URL_A],
    RAW_BODY,
    CT,
    sig,
  );
  assertEquals(ok, true);
});

Deno.test("aceita quando só a 2ª URL candidata casa", async () => {
  const sig = await twilioSign("tenant-token", URL_A, FORM);
  const ok = await verifyTwilioSignatureAny(
    ["tenant-token"],
    [URL_B, URL_A],
    RAW_BODY,
    CT,
    sig,
  );
  assertEquals(ok, true);
});

Deno.test("rejeita assinatura forjada (nenhum token casa)", async () => {
  const sig = await twilioSign("attacker-token", URL_A, FORM);
  const ok = await verifyTwilioSignatureAny(
    ["global-token", "tenant-token"],
    [URL_A],
    RAW_BODY,
    CT,
    sig,
  );
  assertEquals(ok, false);
});

Deno.test("rejeita corpo adulterado após assinar", async () => {
  const sig = await twilioSign("tenant-token", URL_A, FORM);
  const tampered = new URLSearchParams({ ...FORM, CallDuration: "9999" }).toString();
  const ok = await verifyTwilioSignatureAny(["tenant-token"], [URL_A], tampered, CT, sig);
  assertEquals(ok, false);
});

Deno.test("GET (sem corpo form): payload é só a URL — aceita e rejeita corretamente", async () => {
  const urlWithQuery = "https://example.supabase.co/functions/v1/twilio-call-twiml?owner_id=abc";
  const sig = await twilioSign("tenant-token", urlWithQuery, {});
  assertEquals(await verifyTwilioSignatureAny(["tenant-token"], [urlWithQuery], "", "", sig), true);
  // owner_id diferente na URL → assinatura não casa (fecha enumeração)
  const otherUrl = "https://example.supabase.co/functions/v1/twilio-call-twiml?owner_id=zzz";
  assertEquals(await verifyTwilioSignatureAny(["tenant-token"], [otherUrl], "", "", sig), false);
});

Deno.test("tokens nulos/ausentes e assinatura ausente → rejeita sem lançar", async () => {
  assertEquals(await verifyTwilioSignatureAny([null, undefined], [URL_A], RAW_BODY, CT, "abc"), false);
  assertEquals(await verifyTwilioSignatureAny(["tok"], [URL_A], RAW_BODY, CT, null), false);
});
