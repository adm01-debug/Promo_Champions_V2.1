import { getCorsHeaders } from "../_shared/cors.ts";
import { withRequestId } from "../_shared/request-id.ts";
import {
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from "../_shared/auth-client.ts";

Deno.serve(
  withRequestId("collect-race-powerup", async (req, _ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }

    try {
      let caller;
      try {
        caller = await getUserClient(req);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw error;
      }

      const { powerup_id } = await req.json();
      if (!powerup_id) {
        return new Response(JSON.stringify({ error: "Missing powerup_id" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Bypass de RLS necessário: grava race_events/race_badges que o usuário
      // não escreve diretamente; posse do power-up é validada abaixo.
      const admin = getServiceClient(
        "grava race_events e race_badges apos validar posse do power-up",
      );

      // resolve salesperson do usuário
      const { data: sp } = await admin
        .from("salespeople")
        .select("id")
        .eq("auth_user_id", caller.userId)
        .maybeSingle();
      if (!sp) {
        return new Response(
          JSON.stringify({ error: "Salesperson not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // busca powerup
      const { data: pu, error: puErr } = await admin
        .from("race_powerups")
        .select(
          "id, salesperson_id, season_id, powerup_type, used_at, effect_data",
        )
        .eq("id", powerup_id)
        .maybeSingle();
      if (puErr || !pu) {
        return new Response(JSON.stringify({ error: "Power-up not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (pu.salesperson_id !== sp.id) {
        return new Response(JSON.stringify({ error: "Not your power-up" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (pu.used_at) {
        return new Response(JSON.stringify({ error: "Already collected" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // valida posição: progresso do vendedor precisa ter passado pela posição
      const positionPct = Number(
        (pu.effect_data as Record<string, unknown>)?.position_pct ?? 0,
      );
      const { data: lb } = await admin
        .from("race_leaderboard_view")
        .select("progress")
        .eq("season_id", pu.season_id)
        .eq("salesperson_id", sp.id)
        .maybeSingle();
      const progress = Number(lb?.progress ?? 0);
      if (progress < positionPct) {
        return new Response(
          JSON.stringify({ error: "Not yet reached", progress, positionPct }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      // marca como coletado
      await admin
        .from("race_powerups")
        .update({ used_at: new Date().toISOString() })
        .eq("id", powerup_id);

      // insere evento
      await admin.from("race_events").insert({
        season_id: pu.season_id,
        salesperson_id: sp.id,
        event_type: "powerup",
        payload: { powerup_type: pu.powerup_type, position_pct: positionPct },
      });

      // badge: 3 power-ups coletados na season → "powerup_collector"
      const { count } = await admin
        .from("race_powerups")
        .select("id", { count: "exact", head: true })
        .eq("season_id", pu.season_id)
        .eq("salesperson_id", sp.id)
        .not("used_at", "is", null);
      if ((count ?? 0) >= 3) {
        await admin.from("race_badges").upsert(
          {
            salesperson_id: sp.id,
            badge_code: "powerup_collector",
            season_id: pu.season_id,
          },
          {
            onConflict: "salesperson_id,badge_code,season_id",
            ignoreDuplicates: true,
          },
        );
      }

      return new Response(
        JSON.stringify({
          ok: true,
          powerup_type: pu.powerup_type,
          badge_unlocked: (count ?? 0) >= 3,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (err) {
      console.error("collect-race-powerup error", err);
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }),
);
