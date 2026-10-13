// SEC — resolução de credenciais de provedores via integration_secret_refs.
//
// channel_credentials.credentials (jsonb) guardava tokens em texto puro.
// Agora cada campo sensível pode apontar para uma fonte de segredo:
//   • 'env:<VAR>'      → Deno.env.get(VAR)  (secret da edge function)
//   • 'internal:<key>' → public._internal_secrets.key (RLS deny-all; exige
//     client service_role — o mesmo padrão dos crons internos)
//
// `resolveChannelCredentials` mescla o jsonb legado com os refs resolvidos
// (ref tem precedência), então credenciais antigas seguem funcionando até
// serem migradas. Campos não sensíveis (agent_phone, phone_number_id…)
// também podem virar ref — a resolução é por chave.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.49.4";

interface SecretRefRow {
  key: string;
  secret_ref: string;
}

async function resolveInternalKey(
  supabase: SupabaseClient,
  key: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("_internal_secrets")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return (data?.value as string) ?? null;
}

/**
 * Resolve os refs de uma credencial; falha de lookup propaga como erro.
 * `ownerId` restringe os refs aos do dono da credencial — mesmo que um ref
 * de outro dono aponte para esta credential_id, ele nunca é aplicado
 * (escrita na tabela já exige admin/manager; aqui é defesa em profundidade).
 */
export async function resolveSecretRefs(
  supabase: SupabaseClient,
  credentialId: string,
  ownerId?: string | null,
): Promise<Record<string, string>> {
  const query = supabase
    .from("integration_secret_refs")
    .select("key, secret_ref")
    .eq("credential_id", credentialId);
  if (ownerId === null) query.is("owner_id", null);
  else if (ownerId) query.eq("owner_id", ownerId);
  const { data, error } = await query;
  if (error) throw error;

  const resolved: Record<string, string> = {};
  for (const row of (data ?? []) as SecretRefRow[]) {
    const [scheme, name] = row.secret_ref.split(":", 2);
    if (scheme === "env") {
      const value = Deno.env.get(name);
      if (value) resolved[row.key] = value;
    } else if (scheme === "internal") {
      const value = await resolveInternalKey(supabase, name);
      if (value) resolved[row.key] = value;
    }
  }
  return resolved;
}

/**
 * Credenciais efetivas de uma linha de channel_credentials: jsonb legado +
 * refs resolvidos (ref vence). `credential` precisa ter `id` e `credentials`;
 * selecione também `owner_id` para que os refs fiquem limitados ao dono.
 */
export async function resolveChannelCredentials(
  supabase: SupabaseClient,
  credential: { id: string; credentials: unknown; owner_id?: string | null },
): Promise<Record<string, string>> {
  const base =
    credential.credentials && typeof credential.credentials === "object" &&
      !Array.isArray(credential.credentials)
      ? (credential.credentials as Record<string, string>)
      : {};
  const refs = await resolveSecretRefs(
    supabase,
    credential.id,
    credential.owner_id,
  );
  return { ...base, ...refs };
}
