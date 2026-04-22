import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const dispositionMap: Record<string, string> = {
  completed: "connected",
  busy: "busy",
  "no-answer": "no_answer",
  failed: "no_answer",
  canceled: "no_answer",
};

Deno.serve(async (req) => {
  try {
    const form = await req.formData();
    const callSid = form.get("CallSid") as string;
    const status = form.get("CallStatus") as string;
    const duration = form.get("CallDuration") as string | null;
    const recordingUrl = form.get("RecordingUrl") as string | null;
    const recordingSid = form.get("RecordingSid") as string | null;
    const price = form.get("Price") as string | null;

    if (!callSid) {
      return new Response("Missing CallSid", { status: 400 });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const update: Record<string, unknown> = { status };
    if (duration) update.duration_seconds = parseInt(duration, 10);
    if (recordingUrl) update.recording_url = `${recordingUrl}.mp3`;
    if (recordingSid) update.recording_sid = recordingSid;
    if (price) update.price = parseFloat(price);
    if (status === "completed" || status === "failed" || status === "canceled" || status === "busy" || status === "no-answer") {
      update.ended_at = new Date().toISOString();
    }

    const { data: session } = await admin
      .from("twilio_call_sessions")
      .update(update)
      .eq("call_sid", callSid)
      .select()
      .maybeSingle();

    // Auto-create call_log on completion
    if (session && (status === "completed" || status === "no-answer" || status === "busy" || status === "failed")) {
      const disposition = dispositionMap[status] ?? "no_answer";
      const { data: existing } = await admin
        .from("call_logs")
        .select("id")
        .eq("call_sid", callSid)
        .maybeSingle();

      if (!existing) {
        await admin.from("call_logs").insert({
          owner_id: session.owner_id,
          sale_id: session.sale_id,
          queue_item_id: session.queue_item_id,
          call_sid: callSid,
          disposition,
          duration_seconds: session.duration_seconds ?? 0,
          notes: status === "completed" ? "Chamada Twilio concluída" : `Chamada Twilio: ${status}`,
        });
      }
    }

    return new Response("ok", { status: 200 });
  } catch (e) {
    console.error("twilio-call-status error:", e);
    return new Response((e as Error).message, { status: 500 });
  }
});
