import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { job_id } = (await req.json()) as { job_id: string };
    if (!job_id) {
      return new Response(JSON.stringify({ error: "job_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: job } = await admin
      .from("email_bulk_jobs")
      .select("id, owner_id, status")
      .eq("id", job_id)
      .maybeSingle();

    if (!job || job.owner_id !== user.id) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await admin.from("email_bulk_jobs").update({ status: "sending" }).eq("id", job_id);

    const { data: drafts } = await admin
      .from("email_bulk_drafts")
      .select("*")
      .eq("job_id", job_id)
      .eq("approved", true)
      .is("sent_at", null);

    let sent = 0;
    let failed = 0;

    for (const d of drafts ?? []) {
      if (!d.recipient_email) {
        await admin
          .from("email_bulk_drafts")
          .update({ error: "missing_recipient_email" })
          .eq("id", d.id);
        failed++;
        continue;
      }
      try {
        const { data: res, error } = await admin.functions.invoke("send-multichannel-message", {
          body: {
            channel: "email",
            to: d.recipient_email,
            recipient_name: d.recipient_name ?? d.recipient_email,
            subject: d.subject,
            message: d.body,
            metadata: { source: "bulk-composer", job_id, draft_id: d.id, client_id: d.client_id },
          },
        });
        if (error || (res as any)?.error) throw new Error(error?.message ?? (res as any)?.error);
        await admin
          .from("email_bulk_drafts")
          .update({ sent_at: new Date().toISOString(), error: null })
          .eq("id", d.id);
        sent++;
      } catch (e) {
        await admin
          .from("email_bulk_drafts")
          .update({ error: (e as Error).message.slice(0, 500) })
          .eq("id", d.id);
        failed++;
      }
    }

    await admin
      .from("email_bulk_jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", job_id);

    return new Response(JSON.stringify({ sent, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("email-bulk-send error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
