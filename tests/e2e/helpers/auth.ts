import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.resolve(__dirname, '../.auth');
export const SESSION_FILE = path.join(AUTH_DIR, 'session.json');

export const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

function loadSession(): { sessionJson: string; storageKey: string } | null {
  const envJson = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
  const envKey = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
  if (envJson && envKey) return { sessionJson: envJson, storageKey: envKey };
  if (fs.existsSync(SESSION_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
      if (raw?.sessionJson && raw?.storageKey) {
        return { sessionJson: raw.sessionJson, storageKey: raw.storageKey };
      }
    } catch {
      /* falha silenciosa -> retorna null */
    }
  }
  return null;
}

const cached = loadSession();
export const SESSION_JSON = cached?.sessionJson ?? '';
export const STORAGE_KEY = cached?.storageKey ?? '';
export const HAS_AUTH = Boolean(SUPABASE_URL && SUPABASE_ANON && SESSION_JSON && STORAGE_KEY);

export function skipReason(): string {
  if (!SUPABASE_URL || !SUPABASE_ANON) return 'VITE_SUPABASE_URL/PUBLISHABLE_KEY ausentes';
  if (!SESSION_JSON) return 'Sessão E2E ausente — rode com E2E_TEST_EMAIL/E2E_TEST_PASSWORD para gerar via global-setup';
  return '';
}
