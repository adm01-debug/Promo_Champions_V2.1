import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  actionNeedles,
  evaluateActionIncludes,
  hasMeaningfulActionIncludes,
  includesNormalized,
  matchesPatternFamily,
  normalizeForMatch,
  patternLabelTokens,
} from "./_testHelpers.ts";

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

// ----------------- evaluateActionIncludes (AND/OR semantics) -----------------

Deno.test("evaluateActionIncludes: string → AND single needle", () => {
  assert(evaluateActionIncludes("Reforce o ROI", "ROI").ok);
  const miss = evaluateActionIncludes("Reforce o valor", "ROI");
  assertEquals(miss.ok, false);
  assertEquals(miss.missing.all, ["ROI"]);
});

Deno.test("evaluateActionIncludes: string[] → OR (any match)", () => {
  assert(evaluateActionIncludes("Reforce o ROI", ["ROI", "valor"]).ok);
  assert(evaluateActionIncludes("Mostre valor agregado", ["ROI", "valor"]).ok);
  const miss = evaluateActionIncludes("Apenas mande o contrato", ["ROI", "valor"]);
  assertEquals(miss.ok, false);
  assertEquals(miss.missing.anyOf, ["ROI", "valor"]);
});

Deno.test("evaluateActionIncludes: { all, anyOf } → AND + OR", () => {
  // 'desconto' (required) + at least one of [ROI, valor]
  const spec = { all: ["desconto"], anyOf: ["ROI", "valor"] };

  const ok = evaluateActionIncludes("Justifique o desconto com ROI claro", spec);
  assertEquals(ok.ok, true);
  assertEquals(ok.reason, "all+anyOf");

  // missing required token
  const missAll = evaluateActionIncludes("Mostre o ROI ao cliente", spec);
  assertEquals(missAll.ok, false);
  assertEquals(missAll.missing.all, ["desconto"]);

  // required token present but no anyOf qualifier → still fails
  const missAny = evaluateActionIncludes("Aprove o desconto solicitado", spec);
  assertEquals(missAny.ok, false);
  assertEquals(missAny.missing.anyOf, ["ROI", "valor"]);
});

Deno.test("evaluateActionIncludes: { all } without anyOf → pure AND", () => {
  const spec = { all: ["desconto", "ROI"] };
  assert(evaluateActionIncludes("Justifique o desconto pelo ROI", spec).ok);
  const miss = evaluateActionIncludes("Justifique o desconto", spec);
  assertEquals(miss.ok, false);
  assertEquals(miss.missing.all, ["ROI"]);
});

Deno.test("evaluateActionIncludes: undefined / empty spec → ok=true (no assertion)", () => {
  assertEquals(evaluateActionIncludes("anything", undefined).ok, true);
  assertEquals(evaluateActionIncludes("anything", "").ok, true);
  assertEquals(evaluateActionIncludes("anything", []).ok, true);
  assertEquals(evaluateActionIncludes("anything", { all: [] }).ok, true);
});

Deno.test("hasMeaningfulActionIncludes: grouped form requires non-empty `all`", () => {
  assertEquals(hasMeaningfulActionIncludes({ all: [] }), false);
  assertEquals(hasMeaningfulActionIncludes({ all: [], anyOf: ["ROI"] }), false);
  assertEquals(hasMeaningfulActionIncludes({ all: ["desconto"] }), true);
  assertEquals(hasMeaningfulActionIncludes({ all: ["desconto"], anyOf: ["ROI"] }), true);
});

Deno.test("actionNeedles: flattens grouped form for diagnostics", () => {
  assertEquals(actionNeedles({ all: ["desconto"], anyOf: ["ROI", "valor"] }), [
    "desconto",
    "ROI",
    "valor",
  ]);
  assertEquals(actionNeedles({ all: ["desconto"] }), ["desconto"]);
});

// ----------------- normalizeForMatch / includesNormalized ------------------

Deno.test("normalizeForMatch: strips diacritics, lowercases, stems suffixes", () => {
  // Diacritic + ção/ções fold to the same root
  assertEquals(normalizeForMatch("Negociação"), normalizeForMatch("negociações"));
  // ado/ada fold to the same root
  assertEquals(normalizeForMatch("estagnado"), normalizeForMatch("Estagnada"));
  // oso/osa fold to the same root
  assertEquals(normalizeForMatch("competitivo"), normalizeForMatch("competitiva"));
  // mente suffix dropped
  assertEquals(normalizeForMatch("rapidamente"), "rapida");
  // Punctuation collapsed to single spaces
  assertEquals(normalizeForMatch("Preço — alto!!"), "preco alto");
});

Deno.test("normalizeForMatch: short tokens (<4) untouched, plural -s/-es safe", () => {
  // Short tokens preserved
  assertEquals(normalizeForMatch("vs"), "vs");
  // Plural drop only when root stays ≥3 chars
  assertEquals(normalizeForMatch("clientes"), normalizeForMatch("cliente"));
  // Won't strip "is" from a 4-char word like "pais"
  assertEquals(normalizeForMatch("pais"), "pais");
});

Deno.test("includesNormalized: tolerates accent + inflectional variation in reasons", () => {
  // Engine emits plural/inflected, fixture asserts singular base form
  assert(includesNormalized("Negociações travadas há 30 dias", "negociação travada"));
  assert(includesNormalized("Deal estagnada no estágio proposta", "estagnado"));
  assert(includesNormalized("Pressão competitiva agressiva", "competitivo"));
  // Diacritic-only mismatch still matches
  assert(includesNormalized("Preço alto vs concorrência", "preco alto"));
  // Genuine miss still rejected
  assert(!includesNormalized("Negociação travada", "churn pos-trial"));
});

Deno.test("includesNormalized: empty needle falls back to includesCI (defensive)", () => {
  // Empty/whitespace needle: should not silently match everything via normalization.
  assert(includesNormalized("anything", "")); // includesCI("", "") behavior preserved
});
