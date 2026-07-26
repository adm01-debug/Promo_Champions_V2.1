// SEC-08 — helper de client autenticado para edge functions.
//
// Objetivo: reduzir o uso desnecessário de `SUPABASE_SERVICE_ROLE_KEY` em
// edge functions que só precisam operar em nome do usuário chamador. Enforça
// as RLS policies como se fosse uma chamada do frontend.
//
// Regra de bolso:
//   • Precisa executar em nome do usuário (RLS aplicada) → use `getUserClient`.
//   • Precisa bypassar RLS (jobs pg_cron, replay administrativo, escrever
//     em tabelas de auditoria que o usuário não pode escrever direto) →
//     use `getServiceClient` e DOCUMENTE o motivo com um comentário.
//   • Nunca combine os dois na mesma função sem separação clara de escopo.

import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";

export interface AuthenticatedContext {
  client: SupabaseClient;
  userId: string;
  email: string | null;
  authHeader: string;
}

export class UnauthorizedError extends Error {
  constructor(message = "unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Valida o JWT do request e retorna um client escopado ao usuário.
 * Todas as queries respeitarão RLS.
 */
export async function getUserClient(req: Request): Promise<AuthenticatedContext> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new UnauthorizedError("missing_bearer_token");
  }

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anon) throw new Error("SUPABASE_URL/SUPABASE_ANON_KEY not configured");

  const client = createClient(url, anon, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await client.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new UnauthorizedError("invalid_or_expired_token");
  }

  return {
    client,
    userId: data.claims.sub,
    email: (data.claims.email as string) ?? null,
    authHeader,
  };
}

/**
 * Client com service_role. USE APENAS quando o fluxo precisa bypass de RLS
 * legítimo (jobs administrativos, dedupe, escrita em auditoria).
 *
 * @param reason — string curta descrevendo por que o bypass é necessário.
 *                 Usado apenas como documentação inline; não é enviado.
 */
export function getServiceClient(reason: string): SupabaseClient {
  if (!reason || reason.length < 10) {
    // Guard-rail: força o dev a explicar por que precisa de service_role.
    throw new Error("getServiceClient requires a non-trivial reason for the RLS bypass");
  }
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Helper para verificar role admin server-side sem uma nova query.
 * Usa has_role_name (param TEXT) — converte para app_role internamente.
 */
export async function requireAdmin(ctx: AuthenticatedContext): Promise<void> {
  const { data, error } = await ctx.client.rpc("has_role_name", {
    p_user_id: ctx.userId,
    p_role_name: "admin",
  });
  if (error) throw new UnauthorizedError(`role_check_failed:${error.message}`);
  if (!data) throw new UnauthorizedError("admin_role_required");
}
