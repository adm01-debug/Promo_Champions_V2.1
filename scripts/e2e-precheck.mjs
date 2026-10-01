#!/usr/bin/env node
/**
 * Pré-checagem de credenciais E2E.
 *
 * Contrato (auditoria 2026-10 — item 17):
 *   - Secrets AUSENTES      → quem chama decide o skip (o script nem roda).
 *   - Secrets INVÁLIDOS     → exit 1: credencial configurada-mas-quebrada é
 *                             falha de CI, não "skip verde". Um gate que nunca
 *                             executa a suíte não é cobertura — é teatro.
 *   - Falha transitória     → exit 3: rede/indisponibilidade do Supabase não é
 *     (timeout, 5xx)          o que a PR está testando; quem chama pode optar
 *                             por skip com warning.
 *   - Credenciais válidas   → exit 0: suíte roda.
 *
 * A etapa "Validar configuração E2E" dos workflows só confirma que os 4
 * secrets existem — não que a chave publicável ainda é válida. Este script
 * tenta o mesmo signInWithPassword que tests/e2e/global-setup.ts faz, mas
 * fora do Playwright.
 */
import { createClient } from '@supabase/supabase-js';
import { appendFileSync } from 'node:fs';

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// URL malformada é configuração quebrada (exit 1), não falha transitória —
// createClient lançaria dentro do try e cairia no skip de rede (exit 3).
let parsedUrl;
try {
  parsedUrl = new URL(url ?? '');
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(`protocolo inválido: ${parsedUrl.protocol}`);
  }
} catch (err) {
  console.log(
    `::error::VITE_SUPABASE_URL inválida ("${url}" — ${err instanceof Error ? err.message : err}). ` +
      `Corrija o secret em Settings > Secrets; gate reprovado.`,
  );
  process.exit(1);
}

// O ref do projeto (<ref>.supabase.co) sai da URL — global-setup.ts exige
// VITE_SUPABASE_PROJECT_ID para persistir a sessão autenticada. Exportar
// como output elimina o secret extra e o "skip silencioso" quando ele falta.
const refMatch = parsedUrl.hostname.match(/^([^.]+)\.supabase\.co$/);
if (refMatch && process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `project_ref=${refMatch[1]}\n`);
}

try {
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    // 4xx = o servidor rejeitou a credencial (apikey inválida, login errado,
    // usuário desabilitado). É configuração quebrada, não flake — falha o job.
    const status = error?.status ?? 0;
    if (status >= 400 && status < 500) {
      console.log(
        `::error::Credenciais E2E configuradas porém INVÁLIDAS (${status} — ${error?.message ?? 'sessão vazia'}). ` +
          `Rotacione VITE_SUPABASE_PUBLISHABLE_KEY / E2E_TEST_PASSWORD em Settings > Secrets. ` +
          `Gate reprovado: aprovar sem rodar a suíte não é seguro.`,
      );
      process.exit(1);
    }
    // 5xx/resposta inesperada = problema do lado do Supabase, não da PR.
    console.log(
      `::warning::E2E SKIPPED: Supabase respondeu ${status || 'sem status'} ao validar credenciais (${error?.message ?? 'sessão vazia'}). Falha transitória — a suíte é pulada.`,
    );
    process.exit(3);
  }
  console.log('[e2e-precheck] Credenciais válidas — suíte segue normalmente.');
  process.exit(0);
} catch (err) {
  // Exceção de rede (DNS, timeout, TLS) — transitório, não invalida a credencial.
  console.log(
    `::warning::E2E SKIPPED: falha de rede ao validar credenciais Supabase (${err instanceof Error ? err.message : String(err)}).`,
  );
  process.exit(3);
}
