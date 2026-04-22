import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

// Generic status webhook for Twilio / Meta Cloud / Z-API.
// Returns 200 always to avoid retry storms.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const ct = req.headers.get("content-type") ?? "";
    let providerMessageId: string | null = null;
    let status: string | null = null;

    if (ct.includes("application/json")) {
      const j = await req.json().catch(() => ({} as Record<string, unknown>));
      // Meta Cloud
      const metaStatus = (j as { entry?: Array<{ changes?: Array<{ value?: { statuses?: Array<{ id?: string; status?: string }> } }> }> })
        ?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
      if (metaStatus?.id) {
        providerMessageId = metaStatus.id;
        status = metaStatus.status ?? null;
      } else {
        // Z-API or generic
        const generic = j as Record<string, unknown>;
        providerMessageId = (generic.messageId as string) || (generic.id as string) || null;
        status = (generic.status as string) || null;
      }
    } else {
      // Twilio sends application/x-www-form-urlencoded
      const form = await req.formData();
      providerMessageId = form.get("MessageSid")?.toString() ?? null;
      status = form.get("MessageStatus")?.toString() ?? null;
    }

    if (!providerMessageId || !status) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = ((): "sent" | "delivered" | "read" | "failed" | null => {
      const s = status.toLowerCase();
      if (["delivered"].includes(s)) return "delivered";
      if (["read", "seen"].includes(s)) return "read";
      if (["failed", "undelivered", "error"].includes(s)) return "failed";
      if (["sent", "queued", "accepted"].includes(s)) return "sent";
      return null;
    })();

    if (!normalized) {
      return new Response(JSON.stringify({ ok: true, ignored: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: msg } = await supabase
      .from("outbound_messages")
      .select("id, owner_id, enrollment_id, channel")
      .eq("provider_message_id", providerMessageId)
      .maybeSingle();

    if (msg) {
      const update: Record<string, unknown> = { status: normalized };
      if (normalized === "delivered") update.delivered_at = new Date().toISOString();
      if (normalized === "read") update.read_at = new Date().toISOString();
      await supabase.from("outbound_messages").update(update).eq("id", msg.id);

      // If read, register engagement signal (open equivalent) for the contact
      if (normalized === "read" && msg.enrollment_id) {
        const { data: enr } = await supabase
          .from("sequence_enrollments")
          .select("contact_id, contact_type")
          .eq("id", msg.enrollment_id)
          .maybeSingle();
        if (enr?.contact_id && enr?.contact_type) {
          await supabase.rpc("record_engagement_signal", {
            _contact_id: enr.contact_id,
            _contact_type: enr.contact_type,
            _signal: "open",
            _occurred_at: new Date().toISOString(),
          });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (_e) {
    return new Response(JSON.stringify({ ok: true, error: "swallowed" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
