import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const testUsers = [
      { email: "admin@teste.com", password: "Admin@12345", name: "Admin Teste", role: "admin", spRole: "hybrid" },
      { email: "closer@teste.com", password: "Closer@12345", name: "Closer Teste", role: "salesperson", spRole: "closer" },
      { email: "sdr@teste.com", password: "Sdr@12345", name: "SDR Teste", role: "salesperson", spRole: "sdr" },
    ];

    const results = [];

    for (const u of testUsers) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { name: u.name },
      });

      if (authError) {
        // If user exists, try to get them
        if (authError.message?.includes("already been registered")) {
          const { data: { users } } = await supabase.auth.admin.listUsers();
          const existing = users?.find((x: any) => x.email === u.email);
          if (existing) {
            results.push({ email: u.email, status: "already exists", userId: existing.id });
            // Ensure role is set
            await supabase.from("user_roles").upsert(
              { user_id: existing.id, role: u.role },
              { onConflict: "user_id,role" }
            );
          }
          continue;
        }
        results.push({ email: u.email, status: "error", error: authError.message });
        continue;
      }

      const userId = authData.user!.id;

      // Create salesperson
      const { error: spError } = await supabase.from("salespeople").insert({
        name: u.name,
        email: u.email,
        auth_user_id: userId,
        is_active: true,
        role: u.spRole,
      });

      // Set user role (trigger should create 'salesperson' by default, update if needed)
      if (u.role !== "salesperson") {
        await supabase.from("user_roles").update({ role: u.role }).eq("user_id", userId);
      }

      results.push({ email: u.email, password: u.password, status: "created", userId, role: u.role, spRole: u.spRole });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
