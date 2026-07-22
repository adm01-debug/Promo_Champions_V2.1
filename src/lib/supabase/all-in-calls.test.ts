// Guard-rail estático (Onda L Fase 5):
// Todo `.in('id' | 'user_id' | 'sale_id' | 'quote_id' | 'client_id' | 'deal_id', values)`
// dinâmico DEVE usar `chunkedInClient` — evita 414 URI Too Long em seleções em massa.
// Casos legítimos (arrays literais pequenos, whitelist manual) podem escapar com o
// comentário-âncora `// chunked-in-safe: <razão>` na linha imediatamente acima.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const HIGH_CARD_COLUMNS = [
  "id",
  "user_id",
  "sale_id",
  "quote_id",
  "client_id",
  "deal_id",
  "lead_id",
  "account_id",
  "salesperson_id",
  "contact_id",
];

const RE_IN = new RegExp(
  `\\.in\\(\\s*['"](${HIGH_CARD_COLUMNS.join("|")})['"]\\s*,`,
);

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "__generated" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (
      (p.endsWith(".ts") || p.endsWith(".tsx")) &&
      !p.endsWith(".test.ts") &&
      !p.endsWith(".test.tsx") &&
      !p.endsWith(".spec.ts") &&
      !p.endsWith(".spec.tsx")
    ) out.push(p);
  }
  return out;
}

describe("chunkedInClient guard-rail", () => {
  it("no high-cardinality .in() call escapes chunkedInClient", () => {
    const files = walk("src");
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      if (!RE_IN.test(src)) continue;
      const lines = src.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!RE_IN.test(line)) continue;
        // Escape hatches:
        // 1. explicit safety comment on the previous non-empty line
        let prev = i - 1;
        while (prev >= 0 && lines[prev].trim() === "") prev--;
        const safetyComment = prev >= 0 && /chunked-in-safe:/i.test(lines[prev]);
        if (safetyComment) continue;
        // 2. file already imports/uses chunkedIn or chunkedInClient
        if (/\bchunkedIn(Client)?\b/.test(src)) continue;
        // 3. this file IS the helper itself (contains docstring examples)
        if (f.endsWith("chunkedIn.ts")) continue;
        // 4. literal array of length <= 3 on the same line, e.g. .in('id', ['a','b'])
        const literalArrShort = /\.in\(\s*['"][^'"]+['"]\s*,\s*\[[^[\]]{0,80}\]\s*\)/.test(line);
        if (literalArrShort) continue;
        offenders.push(`${f}:${i + 1}  →  ${line.trim().slice(0, 140)}`);
      }
    }
    if (offenders.length > 0) {
      throw new Error(
        `${offenders.length} chamada(s) .in() em colunas de alta cardinalidade sem chunkedInClient:\n` +
          offenders.slice(0, 50).join("\n") +
          `\n\nSoluções:\n  1. Refatore para usar chunkedInClient de @/lib/supabase/chunkedIn\n  2. OU adicione o comentário // chunked-in-safe: <razão> na linha acima.`,
      );
    }
    expect(offenders).toEqual([]);
  });
});
