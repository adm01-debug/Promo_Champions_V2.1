import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface Payload {
  to_number: string;
  sale_id?: string;
  queue_item_id?: string;
  from_number?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const ownerId = userData.user.id;

    const body = (await req.json()) as Payload;
    if (!body.to_number) {
      return new Response(JSON.stringify({ error: "to_number required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load Twilio credentials for owner
    const { data: cred } = await admin
      .from("channel_credentials")
      .select("*")
      .eq("owner_id", ownerId)
      .eq("provider", "twilio")
      .eq("enabled", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!cred) {
      return new Response(
        JSON.stringify({ error: "Twilio não configurado. Conecte em Multichannel." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const creds = cred.credentials as Record<string, string>;
    const accountSid = creds.account_sid;
    const authToken = creds.auth_token;
    if (!accountSid || !authToken) {
      return new Response(JSON.stringify({ error: "Credenciais Twilio incompletas" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromNumber = body.from_number || cred.from_number;
    if (!fromNumber) {
      return new Response(JSON.stringify({ error: "from_number ausente" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
    const twimlUrl = `${supabaseUrl}/functions/v1/twilio-call-twiml?owner_id=${ownerId}`;
    const statusUrl = `${supabaseUrl}/functions/v1/twilio-call-status`;

    const params = new URLSearchParams({
      To: body.to_number,
      From: fromNumber,
      Url: twimlUrl,
      StatusCallback: statusUrl,
      StatusCallbackEvent: "initiated ringing answered completed",
      StatusCallbackMethod: "POST",
      Record: "true",
    });

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    const twilioData = await twilioRes.json();
    if (!twilioRes.ok) {
      return new Response(
        JSON.stringify({ error: twilioData.message || "Twilio error", details: twilioData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const callSid = twilioData.sid as string;

    const { data: session, error: insErr } = await admin
      .from("twilio_call_sessions")
      .insert({
        owner_id: ownerId,
        sale_id: body.sale_id ?? null,
        queue_item_id: body.queue_item_id ?? null,
        call_sid: callSid,
        from_number: fromNumber,
        to_number: body.to_number,
        status: "initiated",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insErr) {
      console.error("Insert error:", insErr);
    }

    return new Response(
      JSON.stringify({ ok: true, call_sid: callSid, session_id: session?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("twilio-click-to-call error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
