type SupabaseAdminEnv = {
  serviceRoleKey: string;
  supabaseUrl: string;
};

const WRITE_CONFIRMATION = "EXECUTAR_ESCRITA_ADMINISTRATIVA";

function requireEnv(name: "SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY"): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} é obrigatório. Defina-o no ambiente ou no gerenciador de segredos antes de executar este script.`,
    );
  }

  return value;
}

function validateSupabaseUrl(value: string): void {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("SUPABASE_URL precisa ser uma URL HTTP(S) válida.");
  }

  const isLoopback = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(parsed.hostname);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isLoopback)) {
    throw new Error(
      "SUPABASE_URL precisa usar HTTPS; HTTP é aceito somente para um Supabase local em loopback.",
    );
  }
}

function requireExplicitWriteConfirmation(): void {
  if (process.env.CONFIRM_SUPABASE_ADMIN_WRITE !== WRITE_CONFIRMATION) {
    throw new Error(
      "Este script pode alterar dados. Defina CONFIRM_SUPABASE_ADMIN_WRITE=EXECUTAR_ESCRITA_ADMINISTRATIVA somente após confirmar o projeto, o escopo e o backup.",
    );
  }
}

/**
 * Impede que scripts administrativos recorram a credenciais versionadas no repositório.
 * As variáveis devem ser injetadas pelo terminal seguro ou pelo gerenciador de segredos.
 */
export function requireSupabaseAdminEnv(): SupabaseAdminEnv {
  const supabaseUrl = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  validateSupabaseUrl(supabaseUrl);
  requireExplicitWriteConfirmation();

  return { supabaseUrl, serviceRoleKey };
}
