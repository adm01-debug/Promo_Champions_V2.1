/**
 * Lint test: prevent PostgREST URL overflow via unbounded `.in()` calls.
 *
 * Rule: dentro de `supabase/functions/**`, chamadas `.in('coluna', arrayDinamico)`
 * DEVEM passar pelo helper `chunkedIn` de `../_shared/chunked-in.ts`.
 * Um `.in('coluna', ARRAY)` cru com >200 UUIDs gera URL >8KB e o gateway PostgREST
 * derruba a conexão com `TypeError: error sending request`, resultando em 500
 * "Unknown error" para o cliente.
 *
 * Heurística (baixo falso-positivo):
 *   - Aceita: `.in('coluna', [literal_estatico, ...])`   (array literal inline)
 *   - Aceita: `.in('coluna', chunk)`                      (parametro do chunkedIn)
 *   - Aceita: linhas dentro de `chunkedIn(...)` (pré-filtradas por bloco)
 *   - Rejeita: `.in('coluna', variavelDinamica)` fora de chunkedIn
 *
 * Whitelist: colunas cujo domínio é enumerável e limitado
 * (`status`, `severity`, `role`, `outcome`) — arrays desses valores nunca
 * ultrapassam ~10 elementos.
 *
 * Falhas listam `file:line` para conserto mecânico.
 */
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { fromFileUrl, relative, resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

const FUNCTIONS_ROOT = resolve(fromFileUrl(import.meta.url), "../..");

// Colunas com domínio enumerável — arrays literais são sempre pequenos.
const WHITELIST_COLUMNS = new Set([
  "status",
  "severity",
  "role",
  "outcome",
  "type",
  "event_type",
  "kind",
  "stage",         // pipeline stages: cardinalidade ≤ ~10
  "channel",       // canais fixos: whatsapp/email/sms/call/linkedin
  "tier",          // tiers enumeráveis: cold/warm/hot/champion
  "contact_type",  // client/lead
]);

// Matches `.in('col', argument)` capturando coluna e argumento (até vírgula/paren).
const IN_CALL_RE = /\.in\(\s*['"]([\w_]+)['"]\s*,\s*([^)]+?)\s*\)/g;

interface Offense {
  file: string;
  line: number;
  column: string;
  argument: string;
  snippet: string;
}

function isLiteralArrayArg(arg: string): boolean {
  // Argumento começa com `[` → array literal inline (estático).
  return arg.trimStart().startsWith("[");
}

function isChunkParam(arg: string): boolean {
  // Nome exato `chunk` → parâmetro dentro do runner de chunkedIn.
  return /^chunk\b/.test(arg.trim());
}

async function scan(): Promise<Offense[]> {
  const offenses: Offense[] = [];
  for await (
    const entry of walk(FUNCTIONS_ROOT, {
      exts: [".ts"],
      includeDirs: false,
      skip: [/node_modules/, /\.git/, /_shared\/chunked-in\.ts$/, /_shared\/chunked_in_lint_test\.ts$/],
    })
  ) {
    const rel = relative(FUNCTIONS_ROOT, entry.path);
    // Ignora testes (podem ter fixtures com arrays pequenos controlados).
    if (rel.endsWith("_test.ts") || rel.endsWith(".test.ts")) continue;

    const text = await Deno.readTextFile(entry.path);
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Diretiva de escape: `// chunked-in-lint-ignore-next-line` na linha anterior.
      const prev = i > 0 ? lines[i - 1] : "";
      if (/chunked-in-lint-ignore-next-line/.test(prev)) continue;

      IN_CALL_RE.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = IN_CALL_RE.exec(line)) !== null) {
        const [, col, arg] = m;
        if (WHITELIST_COLUMNS.has(col)) continue;
        if (isLiteralArrayArg(arg)) continue;
        if (isChunkParam(arg)) continue;
        offenses.push({
          file: rel,
          line: i + 1,
          column: col,
          argument: arg,
          snippet: line.trim(),
        });
      }
    }
  }
  return offenses;
}

Deno.test("`.in(col, dynamicArray)` deve passar por chunkedIn (evita overflow de URL PostgREST)", async () => {
  const offenses = await scan();
  if (offenses.length > 0) {
    const list = offenses
      .map((o) => `  ✗ ${o.file}:${o.line}  .in('${o.column}', ${o.argument})\n      ${o.snippet}`)
      .join("\n");
    throw new Error(
      `Encontradas ${offenses.length} chamada(s) \`.in()\` com array dinâmico fora de chunkedIn.\n\n` +
        `Refatore usando o helper de _shared/chunked-in.ts:\n\n` +
        `    import { chunkedIn } from "../_shared/chunked-in.ts";\n\n` +
        `    const rows = await chunkedIn<Row>(\n` +
        `      ids,\n` +
        `      (chunk) => supabase.from("table").select("*").in("id", chunk),\n` +
        `      { parallel: true, label: "meu-modulo" },\n` +
        `    );\n\n` +
        `Offenders:\n${list}`,
    );
  }
});
