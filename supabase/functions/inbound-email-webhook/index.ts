import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface ParsedEvent {
  provider: string;
  messageId: string | null;
  fromEmail: string | null;
  subject: string | null;
  receivedAt: string;
  eventType: string;
}

function parseEvent(payload: Record<string, unknown>, headers: Headers): ParsedEvent {
  const ua = headers.get("user-agent")?.toLowerCase() ?? "";
  const isResend = ua.includes("resend") || typeof (payload as { type?: unknown }).type === "string";
  const isSendGrid = Array.isArray(payload) || ua.includes("sendgrid");

  if (isResend) {
    const data = (payload as { data?: Record<string, unknown> }).data ?? {};
    const type = String((payload as { type?: unknown }).type ?? "email.received");
    const eventType = type.includes("bounce") ? "bounce"
      : type.includes("complain") ? "complaint"
      : type.includes("reply") || type.includes("received") ? "reply"
      : "other";
    const from = (data.from as string | undefined) ?? null;
    return {
      provider: "resend",
      messageId: (data.email_id as string | undefined) ?? (data.id as string | undefined) ?? null,
      fromEmail: typeof from === "string" ? from.replace(/.*<([^>]+)>.*/, "$1") : null,
      subject: (data.subject as string | undefined) ?? null,
      receivedAt: (data.created_at as string | undefined) ?? new Date().toISOString(),
      eventType,
    };
  }

  if (isSendGrid) {
    const ev = Array.isArray(payload) ? (payload[0] as Record<string, unknown>) : payload;
    const event = String(ev?.event ?? "");
    const eventType = event === "bounce" ? "bounce"
      : event === "spamreport" ? "complaint"
      : event === "unsubscribe" ? "unsubscribe"
      : "reply";
    return {
      provider: "sendgrid",
      messageId: (ev?.sg_message_id as string | undefined) ?? null,
      fromEmail: (ev?.email as string | undefined) ?? null,
      subject: (ev?.subject as string | undefined) ?? null,
      receivedAt: ev?.timestamp ? new Date(Number(ev.timestamp) * 1000).toISOString() : new Date().toISOString(),
      eventType,
    };
  }

  // Generic fallback
  return {
    provider: "generic",
    messageId: (payload.message_id as string | undefined) ?? null,
    fromEmail: (payload.from as string | undefined) ?? null,
    subject: (payload.subject as string | undefined) ?? null,
    receivedAt: (payload.received_at as string | undefined) ?? new Date().toISOString(),
    eventType: (payload.event_type as string | undefined) ?? "reply",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }

  const ev = parseEvent(payload, req.headers);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let matchedEnrollmentId: string | null = null;
  try {
    if (ev.fromEmail) {
      const { data: matched } = await admin.rpc("match_reply_to_enrollment", {
        _contact_email: ev.fromEmail,
        _received_at: ev.receivedAt,
      });
      matchedEnrollmentId = (matched as string | null) ?? null;
    }

    await admin.from("inbound_reply_events").insert({
      provider: ev.provider,
      message_id: ev.messageId,
      from_email: ev.fromEmail,
      subject: ev.subject,
      received_at: ev.receivedAt,
      event_type: ev.eventType,
      matched_enrollment_id: matchedEnrollmentId,
      payload: payload as never,
    });

    if (matchedEnrollmentId) {
      const reason = ev.eventType === "bounce" ? "bounce"
        : ev.eventType === "unsubscribe" ? "unsubscribe"
        : "reply_detected";
      await admin.rpc("auto_pause_enrollment", {
        _enrollment_id: matchedEnrollmentId,
        _reason: reason,
      });
    }
  } catch (e) {
    console.error("inbound-email-webhook error", e);
  }

  // Always 200 to avoid retry storms
  return new Response(
    JSON.stringify({ ok: true, matched: matchedEnrollmentId, event_type: ev.eventType }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
