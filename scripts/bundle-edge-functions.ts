/**
 * CI bundler check for every Supabase Edge Function.
 *
 * Walks `supabase/functions/*` and runs `deno check` on each `index.ts`,
 * which performs full module resolution + type-check (the same work the
 * supabase edge runtime does at deploy time). When a function fails, the
 * script extracts the *failing import URL* from stderr (e.g. an `esm.sh`
 * 502, an unresolved `npm:` specifier, or a typo in a relative path) and
 * reports it in a single human-readable summary at the end.
 *
 * Exit code 0 → all functions resolve. Exit code 1 → at least one failed
 * (CI fails). The summary lists every offender with:
 *   - function name
 *   - failing import URL (when extractable)
 *   - first 3 lines of stderr (for context the regex didn't capture)
 *
 * Usage:
 *   deno run --allow-read --allow-run --allow-env --allow-net \
 *     scripts/bundle-edge-functions.ts
 *
 * Env:
 *   FUNCTIONS_DIR   override the scan root (default: supabase/functions)
 *   ONLY            comma-separated list of function names to check
 *                   (e.g. ONLY=lead-scoring,dispatch-webhook)
 */

const FUNCTIONS_DIR = Deno.env.get("FUNCTIONS_DIR") ?? "supabase/functions";
const ONLY = (Deno.env.get("ONLY") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

interface CheckResult {
  fn: string;
  ok: boolean;
  /** "import" → module resolution failed (CI must fail).
   *  "typecheck" → all imports resolved but TS errors exist (warn only).
   *  null → ok. */
  failureKind: "import" | "typecheck" | null;
  failingImport: string | null;
  stderrHead: string;
}

/** Best-effort extraction of the offending import URL from `deno check` stderr.
 *  Covers the formats Deno 1.x and 2.x emit for: network failures, unresolved
 *  npm: specifiers, missing relative imports, and integrity drift. */
function extractFailingImport(stderr: string): string | null {
  const patterns: RegExp[] = [
    // "error: Module not found "https://esm.sh/...""
    /Module not found\s+"([^"]+)"/,
    // "error: Import 'npm:foo' failed: ..."
    /Import\s+'([^']+)'\s+failed/,
    // "Caused by: error sending request for url (https://...)"
    /error sending request for url\s+\(([^)]+)\)/,
    // "Specifier "..." was not found"
    /Specifier\s+"([^"]+)"\s+was not found/i,
    // "Relative import path "..." not prefixed with..."
    /Relative import path\s+"([^"]+)"/,
    // "Could not find a matching package for 'npm:...'" (Deno 2 + nodeModulesDir)
    /Could not find a matching package for\s+'([^']+)'/,
    // Generic fallback: first quoted URL-looking token after "error"
    /error[^\n]*?["'`](https?:\/\/[^"'`\s]+|npm:[^"'`\s]+)["'`]/i,
  ];
  for (const re of patterns) {
    const m = stderr.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/** Distinguish module-resolution failures (the thing CI must block on) from
 *  pure TypeScript-checking errors (TS#### codes). The bundler check exists to
 *  catch broken imports — TS errors are a separate concern owned by other
 *  tooling and would otherwise produce huge amounts of noise. */
function classifyFailure(stderr: string): "import" | "typecheck" {
  if (extractFailingImport(stderr)) return "import";
  // Deno surfaces TS errors as "TSxxxx [ERROR]:" lines. If every reported error
  // is a TS code (and no module-resolution signal was matched above), treat as
  // typecheck-only.
  const hasTsError = /TS\d{3,5}\s*\[ERROR\]/.test(stderr);
  if (hasTsError) return "typecheck";
  // Anything else (network down, deno panic, permission error) → treat as
  // import-class so it blocks CI rather than passing silently.
  return "import";
}

async function checkFunction(fn: string, indexPath: string): Promise<CheckResult> {
  const cmd = new Deno.Command("deno", {
    args: ["check", "--quiet", indexPath],
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stderr } = await cmd.output();
  const stderrText = new TextDecoder().decode(stderr);
  if (code === 0) {
    return { fn, ok: true, failureKind: null, failingImport: null, stderrHead: "" };
  }
  const kind = classifyFailure(stderrText);
  return {
    fn,
    ok: false,
    failureKind: kind,
    failingImport: kind === "import" ? extractFailingImport(stderrText) : null,
    stderrHead: stderrText.split("\n").slice(0, 3).join("\n").trim(),
  };
}

async function listFunctions(): Promise<Array<{ fn: string; indexPath: string }>> {
  const out: Array<{ fn: string; indexPath: string }> = [];
  for await (const entry of Deno.readDir(FUNCTIONS_DIR)) {
    if (!entry.isDirectory) continue;
    if (entry.name.startsWith("_")) continue; // skip _shared/
    if (ONLY.length > 0 && !ONLY.includes(entry.name)) continue;
    const indexPath = `${FUNCTIONS_DIR}/${entry.name}/index.ts`;
    try {
      const stat = await Deno.stat(indexPath);
      if (stat.isFile) out.push({ fn: entry.name, indexPath });
    } catch {
      // No index.ts — skip silently (e.g. test-only directories).
    }
  }
  return out.sort((a, b) => a.fn.localeCompare(b.fn));
}

const targets = await listFunctions();
console.log(`▶ Bundling ${targets.length} edge function(s) from ${FUNCTIONS_DIR}\n`);

const start = Date.now();
const results: CheckResult[] = [];
// Bounded concurrency: 6 parallel checks keeps CPU/network sane on CI.
const CONCURRENCY = 6;
const encoder = new TextEncoder();
let cursor = 0;
async function worker() {
  while (cursor < targets.length) {
    const i = cursor++;
    const { fn, indexPath } = targets[i];
    const r = await checkFunction(fn, indexPath);
    results.push(r);
    const mark = r.ok ? "." : r.failureKind === "import" ? "F" : "t";
    Deno.stdout.writeSync(encoder.encode(mark));
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\n\n⏱  Completed in ${((Date.now() - start) / 1000).toFixed(1)}s`);

const importFailed = results.filter((r) => !r.ok && r.failureKind === "import")
  .sort((a, b) => a.fn.localeCompare(b.fn));
const typecheckFailed = results.filter((r) => !r.ok && r.failureKind === "typecheck")
  .sort((a, b) => a.fn.localeCompare(b.fn));
const passed = results.filter((r) => r.ok).length;

console.log(
  `\n✅ ${passed} passed   ❌ ${importFailed.length} import failure(s)   ` +
    `⚠️  ${typecheckFailed.length} typecheck-only failure(s)   ` +
    `(total ${results.length})`,
);
console.log("Legend: '.' = ok   'F' = import failure (fails CI)   't' = typecheck-only (warning)");

if (importFailed.length > 0) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Import failures (block CI):");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  for (const f of importFailed) {
    console.log(`  ✗ ${f.fn}`);
    console.log(`     import : ${f.failingImport ?? "(unable to extract — see stderr below)"}`);
    if (f.stderrHead) {
      const indented = f.stderrHead.split("\n").map((l) => `         ${l}`).join("\n");
      console.log(`     stderr :\n${indented}`);
    }
    console.log("");
  }

  // Group by failing import to spot systemic outages (e.g. "esm.sh is down"
  // → all functions sharing that URL fail in lockstep, easy to triage).
  const byImport = new Map<string, string[]>();
  for (const f of importFailed) {
    const key = f.failingImport ?? "(unknown)";
    if (!byImport.has(key)) byImport.set(key, []);
    byImport.get(key)!.push(f.fn);
  }
  if (byImport.size > 0) {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Grouped by failing import (systemic vs. one-off):");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    const sorted = [...byImport.entries()].sort((a, b) => b[1].length - a[1].length);
    for (const [imp, fns] of sorted) {
      console.log(`  ${fns.length}× ${imp}`);
      for (const fn of fns.slice(0, 5)) console.log(`       - ${fn}`);
      if (fns.length > 5) console.log(`       … and ${fns.length - 5} more`);
      console.log("");
    }
  }
}

if (typecheckFailed.length > 0) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Typecheck-only failures (do NOT block this CI step):`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("These functions resolve all imports cleanly but have TypeScript");
  console.log("errors. They are reported here for visibility but are owned by");
  console.log("the regular tsc/lint pipeline, not the bundler check.\n");
  for (const f of typecheckFailed) {
    console.log(`  ⚠ ${f.fn}`);
    if (f.stderrHead) {
      const firstLine = f.stderrHead.split("\n")[0];
      console.log(`     ${firstLine}`);
    }
  }
  console.log("");
}

if (importFailed.length > 0) {
  Deno.exit(1);
}

console.log("\n🎉 All edge function imports resolve cleanly.");
Deno.exit(0);
