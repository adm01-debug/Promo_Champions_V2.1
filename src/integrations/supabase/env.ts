// Defaults do projeto canônico de produção — públicos por design (a chave
// publishable vai para o bundle do browser de qualquer forma; RLS é o
// controle real). Env vars sobrescrevem os defaults para preview/staging.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://usyxfpqlsspldubptrdl.supabase.co';

// Accept both PUBLISHABLE_KEY (preferred in this codebase) and ANON_KEY
// (legacy / Lovable-generated .env) so a missing rename doesn't break boot.
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_5lvZYipoPfIqXcAbNQhI9A_mwlA7Nx-';
