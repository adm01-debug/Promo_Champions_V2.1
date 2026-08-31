/**
 * Reconhece chamadas internas feitas por outra Edge Function usando a
 * service_role. Não substitui a autenticação de usuário: só deve ser usada
 * em jobs/encadeamentos sem um JWT de usuário para propagar.
 */
export function isExpectedServiceRoleAuthorization(
  authorization: string | null,
  serviceRoleKey: string | undefined,
): boolean {
  const prefix = "Bearer ";
  if (!serviceRoleKey || !authorization?.startsWith(prefix)) return false;

  const expected = new TextEncoder().encode(serviceRoleKey);
  const received = new TextEncoder().encode(authorization.slice(prefix.length));
  const length = Math.max(expected.length, received.length);
  let difference = expected.length ^ received.length;

  for (let index = 0; index < length; index++) {
    difference |= (expected[index] ?? 0) ^ (received[index] ?? 0);
  }

  return difference === 0;
}

/** Compara segredos sem encerrar no primeiro byte divergente. */
export function isExpectedSharedSecret(
  provided: string | null,
  expected: string | null | undefined,
): boolean {
  if (!provided || !expected) return false;

  const expectedBytes = new TextEncoder().encode(expected);
  const providedBytes = new TextEncoder().encode(provided);
  const length = Math.max(expectedBytes.length, providedBytes.length);
  let difference = expectedBytes.length ^ providedBytes.length;

  for (let index = 0; index < length; index++) {
    difference |= (expectedBytes[index] ?? 0) ^ (providedBytes[index] ?? 0);
  }

  return difference === 0;
}

export function isInternalServiceRequest(req: Request): boolean {
  return isExpectedServiceRoleAuthorization(
    req.headers.get("Authorization"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );
}
