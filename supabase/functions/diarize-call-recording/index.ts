import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Turn {
  speaker: "seller" | "client" | "unknown";
  text: string;
  word_count: number;
  start_estimate: number;
  duration_estimate: number;
}

const SELLER_RE = /^\s*(vendedor|seller|sales|rep|consultor)\s*[:\-]/i;
const CLIENT_RE = /^\s*(cliente|client|prospect|lead|comprador)\s*[:\-]/i;
const SPEAKER_N_RE = /^\s*(speaker|interlocutor)\s*\d+\s*[:\-]/i;

function classifyLine(line: string): "seller" | "client" | "unknown" | null {
  if (SELLER_RE.test(line)) return "seller";
  if (CLIENT_RE.test(line)) return "client";
  if (SPEAKER_N_RE.test(line)) return "unknown";
  return null;
}

function stripLabel(line: string): string {
  return line.replace(/^\s*[A-Za-zÀ-ÿ ]+\s*[:\-]\s*/, "").trim();
}

function parseTranscript(transcript: string, totalDurationSec: number): {
  turns: Turn[];
  hasLabels: boolean;
} {
  const lines = transcript.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const rawTurns: { speaker: "seller" | "client" | "unknown"; text: string }[] = [];
  let current: { speaker: "seller" | "client" | "unknown"; text: string } | null = null;
  let labeledLines = 0;

  for (const line of lines) {
    const cls = classifyLine(line);
    if (cls) {
      labeledLines++;
      if (current) rawTurns.push(current);
      current = { speaker: cls, text: stripLabel(line) };
    } else if (current) {
      current.text += " " + line;
    } else {
      current = { speaker: "unknown", text: line };
    }
  }
  if (current) rawTurns.push(current);

  const totalWords = rawTurns.reduce(
    (a, t) => a + t.text.split(/\s+/).filter(Boolean).length,
    0,
  ) || 1;

  let cursor = 0;
  const turns: Turn[] = rawTurns.map((t) => {
    const wc = t.text.split(/\s+/).filter(Boolean).length;
    const dur = (wc / totalWords) * Math.max(totalDurationSec, 1);
    const start = cursor;
    cursor += dur;
    return {
      speaker: t.speaker,
      text: t.text,
      word_count: wc,
      start_estimate: Math.round(start),
      duration_estimate: Math.round(dur),
    };
  });

  return { turns, hasLabels: labeledLines >= 2 };
}

function computeStats(turns: Turn[]) {
  const sellerSec = turns
    .filter((t) => t.speaker === "seller")
    .reduce((a, t) => a + t.duration_estimate, 0);
  const clientSec = turns
    .filter((t) => t.speaker === "client")
    .reduce((a, t) => a + t.duration_estimate, 0);
  const total = sellerSec + clientSec || 1;

  let longestSeller = 0;
  for (const t of turns) {
    if (t.speaker === "seller" && t.duration_estimate > longestSeller) {
      longestSeller = t.duration_estimate;
    }
  }

  let interruptions = 0;
  for (let i = 1; i < turns.length; i++) {
    const prev = turns[i - 1];
    const cur = turns[i];
    if (prev.speaker !== cur.speaker && prev.word_count < 4) interruptions++;
  }

  return {
    talk_ratio_seller: Math.round((sellerSec / total) * 1000) / 10,
    talk_ratio_client: Math.round((clientSec / total) * 1000) / 10,
    longest_monologue_sec: longestSeller,
    interruptions_count: interruptions,
    turns_count: turns.length,
  };
}

async function aiReclassify(
  transcript: string,
  apiKey: string,
): Promise<Turn[] | null> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "Você recebe a transcrição de uma chamada de vendas em PT-BR. Identifique os turnos de fala e quem falou (vendedor ou cliente). Use a ferramenta diarize.",
        },
        { role: "user", content: transcript.slice(0, 12000) },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "diarize",
            description: "Retorna os turnos identificados",
            parameters: {
              type: "object",
              properties: {
                turns: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      speaker: { type: "string", enum: ["seller", "client"] },
                      text: { type: "string" },
                    },
                    required: ["speaker", "text"],
                  },
                },
              },
              required: ["turns"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "diarize" } },
    }),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  const argsStr = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!argsStr) return null;
  try {
    const parsed = JSON.parse(argsStr);
    return Array.isArray(parsed?.turns) ? parsed.turns : null;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await userClient.auth.getClaims(token);
    if (authErr || !claims?.claims?.sub) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const recording_id = body?.recording_id as string | undefined;
    if (!recording_id) return json({ error: "recording_id is required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: rec, error: recErr } = await admin
      .from("call_recordings")
      .select("id, transcript, duration_seconds, status")
      .eq("id", recording_id)
      .maybeSingle();
    if (recErr || !rec) return json({ error: "Recording not found" }, 404);
    if (!rec.transcript) return json({ error: "Recording has no transcript" }, 400);

    const totalDur = Number(rec.duration_seconds) || 0;
    let { turns, hasLabels } = parseTranscript(rec.transcript, totalDur);

    if (!hasLabels && LOVABLE_API_KEY) {
      const aiTurns = await aiReclassify(rec.transcript, LOVABLE_API_KEY);
      if (aiTurns && aiTurns.length > 0) {
        const totalWords = aiTurns.reduce(
          (a, t) => a + t.text.split(/\s+/).filter(Boolean).length,
          0,
        ) || 1;
        let cursor = 0;
        turns = aiTurns.map((t) => {
          const wc = t.text.split(/\s+/).filter(Boolean).length;
          const dur = (wc / totalWords) * Math.max(totalDur, 1);
          const start = cursor;
          cursor += dur;
          return {
            speaker: t.speaker as "seller" | "client",
            text: t.text,
            word_count: wc,
            start_estimate: Math.round(start),
            duration_estimate: Math.round(dur),
          };
        });
      }
    }

    const stats = computeStats(turns);

    const { error: rpcErr } = await admin.rpc("update_call_recording_diarization", {
      _id: recording_id,
      _diarization: turns as unknown as Record<string, unknown>,
      _talk_ratio_seller: stats.talk_ratio_seller,
      _talk_ratio_client: stats.talk_ratio_client,
      _longest_monologue_sec: stats.longest_monologue_sec,
      _interruptions_count: stats.interruptions_count,
      _turns_count: stats.turns_count,
    });
    if (rpcErr) return json({ error: rpcErr.message }, 500);

    return json({ recording_id, ...stats, turns_count: turns.length });
  } catch (e) {
    console.error("diarize-call-recording fatal:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
