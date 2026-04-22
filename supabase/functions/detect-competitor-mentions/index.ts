import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DiarizationSegment {
  start?: number;
  end?: number;
  text?: string;
  speaker?: string;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: cErr } = await supabase.auth.getClaims(token);
    if (cErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { recording_id } = await req.json();
    if (!recording_id || typeof recording_id !== "string") {
      return new Response(JSON.stringify({ error: "recording_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for cross-table reads (registry is global)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: rec, error: rErr } = await supabase
      .from("call_recordings")
      .select("id, transcript, diarization, salesperson_id")
      .eq("id", recording_id)
      .maybeSingle();

    if (rErr || !rec) {
      return new Response(JSON.stringify({ error: "Recording not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transcript = (rec.transcript ?? "").toString();
    if (!transcript) {
      return new Response(
        JSON.stringify({ mentions_count: 0, competitors: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: registry } = await admin
      .from("competitors_registry")
      .select("id, name, aliases, default_battle_card_id")
      .eq("is_active", true);

    if (!registry?.length) {
      return new Response(
        JSON.stringify({ mentions_count: 0, competitors: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Clear previous mentions for this recording (re-detect idempotently)
    await admin.from("competitor_mentions").delete().eq("recording_id", recording_id);

    const segments: DiarizationSegment[] = Array.isArray(rec.diarization)
      ? (rec.diarization as DiarizationSegment[])
      : [];

    const mentionsToInsert: Array<{
      recording_id: string;
      competitor_id: string;
      competitor_name: string;
      timestamp_sec: number | null;
      context_snippet: string;
      battle_card_id: string | null;
    }> = [];

    const competitorsHit: Record<string, number> = {};

    for (const c of registry) {
      const terms = [c.name, ...(c.aliases ?? [])].filter(Boolean);
      for (const term of terms) {
        const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
        let m: RegExpExecArray | null;
        while ((m = re.exec(transcript)) !== null) {
          const idx = m.index;
          const start = Math.max(0, idx - 100);
          const end = Math.min(transcript.length, idx + term.length + 100);
          const snippet = transcript.slice(start, end).trim();

          // approximate timestamp by char position → segment
          let timestamp: number | null = null;
          if (segments.length) {
            let cumulative = 0;
            for (const seg of segments) {
              const segLen = (seg.text ?? "").length + 1;
              if (cumulative + segLen >= idx) {
                timestamp = Math.round(seg.start ?? 0);
                break;
              }
              cumulative += segLen;
            }
          }

          mentionsToInsert.push({
            recording_id,
            competitor_id: c.id,
            competitor_name: c.name,
            timestamp_sec: timestamp,
            context_snippet: snippet,
            battle_card_id: c.default_battle_card_id ?? null,
          });
          competitorsHit[c.name] = (competitorsHit[c.name] ?? 0) + 1;
        }
      }
    }

    if (mentionsToInsert.length) {
      const { error: insErr } = await admin
        .from("competitor_mentions")
        .insert(mentionsToInsert);
      if (insErr) throw insErr;
    }

    return new Response(
      JSON.stringify({
        mentions_count: mentionsToInsert.length,
        competitors: Object.entries(competitorsHit).map(([name, count]) => ({
          name,
          count,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("detect-competitor-mentions error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
