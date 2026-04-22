import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

async function validateToken(token: string) {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  
  const { data, error } = await supabase.rpc("validate_api_token", { p_token: token });
  if (error || !data || data.length === 0) return null;
  return data[0];
}

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const headers = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const token = req.headers.get("authorization");
    if (!token) {
      return new Response(JSON.stringify({ error: "Token de autenticação ausente" }), { status: 403, headers });
    }

    const tokenData = await validateToken(token);
    if (!tokenData) {
      return new Response(JSON.stringify({ error: "Token inválido ou expirado" }), { status: 403, headers });
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // Path after /ranking-api/v2/...
    const route = pathParts.slice(pathParts.indexOf("v2") + 1).join("/");
    
    const supabase = getServiceClient();

    // ===== USER ROUTES =====
    if (req.method === "GET" && route === "users") {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, email, avatar_url, role, score_total, is_active")
        .eq("is_active", true);
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      return new Response(JSON.stringify({ data }), { status: 200, headers });
    }

    if (req.method === "GET" && route.startsWith("user/") && !route.includes("create") && !route.includes("edit")) {
      const userId = route.split("/")[1];
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, email, avatar_url, role, score_total, is_active")
        .eq("id", userId)
        .maybeSingle();
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      if (!data) return new Response(JSON.stringify({ error: "Usuário não encontrado" }), { status: 404, headers });
      return new Response(JSON.stringify({ data }), { status: 200, headers });
    }

    if (req.method === "POST" && route === "user/create") {
      const body = await req.json();
      const { name, email } = body;
      if (!name || !email) {
        return new Response(JSON.stringify({ error: "Campos 'name' e 'email' são obrigatórios" }), { status: 400, headers });
      }

      // Check existing
      const { data: existing } = await supabase.from("salespeople").select("id").eq("email", email).maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ error: "Usuário com este email já existe" }), { status: 409, headers });
      }

      const { data, error } = await supabase.from("salespeople").insert({
        name,
        email,
        role: body.role || "hybrid",
        is_active: true,
      }).select("id, name, email, role").single();

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      return new Response(JSON.stringify({ data, message: "Usuário criado com sucesso" }), { status: 200, headers });
    }

    // ===== TEAM ROUTES =====
    if (req.method === "GET" && route === "team") {
      if (!tokenData.team_id) {
        return new Response(JSON.stringify({ error: "Token não vinculado a um time" }), { status: 400, headers });
      }
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, description, created_at")
        .eq("id", tokenData.team_id)
        .maybeSingle();
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      return new Response(JSON.stringify({ data }), { status: 200, headers });
    }

    if (req.method === "GET" && route === "team/users") {
      if (!tokenData.team_id) {
        return new Response(JSON.stringify({ error: "Token não vinculado a um time" }), { status: 400, headers });
      }
      const { data, error } = await supabase
        .from("team_members")
        .select("salesperson_id, role, salespeople(id, name, email, avatar_url, score_total)")
        .eq("team_id", tokenData.team_id);
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      return new Response(JSON.stringify({ data }), { status: 200, headers });
    }

    if (req.method === "GET" && route === "team/logs") {
      if (!tokenData.team_id) {
        return new Response(JSON.stringify({ error: "Token não vinculado a um time" }), { status: 400, headers });
      }
      const { data, error } = await supabase
        .from("score_change_logs")
        .select("id, salesperson_id, changed_by, operation, field_name, old_value, new_value, change_value, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      return new Response(JSON.stringify({ data }), { status: 200, headers });
    }

    if (req.method === "GET" && route === "team/addfields") {
      if (!tokenData.team_id) {
        return new Response(JSON.stringify({ error: "Token não vinculado a um time" }), { status: 400, headers });
      }
      const { data, error } = await supabase
        .from("team_custom_fields")
        .select("id, field_key, field_label, field_type, is_active")
        .eq("team_id", tokenData.team_id)
        .eq("is_active", true);
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      return new Response(JSON.stringify({ data }), { status: 200, headers });
    }

    // ===== SCORE EDIT ROUTES =====
    if (req.method === "PUT" && route === "team/user/edit/total") {
      const body = await req.json();
      const { email, type, value, set_value } = body;

      if (!email || !type || value === undefined) {
        return new Response(JSON.stringify({ error: "Campos 'email', 'type' e 'value' são obrigatórios" }), { status: 400, headers });
      }

      if (!["ADD", "REM", "SET"].includes(type)) {
        return new Response(JSON.stringify({ error: "Tipo deve ser ADD, REM ou SET" }), { status: 400, headers });
      }

      const numValue = Number(value);
      if (isNaN(numValue)) {
        return new Response(JSON.stringify({ error: "Valor deve ser numérico" }), { status: 400, headers });
      }

      const { data: user, error: userErr } = await supabase
        .from("salespeople")
        .select("id, score_total")
        .eq("email", email)
        .maybeSingle();

      if (userErr || !user) {
        return new Response(JSON.stringify({ error: "Usuário não encontrado" }), { status: 404, headers });
      }

      const oldScore = Number(user.score_total) || 0;
      let newScore: number;

      if (set_value || type === "SET") {
        newScore = numValue;
      } else if (type === "ADD") {
        newScore = oldScore + numValue;
      } else {
        newScore = Math.max(0, oldScore - numValue);
      }

      const { error: updateErr } = await supabase
        .from("salespeople")
        .update({ score_total: newScore })
        .eq("id", user.id);

      if (updateErr) {
        return new Response(JSON.stringify({ error: updateErr.message }), { status: 400, headers });
      }

      // Log the change
      await supabase.from("score_change_logs").insert({
        salesperson_id: user.id,
        changed_by: "api",
        operation: type,
        field_name: "total",
        old_value: oldScore,
        new_value: newScore,
        change_value: numValue,
        api_token_id: tokenData.token_id,
      });

      return new Response(JSON.stringify({
        data: { email, old_score: oldScore, new_score: newScore, operation: type },
        message: "Pontuação atualizada com sucesso"
      }), { status: 200, headers });
    }

    if (req.method === "PUT" && route.startsWith("team/user/edit/addfield/")) {
      const userId = route.split("/").pop();
      const body = await req.json();
      const { fieldid, value, set_points } = body;

      if (!fieldid || value === undefined) {
        return new Response(JSON.stringify({ error: "Campos 'fieldid' e 'value' são obrigatórios" }), { status: 400, headers });
      }

      // Get current value
      const { data: currentVal } = await supabase
        .from("salesperson_custom_field_values")
        .select("id, numeric_value")
        .eq("salesperson_id", userId)
        .eq("field_id", fieldid)
        .maybeSingle();

      const oldValue = currentVal?.numeric_value || 0;
      const newValue = set_points ? Number(value) : oldValue + Number(value);

      const { error } = await supabase
        .from("salesperson_custom_field_values")
        .upsert({
          salesperson_id: userId,
          field_id: fieldid,
          numeric_value: newValue,
          updated_at: new Date().toISOString(),
        }, { onConflict: "salesperson_id,field_id" });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      }

      // Log
      await supabase.from("score_change_logs").insert({
        salesperson_id: userId,
        changed_by: "api",
        operation: set_points ? "SET" : "ADD",
        field_name: fieldid,
        old_value: oldValue,
        new_value: newValue,
        change_value: Number(value),
        api_token_id: tokenData.token_id,
      });

      return new Response(JSON.stringify({
        data: { user_id: userId, field_id: fieldid, old_value: oldValue, new_value: newValue },
        message: "Campo adicional atualizado"
      }), { status: 200, headers });
    }

    // ===== COMPANY ROUTES =====
    if (req.method === "GET" && route === "company") {
      return new Response(JSON.stringify({
        data: {
          name: tokenData.company_name,
          token_id: tokenData.token_id,
        }
      }), { status: 200, headers });
    }

    if (req.method === "GET" && route === "company/users") {
      const { data, error } = await supabase
        .from("salespeople")
        .select("id, name, email, avatar_url, role, score_total, is_active")
        .order("name");
      
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
      return new Response(JSON.stringify({ data }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: `Rota não encontrada: ${route}` }), { status: 404, headers });

  } catch (err) {
    console.error("Ranking API error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers });
  }
});
