/**
 * Shared helpers for scenario / catalog tests.
 * No Deno-specific imports — keeps test files focused on assertions.
 */

export function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/**
 * `actionIncludes` accepts three shapes (in increasing expressiveness):
 *   1. `string`              — substring must appear (single AND).
 *   2. `string[]`            — at least one substring must appear (pure OR).
 *   3. `{ all; anyOf? }`     — every `all` substring must appear AND, when
 *                              `anyOf` is provided, at least one of those too.
 *                              Use this when an action must mention a core
 *                              concept ("desconto") together with one of
 *                              several acceptable qualifiers ("ROI", "valor").
 */
export interface ActionIncludesGroup {
  all: string[];
  anyOf?: string[];
}
export type ActionIncludes = string | string[] | ActionIncludesGroup;

function isGroup(a: ActionIncludes): a is ActionIncludesGroup {
  return typeof a === "object" && a !== null && !Array.isArray(a) && Array.isArray((a as ActionIncludesGroup).all);
}

function nonEmpty(arr: readonly unknown[] | undefined): string[] {
  return (arr ?? []).filter((s): s is string => typeof s === "string" && s.trim().length > 0);
}

/** Flat list of every substring referenced by `actionIncludes`, regardless of shape.
 *  Returned for diagnostics (e.g. error messages) — do NOT use for evaluation,
 *  call `evaluateActionIncludes` instead so AND/OR semantics are respected. */
export function actionNeedles(a: ActionIncludes | undefined): string[] {
  if (a === undefined) return [];
  if (typeof a === "string") return nonEmpty([a]);
  if (Array.isArray(a)) return nonEmpty(a);
  if (isGroup(a)) return [...nonEmpty(a.all), ...nonEmpty(a.anyOf)];
  return [];
}

/** True when `actionIncludes` is declared AND yields at least one non-empty needle.
 *  For grouped form, also requires `all` to be non-empty (otherwise the AND tier
 *  would be vacuously true and silently weaken the assertion). */
export function hasMeaningfulActionIncludes(a: ActionIncludes | undefined): boolean {
  if (a === undefined) return false;
  if (isGroup(a)) return nonEmpty(a.all).length > 0;
  return actionNeedles(a).length > 0;
}

export interface ActionEvaluation {
  ok: boolean;
  /** Human-readable explanation of which tier failed. */
  reason: string;
  /** Substrings that matched. */
  matched: string[];
  /** Substrings expected but absent (split by tier when relevant). */
  missing: { all: string[]; anyOf: string[] };
}

/**
 * Evaluate `actionIncludes` against the engine's `suggested_action` with the
 * correct AND/OR semantics for each shape. Returns rich diagnostics so callers
 * can produce actionable failure messages.
 *
 *   - `string`            → ok if substring present.
 *   - `string[]`          → ok if ANY substring present (OR).
 *   - `{ all, anyOf? }`   → ok if EVERY `all` present AND (no `anyOf` OR ≥1 anyOf present).
 *
 * If `actionIncludes` is undefined or yields no meaningful needles, returns
 * `{ ok: true }` so callers can skip the assertion silently — the
 * anti-regression test (`hasMeaningfulActionIncludes`) is responsible for
 * rejecting such configurations on included scenarios.
 */
export function evaluateActionIncludes(
  action: string | null | undefined,
  spec: ActionIncludes | undefined,
): ActionEvaluation {
  const empty = { all: [], anyOf: [] };
  if (spec === undefined || !hasMeaningfulActionIncludes(spec)) {
    return { ok: true, reason: "no-spec", matched: [], missing: empty };
  }
  const hay = action ?? "";

  if (typeof spec === "string") {
    const ok = includesCI(hay, spec);
    return ok
      ? { ok: true, reason: "string", matched: [spec], missing: empty }
      : { ok: false, reason: `string needle "${spec}" not found`, matched: [], missing: { all: [spec], anyOf: [] } };
  }

  if (Array.isArray(spec)) {
    const needles = nonEmpty(spec);
    const matched = needles.filter((n) => includesCI(hay, n));
    return matched.length > 0
      ? { ok: true, reason: "anyOf", matched, missing: empty }
      : { ok: false, reason: `none of ${JSON.stringify(needles)} found`, matched: [], missing: { all: [], anyOf: needles } };
  }

  // Grouped { all, anyOf? }
  const all = nonEmpty(spec.all);
  const anyOf = nonEmpty(spec.anyOf);
  const allMatched = all.filter((n) => includesCI(hay, n));
  const allMissing = all.filter((n) => !includesCI(hay, n));
  if (allMissing.length > 0) {
    return {
      ok: false,
      reason: `missing required (all): ${JSON.stringify(allMissing)}`,
      matched: allMatched,
      missing: { all: allMissing, anyOf: [] },
    };
  }
  if (anyOf.length === 0) {
    return { ok: true, reason: "all", matched: allMatched, missing: empty };
  }
  const anyMatched = anyOf.filter((n) => includesCI(hay, n));
  if (anyMatched.length === 0) {
    return {
      ok: false,
      reason: `all matched but none of anyOf: ${JSON.stringify(anyOf)}`,
      matched: allMatched,
      missing: { all: [], anyOf },
    };
  }
  return { ok: true, reason: "all+anyOf", matched: [...allMatched, ...anyMatched], missing: empty };
}

/**
 * Tokenize a family/dominant pattern label into significant words
 * (lowercase, length ≥ 4, diacritics stripped, punctuation removed).
 */
export function patternLabelTokens(label: string): string[] {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 4);
}

export interface PatternFamilyMatch {
  ok: boolean;
  mode: "strict" | "tokens" | "miss";
  expectedTokens: string[];
  missingTokens: string[];
}

/**
 * Match a `matched_pattern` against an expected family label using two tiers:
 *   1. Strict substring (case-insensitive).
 *   2. Token fallback — every significant token of the expected label must
 *      appear in the engine's matched_pattern (diacritic-insensitive).
 *
 * Reduces false negatives in catalog tests when the engine emits a slightly
 * richer label than the family declares (e.g. "Preço alto vs concorrência"
 * vs family "Preço alto").
 */
export function matchesPatternFamily(
  actual: string | null | undefined,
  expectedLabel: string,
): PatternFamilyMatch {
  const hay = (actual ?? "").trim();
  const expectedTokens = patternLabelTokens(expectedLabel);
  if (!hay || !expectedLabel) {
    return { ok: false, mode: "miss", expectedTokens, missingTokens: expectedTokens };
  }
  if (includesCI(hay, expectedLabel)) {
    return { ok: true, mode: "strict", expectedTokens, missingTokens: [] };
  }
  const hayTokens = new Set(patternLabelTokens(hay));
  const missing = expectedTokens.filter((t) => !hayTokens.has(t));
  if (expectedTokens.length > 0 && missing.length === 0) {
    return { ok: true, mode: "tokens", expectedTokens, missingTokens: [] };
  }
  return { ok: false, mode: "miss", expectedTokens, missingTokens: missing };
}
