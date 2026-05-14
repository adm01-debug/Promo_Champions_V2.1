import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";



Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "LOVABLE_API_KEY not configured" }, 500);

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

    // Buscar gravação
    const { data: rec, error: recErr } = await admin
      .from("call_recordings")
      .select("id, salesperson_id, audio_url, status")
      .eq("id", recording_id)
      .maybeSingle();
    if (recErr || !rec) return json({ error: "Recording not found" }, 404);
    if (!rec.audio_url) return json({ error: "Recording has no audio file" }, 400);

    // Marca transcribing
    await admin
      .from("call_recordings")
      .update({ status: "transcribing", transcription_error: null, updated_at: new Date().toISOString() })
      .eq("id", recording_id);

    // Signed URL
    const { data: signed, error: signErr } = await admin.storage
      .from("call-recordings")
      .createSignedUrl(rec.audio_url, 60 * 10);
    if (signErr || !signed?.signedUrl) {
      await admin.rpc("update_call_recording_transcript", {
        _id: recording_id,
        _transcript: "",
        _language: "pt",
        _error: `Failed to create signed URL: ${signErr?.message ?? "unknown"}`,
      });
      return json({ error: "Failed to access audio file" }, 500);
    }

    // Baixa áudio e converte para base64
    const audioResp = await fetch(signed.signedUrl);
    if (!audioResp.ok) {
      const msg = `Failed to download audio (${audioResp.status})`;
      await admin.rpc("update_call_recording_transcript", {
        _id: recording_id, _transcript: "", _language: "pt", _error: msg,
      });
      return json({ error: msg }, 500);
    }
    const audioBuf = await audioResp.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuf);
    const mimeType = audioResp.headers.get("content-type") || "audio/mpeg";

    // Base64 em chunks (evita stack overflow com arquivos grandes)
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < audioBytes.length; i += chunk) {
      binary += String.fromCharCode(...audioBytes.subarray(i, i + chunk));
    }
    const base64Audio = btoa(binary);

    // Lovable AI Gateway — Gemini multimodal
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Você é um transcritor profissional de chamadas de vendas em PT-BR. " +
              "Transcreva o áudio integralmente, identificando turnos como 'Vendedor:' e 'Cliente:' quando possível. " +
              "Retorne APENAS o texto da transcrição, sem comentários adicionais.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Transcreva esta chamada de vendas em PT-BR." },
              {
                type: "input_audio",
                input_audio: { data: base64Audio, format: mimeType.includes("wav") ? "wav" : "mp3" },
              },
            ],
          },
        ],
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      let userMsg = `AI gateway error (${aiResp.status})`;
      if (aiResp.status === 429) userMsg = "Limite de requisições da IA excedido. Tente em alguns minutos.";
      if (aiResp.status === 402) userMsg = "Créditos da IA esgotados. Adicione fundos no workspace.";
      console.error("AI error:", aiResp.status, errText);
      await admin.rpc("update_call_recording_transcript", {
        _id: recording_id, _transcript: "", _language: "pt", _error: userMsg,
      });
      return json({ error: userMsg }, aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 500);
    }

    const aiData = await aiResp.json();
    const transcript: string = aiData?.choices?.[0]?.message?.content?.trim() ?? "";
    if (!transcript) {
      await admin.rpc("update_call_recording_transcript", {
        _id: recording_id, _transcript: "", _language: "pt", _error: "Transcrição vazia retornada pela IA",
      });
      return json({ error: "Empty transcript" }, 500);
    }

    await admin.rpc("update_call_recording_transcript", {
      _id: recording_id,
      _transcript: transcript,
      _language: "pt",
      _error: null,
    });

    return json({ recording_id, transcript_length: transcript.length, status: "transcribed" });
  } catch (e) {
    console.error("transcribe-call-recording fatal:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
