/**
 * Traduz erros do Supabase Auth relacionados a senha (incluindo HIBP / leaked passwords)
 * em mensagens amigáveis em PT-BR.
 *
 * Ativado por `password_hibp_enabled: true` no supabase auth config.
 * Supabase retorna, entre outros:
 *   - "Password should be at least 6 characters"
 *   - "Password is known to be weak and easy to guess, please choose a different one" (HIBP)
 *   - "New password should be different from the old password"
 *   - code: "weak_password"
 */
export interface AuthPasswordError {
  message?: string | null;
  code?: string | null;
  status?: number | null;
}

export type PasswordRiskKind =
  | "leaked"
  | "too_short"
  | "same_as_old"
  | "rate_limited"
  | "unknown";

export interface PasswordErrorResult {
  kind: PasswordRiskKind;
  message: string;
}

const LEAKED_PATTERNS = [
  /pwned/i,
  /known to be weak/i,
  /has been (found|leaked)/i,
  /compromis/i,
  /data breach/i,
];

export function classifyPasswordError(
  error: AuthPasswordError | null | undefined,
): PasswordErrorResult {
  if (!error) return { kind: "unknown", message: "Erro ao atualizar senha. Tente novamente." };

  const raw = (error.message ?? "").toString();
  const code = (error.code ?? "").toString().toLowerCase();

  if (code === "weak_password" || LEAKED_PATTERNS.some((r) => r.test(raw))) {
    return {
      kind: "leaked",
      message:
        "Essa senha aparece em vazamentos públicos conhecidos. Escolha uma senha forte e única.",
    };
  }

  if (/at least \d+ characters/i.test(raw) || /too short/i.test(raw)) {
    return {
      kind: "too_short",
      message: "Senha muito curta. Use pelo menos 8 caracteres.",
    };
  }

  if (/different from the old password/i.test(raw)) {
    return {
      kind: "same_as_old",
      message: "A nova senha precisa ser diferente da atual.",
    };
  }

  if (error.status === 429 || /rate limit/i.test(raw)) {
    return {
      kind: "rate_limited",
      message: "Muitas tentativas. Aguarde alguns instantes e tente novamente.",
    };
  }

  return { kind: "unknown", message: "Erro ao atualizar senha. Tente novamente." };
}
