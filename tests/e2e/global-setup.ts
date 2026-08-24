import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.resolve(__dirname, '.auth');
const SESSION_FILE = path.join(AUTH_DIR, 'session.json');

/**
 * Global setup: autentica com credenciais reais e persiste a sessão em disco
 * para que os specs (helpers/auth.ts) rodem autenticados no preview em vez
 * de serem skipados.
 *
 * Requisitos (env):
 *   - VITE_SUPABASE_URL
 *   - VITE_SUPABASE_PUBLISHABLE_KEY
 *   - VITE_SUPABASE_PROJECT_ID
 *   - E2E_TEST_EMAIL
 *   - E2E_TEST_PASSWORD
 *
 * Se `LOVABLE_BROWSER_SUPABASE_SESSION_JSON` já estiver injetada no ambiente,
 * o setup respeita a sessão gerenciada e não faz login.
 */
export default async function globalSetup(): Promise<void> {
  if (
    process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON &&
    process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY
  ) {
     
    console.log('[e2e global-setup] Sessão Lovable já injetada — reutilizando.');
    return;
  }

  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  const url = process.env.VITE_SUPABASE_URL;
  const anon = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const projectId = process.env.VITE_SUPABASE_PROJECT_ID;

  if (!email || !password || !url || !anon || !projectId) {
     
    console.warn(
      '[e2e global-setup] Credenciais ausentes — testes autenticados serão skipados. ' +
        'Defina E2E_TEST_EMAIL, E2E_TEST_PASSWORD, VITE_SUPABASE_URL, ' +
        'VITE_SUPABASE_PUBLISHABLE_KEY e VITE_SUPABASE_PROJECT_ID.',
    );
    return;
  }

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(
      `[e2e global-setup] Falha ao autenticar ${email}: ${error?.message ?? 'sessão vazia'}`,
    );
  }

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  fs.writeFileSync(
    SESSION_FILE,
    JSON.stringify(
      {
        sessionJson: JSON.stringify(data.session),
        storageKey: `sb-${projectId}-auth-token`,
      },
      null,
      2,
    ),
  );

   
  console.log(`[e2e global-setup] Sessão real capturada para ${email}.`);
}
