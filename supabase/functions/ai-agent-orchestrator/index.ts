import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const MAX_STEPS = 10;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_entity_details",
      description: "Fetch full details of a lead, client, or deal by id.",
      parameters: {
        type: "object",
        properties: {
          entity_type: { type: "string", enum: ["lead", "client", "deal"] },
          entity_id: { type: "string" },
        },
        required: ["entity_type", "entity_id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_note",
      description: "Append a textual note to the current target entity.",
      parameters: {
        type: "object",
        properties: { note: { type: "string" } },
        required: ["note"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "schedule_followup",
      description: "Schedule a follow-up agenda event for the salesperson.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          scheduled_at: { type: "string", description: "ISO datetime" },
          description: { type: "string" },
        },
        required: ["title", "scheduled_at"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compose_email_draft",
      description: "Draft an email (subject + body). Does not send.",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string" },
          body: { type: "string" },
          rationale: { type: "string" },
        },
        required: ["subject", "body"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_lead_score",
      description: "Set/update the score of the current lead (0-100).",
      parameters: {
        type: "object",
        properties: { score: { type: "number" }, reason: { type: "string" } },
        required: ["score"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "finish",
      description: "Finish the agent run with a final summary.",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string" },
          recommended_actions: { type: "array", items: { type: "string" } },
        },
        required: ["summary"],
        additionalProperties: false,
      },
    },
  },
];

const SYSTEM_PROMPT = `Você é um agente de vendas autônomo do CRM Promo Champions.
Receberá um objetivo e o contexto de uma entidade (lead/cliente/deal).
Use as ferramentas disponíveis para investigar e propor/executar ações.
Regras:
- Faça no máximo 8 passos antes de chamar finish.
- Mutações (add_note, schedule_followup, update_lead_score, compose_email_draft) são propostas para revisão humana quando requires_approval=true.
- Sempre termine chamando "finish" com um resumo executivo em PT-BR.`;

async function callAI(messages: unknown[], tools: unknown[]) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, tools, tool_choice: "auto" }),
  });
  if (r.status === 429) throw new Error("RATE_LIMIT");
  if (r.status === 402) throw new Error("PAYMENT_REQUIRED");
  if (!r.ok) throw new Error(`AI gateway: ${r.status} ${await r.text()}`);
  return await r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (!claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { agent_type, target_entity_type, target_entity_id, goal, auto_execute = false } =
      await req.json();

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const requires_approval = !auto_execute;

    // Create run via user client (so RLS context applies via SECURITY DEFINER RPC)
    const { data: runId, error: createErr } = await userClient.rpc("create_agent_run", {
      _agent_type: agent_type,
      _goal: goal ?? null,
      _target_entity_type: target_entity_type ?? null,
      _target_entity_id: target_entity_id ?? null,
      _requires_approval: requires_approval,
    });
    if (createErr || !runId) throw new Error(createErr?.message || "Failed to create run");

    // Fetch initial context
    let context: Record<string, unknown> = {};
    if (target_entity_type && target_entity_id) {
      const table =
        target_entity_type === "lead"
          ? "leads"
          : target_entity_type === "client"
          ? "clients"
          : target_entity_type === "deal"
          ? "sales"
          : null;
      if (table) {
        const { data } = await admin.from(table).select("*").eq("id", target_entity_id).maybeSingle();
        context = data ?? {};
      }
    }

    const messages: unknown[] = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Objetivo: ${goal || agent_type}\nTipo do agente: ${agent_type}\nAlvo (${target_entity_type}): ${JSON.stringify(context).slice(0, 4000)}\nrequires_approval=${requires_approval}`,
      },
    ];

    let finished = false;
    let finalResult: Record<string, unknown> = {};
    let stepCount = 0;

    while (!finished && stepCount < MAX_STEPS) {
      stepCount++;
      const ai = await callAI(messages, TOOLS);
      const choice = ai.choices?.[0]?.message;
      if (!choice) break;

      messages.push(choice);
      const calls = choice.tool_calls || [];
      if (calls.length === 0) {
        finalResult = { summary: choice.content || "Sem resposta." };
        finished = true;
        break;
      }

      for (const call of calls) {
        const name = call.function?.name as string;
        let args: Record<string, unknown> = {};
        try { args = JSON.parse(call.function?.arguments || "{}"); } catch { /* ignore */ }

        let toolOutput: Record<string, unknown> = {};
        let status: "success" | "pending_approval" | "error" = "success";

        try {
          if (name === "get_entity_details") {
            const tbl = args.entity_type === "lead" ? "leads" : args.entity_type === "client" ? "clients" : "sales";
            const { data } = await admin.from(tbl).select("*").eq("id", args.entity_id).maybeSingle();
            toolOutput = { entity: data };
          } else if (name === "finish") {
            finalResult = args;
            finished = true;
            toolOutput = { ok: true };
          } else {
            // Mutating tool
            if (requires_approval) {
              status = "pending_approval";
              toolOutput = { proposed: args, note: "Aguardando aprovação humana." };
            } else {
              if (name === "add_note" && target_entity_id) {
                await admin.from("activities").insert({
                  activity_type: "note",
                  outcome: "neutral",
                  notes: args.note,
                  salesperson_id: claims.claims.sub,
                });
                toolOutput = { executed: true };
              } else if (name === "schedule_followup") {
                await admin.from("agenda_events").insert({
                  salesperson_id: claims.claims.sub,
                  title: args.title,
                  scheduled_at: args.scheduled_at,
                  description: args.description ?? null,
                  event_type: "followup",
                });
                toolOutput = { executed: true };
              } else if (name === "update_lead_score" && target_entity_type === "lead" && target_entity_id) {
                await admin.from("leads").update({ score: args.score }).eq("id", target_entity_id);
                toolOutput = { executed: true };
              } else {
                toolOutput = { executed: false, reason: "Tool not directly executable, treated as proposal." };
                status = "pending_approval";
              }
            }
          }
        } catch (e) {
          status = "error";
          toolOutput = { error: e instanceof Error ? e.message : "Unknown" };
        }

        await admin.rpc("append_agent_step", {
          _run_id: runId,
          _tool_name: name,
          _tool_input: args,
          _tool_output: toolOutput,
          _status: status,
          _executed_by: "ai",
        });

        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(toolOutput).slice(0, 3000),
        });
      }
    }

    const finalStatus = requires_approval && !finished
      ? "awaiting_approval"
      : finished
      ? "completed"
      : "failed";

    await admin.rpc("complete_agent_run", {
      _run_id: runId,
      _result: finalResult,
      _status: finalStatus,
      _error: null,
    });

    return new Response(JSON.stringify({ run_id: runId, status: finalStatus, result: finalResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown";
    const status = msg === "RATE_LIMIT" ? 429 : msg === "PAYMENT_REQUIRED" ? 402 : 500;
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
