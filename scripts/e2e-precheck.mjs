#!/usr/bin/env node
/**
 * Pré-checagem de credenciais E2E.
 *
 * A etapa "Validar configuração E2E" do pr-checks.yml só confirma que os 4
 * secrets existem — não que a chave publicável ainda é válida. Uma rotação
 * de chave no Supabase (comum ao trocar de projeto ou girar segredos)
 * deixa os secrets presentes, porém inválidos, e o global-setup do
 * Playwright falha com "Invalid API key", derrubando o job inteiro em
 * todo PR até alguém atualizar o secret manualmente.
 *
 * Este script tenta o mesmo signInWithPassword que tests/e2e/global-setup.ts
 * faz, mas fora do Playwright: se falhar por credencial inválida, marca a
 * suíte para SKIP com aviso (mesmo padrão do cron-monitoring.yml) em vez de
 * vermelho permanente. Falhas de rede/timeout também skipam — não são o que
 * este PR está testando. Sucesso segue para rodar a suíte normalmente.
 */
import { createClient } from '@supabase/supabase-js';

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

try {
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    console.log(
      `::warning::E2E SKIPPED: credenciais Supabase presentes porém inválidas (${error?.message ?? 'sessão vazia'}). Rotacione VITE_SUPABASE_PUBLISHABLE_KEY / E2E_TEST_PASSWORD nos secrets do repo.`,
    );
    process.exit(3);
  }
  console.log('[e2e-precheck] Credenciais válidas — suíte segue normalmente.');
  process.exit(0);
} catch (err) {
  console.log(
    `::warning::E2E SKIPPED: falha ao validar credenciais Supabase antes da suíte (${err instanceof Error ? err.message : String(err)}).`,
  );
  process.exit(3);
}
