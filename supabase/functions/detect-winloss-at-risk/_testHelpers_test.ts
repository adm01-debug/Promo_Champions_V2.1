import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { matchesPatternFamily, patternLabelTokens } from "./_testHelpers.ts";

Deno.test("patternLabelTokens: extracts significant tokens, strips diacritics & punctuation", () => {
  assertEquals(patternLabelTokens("Preço alto vs concorrência"), ["preco", "alto", "concorrencia"]);
  assertEquals(patternLabelTokens("Negociação travada — fase proposta"), ["negociacao", "travada", "fase", "proposta"]);
  assertEquals(patternLabelTokens("a b cd"), []); // all <4 chars
  assertEquals(patternLabelTokens(""), []);
});

Deno.test("matchesPatternFamily: strict tier — exact substring match", () => {
  const m = matchesPatternFamily("Preço alto vs concorrência", "Preço alto");
  assertEquals(m.ok, true);
  assertEquals(m.mode, "strict");
});

Deno.test("matchesPatternFamily: token fallback — richer engine label still matches family", () => {
  // Engine emitted "Pressão competitiva — concorrente X", family = "Pressão competitiva".
  const m1 = matchesPatternFamily("Pressão competitiva — concorrente X", "Pressão competitiva");
  assertEquals(m1.ok, true);
  assertEquals(m1.mode, "strict");

  // Diacritic mismatch but tokens still align.
  const m2 = matchesPatternFamily("Pressao competitiva agressiva", "Pressão competitiva");
  assertEquals(m2.ok, true);
  assertEquals(m2.mode, "tokens");
});

Deno.test("matchesPatternFamily: miss — reports which tokens were missing", () => {
  const m = matchesPatternFamily("Churn pós-trial", "Pressão competitiva");
  assertEquals(m.ok, false);
  assertEquals(m.mode, "miss");
  assertEquals(m.missingTokens, ["pressao", "competitiva"]);
});

Deno.test("matchesPatternFamily: empty/null actual returns miss with full token list", () => {
  const m = matchesPatternFamily(null, "Preço alto");
  assertEquals(m.ok, false);
  assertEquals(m.mode, "miss");
  assertEquals(m.missingTokens, ["preco", "alto"]);
});
