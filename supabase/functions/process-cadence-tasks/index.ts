import { corsHeaders } from "../_shared/cors.ts";

import { createClient } from "npm:@supabase/supabase-js@2.49.4";



Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const today = new Date().toISOString().split("T")[0];

    // 1. Buscar tarefas automáticas pendentes para hoje ou atrasadas
    const { data: tasks, error: tasksErr } = await supabase
      .from("cadence_tasks")
      .select(`
        *,
        cadence_step:cadence_steps(*),
        prospect_cadence:prospect_cadences(
          *,
          sale:sales(*, client:clients(*))
        )
      `)
      .eq("status", "pending")
      .eq("task_type", "automatic")
      .lte("scheduled_date", today)
      .limit(20);

    if (tasksErr) throw tasksErr;

    const results = [];

    for (const task of tasks || []) {
      const step = task.cadence_step;
      const sale = task.prospect_cadence?.sale;
      const client = sale?.client;

      if (!client || !step) {
        results.push({ task_id: task.id, status: "error", error: "Missing client or step info" });
        continue;
      }

      try {
        let sent = false;
        let error = null;

        // 2. Executar ação baseada no tipo
        if (step.action_type === "email") {
          const { error: emailErr } = await supabase.functions.invoke("email-bulk-send", {
            body: {
              to: client.email,
              subject: step.title,
              body: step.template_content,
              sale_id: sale.id
            }
          });
          if (!emailErr) sent = true;
          else error = emailErr;
        } else if (step.action_type === "whatsapp" && client.phone) {
          const { error: waErr } = await supabase.functions.invoke("send-multichannel-message", {
            body: {
              channel: "whatsapp",
              to: client.phone,
              body: step.template_content,
              saleId: sale.id
            }
          });
          if (!waErr) sent = true;
          else error = waErr;
        }

        if (sent) {
          // 3. Atualizar tarefa para concluída
          await supabase
            .from("cadence_tasks")
            .update({ 
              status: "completed", 
              completed_at: new Date().toISOString(),
              notes: "Executado automaticamente pelo motor de cadência."
            })
            .eq("id", task.id);
          
          results.push({ task_id: task.id, status: "success" });
        } else {
          results.push({ task_id: task.id, status: "failed", error: error?.message || "Send failed" });
        }
      } catch (e) {
        results.push({ task_id: task.id, status: "error", error: e.message });
      }
    }

    return new Response(
      JSON.stringify({ ok: true, processed: tasks?.length || 0, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
