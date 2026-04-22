import { createClient } from "npm:@supabase/supabase-js@2.49.4";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const ownerId = url.searchParams.get("owner_id");

  let agentPhone: string | null = null;
  if (ownerId) {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data } = await admin
      .from("channel_credentials")
      .select("credentials, from_number")
      .eq("owner_id", ownerId)
      .eq("provider", "twilio")
      .eq("enabled", true)
      .limit(1)
      .maybeSingle();
    const creds = (data?.credentials ?? {}) as Record<string, string>;
    agentPhone = creds.agent_phone || null;
  }

  const twiml = agentPhone
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Dial record="record-from-answer" timeout="30">${agentPhone}</Dial></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="alice" language="pt-BR">Conectando você ao vendedor.</Say><Pause length="60"/></Response>`;

  return new Response(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
});
