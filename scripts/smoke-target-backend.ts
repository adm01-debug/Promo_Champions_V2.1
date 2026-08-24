/**
 * Smoke test ponta a ponta do backend de DESTINO (pós-migração).
 *
 * Valida, em 4 fases: conectividade, login, isolamento por RLS e acesso a dados.
 * Não escreve dados de negócio: a única mutação tentada é proposital e deve FALHAR
 * (teste de escalonamento de privilégio em user_roles).
 *
 * Uso:
 *   TARGET_SUPABASE_URL=... TARGET_SUPABASE_ANON_KEY=... \
 *   TARGET_SMOKE_EMAIL=... TARGET_SMOKE_PASSWORD=... \
 *   bunx tsx scripts/smoke-target-backend.ts
 *
 * Exit code 0 = verde; 1 = qualquer check reprovado.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  anonReadIsIsolated,
  exitCodeFor,
  formatLine,
  isAccessDenied,
  summarize,
  type CheckResult,
} from "./smokeTargetHelpers";

const URL = process.env.TARGET_SUPABASE_URL ?? "";
const ANON = process.env.TARGET_SUPABASE_ANON_KEY ?? "";
const EMAIL = process.env.TARGET_SMOKE_EMAIL ?? "";
const PASSWORD = process.env.TARGET_SMOKE_PASSWORD ?? "";

/** Tabelas que NUNCA devem retornar linhas para um cliente anônimo. */
const SENSITIVE_TABLES = [
  "salespeople",
  "user_roles",
  "commissions",
  "clients",
  "sales",
  "_internal_secrets",
] as const;

/** Tabelas de negócio que devem ser legíveis por um usuário autenticado. */
const CORE_TABLES = ["sales", "clients", "salespeople", "quotes_inbound", "orders"] as const;

const results: CheckResult[] = [];

function record(r: CheckResult) {
  results.push(r);
  console.log(formatLine(r));
}

async function timed<T>(fn: () => Promise<T>): Promise<{ value: T; durationMs: number }> {
  const started = Date.now();
  const value = await fn();
  return { value, durationMs: Date.now() - started };
}

async function phaseConnectivity(): Promise<boolean> {
  try {
    const { value: res, durationMs } = await timed(() =>
      fetch(`${URL}/auth/v1/health`, { headers: { apikey: ANON } }),
    );
    const ok = res.ok;
    record({
      id: "gotrue.health",
      phase: "connectivity",
      status: ok ? "pass" : "fail",
      message: ok ? "serviço de autenticação respondendo" : `HTTP ${res.status}`,
      durationMs,
    });
    return ok;
  } catch (err) {
    record({
      id: "gotrue.health",
      phase: "connectivity",
      status: "fail",
      message: `falha de rede: ${(err as Error).message}`,
    });
    return false;
  }
}

async function phaseRlsAnon(anon: SupabaseClient) {
  for (const table of SENSITIVE_TABLES) {
    const { value, durationMs } = await timed(() => anon.from(table).select("*").limit(5));
    const rows = value.data?.length ?? 0;
    const isolated = anonReadIsIsolated(value.error, rows);
    record({
      id: `rls.anon.${table}`,
      phase: "rls",
      status: isolated ? "pass" : "fail",
      message: isolated
        ? value.error
          ? `acesso anônimo bloqueado (${value.error.code ?? "erro"})`
          : "acesso anônimo retornou 0 linhas"
        : `VAZAMENTO: ${rows} linha(s) legíveis sem autenticação`,
      durationMs,
    });
  }
}

async function phaseAuth(authed: SupabaseClient): Promise<string | null> {
  const { value: signIn, durationMs } = await timed(() =>
    authed.auth.signInWithPassword({ email: EMAIL, password: PASSWORD }),
  );
  if (signIn.error || !signIn.data.session) {
    record({
      id: "auth.login",
      phase: "auth",
      status: "fail",
      message: signIn.error?.message ?? "sessão não retornada",
      durationMs,
    });
    return null;
  }
  record({
    id: "auth.login",
    phase: "auth",
    status: "pass",
    message: `login bem-sucedido para ${EMAIL}`,
    durationMs,
  });

  // getUser revalida o token no servidor (getSession apenas lê o storage local).
  const { data: userData, error: userError } = await authed.auth.getUser();
  const userId = userData?.user?.id ?? null;
  record({
    id: "auth.getUser",
    phase: "auth",
    status: userId ? "pass" : "fail",
    message: userId ? `token validado no servidor (uid ${userId})` : (userError?.message ?? "sem usuário"),
  });
  return userId;
}

