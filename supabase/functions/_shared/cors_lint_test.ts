/**
 * Lint test: enforce a single source of truth for `corsHeaders`.
 *
 * Rule: `corsHeaders` MUST be declared exactly once across the entire
 * `supabase/functions` tree — namely in `supabase/functions/_shared/cors.ts`.
 * Every other edge function file must `import { corsHeaders } from "../_shared/cors.ts"`.
 *
 * This test fails the build (via `deno test` / `supabase--test_edge_functions`)
 * when any other file declares its own `corsHeaders`. Failure output lists every
 * offender with `file:line` so the fix is mechanical.
 *
 * Why: duplicated CORS objects drift over time (different allowed headers,
 * different origins) and cause subtle preflight failures in production. A single
 * canonical export keeps every function in lockstep.
 */
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { walk } from "https://deno.land/std@0.224.0/fs/walk.ts";
import { fromFileUrl, relative, resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

const FUNCTIONS_ROOT = resolve(fromFileUrl(import.meta.url), "../..");
const CANONICAL_FILE = "_shared/cors.ts";

/** Matches `const corsHeaders =`, `let corsHeaders =`, `var corsHeaders =`,
 *  or `export const corsHeaders =`, with optional type annotation. Multiline-safe
 *  per line because we scan line-by-line. */
const DECLARATION_RE = /^\s*(?:export\s+)?(?:const|let|var)\s+corsHeaders\b/;

interface Declaration {
  file: string; // relative to supabase/functions
  line: number;
  snippet: string;
}

async function findCorsHeadersDeclarations(): Promise<Declaration[]> {
  const found: Declaration[] = [];
  for await (
    const entry of walk(FUNCTIONS_ROOT, {
      exts: [".ts"],
      includeDirs: false,
      // Skip generated artifacts / lockfiles that may live under functions/.
      skip: [/node_modules/, /\.git/],
    })
  ) {
    const rel = relative(FUNCTIONS_ROOT, entry.path);
    // Don't lint the lint test itself — it legitimately mentions the identifier.
    if (rel === "_shared/cors_lint_test.ts") continue;

    const text = await Deno.readTextFile(entry.path);
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (DECLARATION_RE.test(lines[i])) {
        found.push({ file: rel, line: i + 1, snippet: lines[i].trim() });
      }
    }
  }
  return found;
}

Deno.test("corsHeaders is declared exactly once (in _shared/cors.ts)", async () => {
  const declarations = await findCorsHeadersDeclarations();

  // 1. The canonical declaration must exist.
  const canonical = declarations.filter((d) => d.file === CANONICAL_FILE);
  assertEquals(
    canonical.length,
    1,
    `Expected exactly 1 canonical declaration in ${CANONICAL_FILE}, found ${canonical.length}.\n` +
      canonical.map((d) => `  - ${d.file}:${d.line} ${d.snippet}`).join("\n"),
  );

  // 2. No other file may declare its own corsHeaders.
  const offenders = declarations.filter((d) => d.file !== CANONICAL_FILE);
  if (offenders.length > 0) {
    const list = offenders.map((d) => `  ✗ ${d.file}:${d.line}  ${d.snippet}`).join("\n");
    throw new Error(
      `Found ${offenders.length} duplicate \`corsHeaders\` declaration(s) outside ${CANONICAL_FILE}.\n` +
        `Replace each with:\n` +
        `    import { corsHeaders } from "../_shared/cors.ts";\n\n` +
        `Offenders:\n${list}`,
    );
  }
  assertEquals(offenders, []);
});
