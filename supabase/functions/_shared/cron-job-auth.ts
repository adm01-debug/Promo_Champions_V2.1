import { isInternalServiceRequest } from "./internal-service-auth.ts";
import { isAuthorizedCronRequest } from "./cron-request-auth.ts";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";

/**
 * Autoriza um job interno disparado pelo pg_cron ou por outra function.
 * Aceita Authorization: Bearer <service_role> (chamadas internas) ou o
 * X-Cron-Secret compartilhado enviado por public.trigger_internal_edge_job.
 * O segredo esperado é lido de _internal_secrets.coaching_cron_secret com o
 * client de serviço recebido — nunca de variável de ambiente.
 */
export function isAuthorizedCronJob(
  req: Request,
  // deno-lint-ignore no-explicit-any -- clientes Supabase têm generics variados por function
  admin: SupabaseClient<any, any, any>,
): Promise<boolean> {
  if (isInternalServiceRequest(req)) return Promise.resolve(true);
  return isAuthorizedCronRequest(req, async () => {
    const { data, error } = await admin
      .from("_internal_secrets")
      .select("value")
      .eq("key", "coaching_cron_secret")
      .maybeSingle();
    if (error) throw error;
    return (data as { value?: string | null } | null)?.value;
  });
}