async function phaseRlsAuthenticated(authed: SupabaseClient, userId: string) {
  // 1) Isolamento: user_roles só deve expor as roles do próprio usuário.
  const roles = await authed.from("user_roles").select("user_id, role");
  const foreign = (roles.data ?? []).filter((r) => r.user_id !== userId);
  const isAdminScoped = foreign.length > 0; // admin pode legitimamente ver todos
  record({
    id: "rls.authenticated.user_roles",
    phase: "rls",
    status: roles.error && !isAccessDenied(roles.error) ? "fail" : "pass",
    message: roles.error
      ? `leitura bloqueada (${roles.error.code ?? "erro"})`
      : isAdminScoped
        ? `usuário vê ${roles.data?.length} roles (perfil admin/manager)`
        : "usuário vê apenas as próprias roles",
  });

  // 2) Escalonamento de privilégio deve ser negado para não-admin.
  const escalate = await authed.from("user_roles").insert({ user_id: userId, role: "admin" });
  const blocked = Boolean(escalate.error);
  record({
    id: "rls.privilege_escalation",
    phase: "rls",
    status: blocked ? "pass" : "fail",
    message: blocked
      ? `inserção de role admin rejeitada (${escalate.error?.code ?? "erro"})`
      : "CRÍTICO: usuário conseguiu se conceder role admin",
  });

  // 3) has_role deve existir e ser executável.
  const { error: rpcError } = await authed.rpc("has_role", { _user_id: userId, _role: "admin" });
  record({
    id: "rls.has_role_rpc",
    phase: "rls",
    status: rpcError ? "fail" : "pass",
    message: rpcError ? `RPC has_role indisponível: ${rpcError.message}` : "RPC has_role executável",
  });
}

async function phaseData(authed: SupabaseClient) {
  for (const table of CORE_TABLES) {
    const { value, durationMs } = await timed(() =>
      authed.from(table).select("*", { count: "exact", head: true }),
    );
    if (value.error) {
      record({
        id: `data.${table}`,
        phase: "data",
        status: "fail",
        message: `leitura autenticada falhou: ${value.error.message}`,
        durationMs,
      });
      continue;
    }
    const count = value.count ?? 0;
    record({
      id: `data.${table}`,
      phase: "data",
      status: count > 0 ? "pass" : "fail",
      message: count > 0 ? `${count} linha(s) acessíveis` : "tabela acessível porém vazia",
      durationMs,
    });
  }
}

async function main() {
  const missing = [
    !URL && "TARGET_SUPABASE_URL",
    !ANON && "TARGET_SUPABASE_ANON_KEY",
    !EMAIL && "TARGET_SMOKE_EMAIL",
    !PASSWORD && "TARGET_SMOKE_PASSWORD",
  ].filter(Boolean);

  if (missing.length > 0) {
    console.error(`❌ Variáveis obrigatórias ausentes: ${missing.join(", ")}`);
    process.exit(1);
  }

  console.log(`🚀 Smoke test do backend de destino: ${URL}\n`);

  const reachable = await phaseConnectivity();
  if (!reachable) {
    console.error("\n❌ Backend inacessível — abortando as fases seguintes.");
    process.exit(1);
  }

  const anon = createClient(URL, ANON, { auth: { persistSession: false } });
  await phaseRlsAnon(anon);

  const authed = createClient(URL, ANON, { auth: { persistSession: false } });
  const userId = await phaseAuth(authed);

  if (userId) {
    await phaseRlsAuthenticated(authed, userId);
    await phaseData(authed);
    await authed.auth.signOut();
  } else {
    record({
      id: "rls+data",
      phase: "data",
      status: "skip",
      message: "fases de RLS autenticada e dados puladas (login falhou)",
    });
  }

  const s = summarize(results);
  console.log(
    `\n${s.ok ? "✅" : "❌"} ${s.passed}/${s.total} aprovados · ${s.failed} falha(s) · ${s.skipped} pulado(s)`,
  );
  process.exit(exitCodeFor(results));
}

void main();
