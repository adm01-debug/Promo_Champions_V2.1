import {
  isExpectedSharedSecret,
  isInternalServiceRequest,
} from "./internal-service-auth.ts";

/**
 * Autoriza jobs internos por service_role ou pelo segredo compartilhado do
 * pg_cron. O loader só é executado quando o header X-Cron-Secret existe, para
 * que chamadas anônimas comuns falhem sem consultar o banco.
 */
export async function isAuthorizedCronRequest(
  req: Request,
  loadExpectedSecret: () => Promise<string | null | undefined>,
): Promise<boolean> {
  if (isInternalServiceRequest(req)) return true;

  const provided = req.headers.get("X-Cron-Secret");
  if (!provided) return false;

  const expected = await loadExpectedSecret();
  return isExpectedSharedSecret(provided, expected);
}
