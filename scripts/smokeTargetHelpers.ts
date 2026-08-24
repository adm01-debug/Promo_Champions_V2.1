/**
 * Helpers puros (testáveis) do smoke test do backend de destino.
 * Mantidos fora do script executável para permitir unit tests sem rede.
 */

export type CheckStatus = "pass" | "fail" | "skip";

export interface CheckResult {
  /** Identificador curto do check (ex.: "auth.login") */
  id: string;
  /** Fase lógica do smoke test */
  phase: "connectivity" | "auth" | "rls" | "data";
  status: CheckStatus;
  /** Mensagem legível para o operador */
  message: string;
  /** Tempo de execução em ms (quando medido) */
  durationMs?: number;
}

/** Erro no formato mínimo retornado pelo PostgREST/Supabase. */
export interface PostgrestLikeError {
  code?: string | null;
  message?: string | null;
}

/**
 * Códigos/mensagens que indicam bloqueio legítimo de acesso
 * (RLS negando, ausência de GRANT ou JWT ausente).
 */
export function isAccessDenied(error: PostgrestLikeError | null | undefined): boolean {
  if (!error) return false;
  const code = (error.code ?? "").toUpperCase();
  if (code === "42501" || code === "PGRST301" || code === "PGRST302") return true;
  const msg = (error.message ?? "").toLowerCase();
  return (
    msg.includes("permission denied") ||
    msg.includes("row-level security") ||
    msg.includes("jwt") ||
    msg.includes("not authorized")
  );
}

/**
 * Um leitura anônima é considerada isolada quando o backend nega o acesso
 * OU retorna zero linhas. Qualquer linha vazada é falha de isolamento.
 */
export function anonReadIsIsolated(
  error: PostgrestLikeError | null | undefined,
  rowCount: number,
): boolean {
  if (isAccessDenied(error)) return true;
  if (error) return true; // qualquer outro erro também não vaza dados
  return rowCount === 0;
}

/** Agrega os checks em um resumo determinístico. */
export function summarize(results: CheckResult[]) {
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const skipped = results.filter((r) => r.status === "skip").length;
  return {
    total: results.length,
    passed,
    failed,
    skipped,
    /** Verde só quando nenhum check falhou e existe pelo menos 1 aprovado. */
    ok: failed === 0 && passed > 0,
  };
}

/** Exit code do processo: 0 = verde, 1 = qualquer falha. */
export function exitCodeFor(results: CheckResult[]): 0 | 1 {
  return summarize(results).ok ? 0 : 1;
}

/** Renderiza uma linha de relatório em texto. */
export function formatLine(r: CheckResult): string {
  const icon = r.status === "pass" ? "✅" : r.status === "fail" ? "❌" : "➖";
  const time = typeof r.durationMs === "number" ? ` (${r.durationMs}ms)` : "";
  return `${icon} [${r.phase}] ${r.id}: ${r.message}${time}`;
}
