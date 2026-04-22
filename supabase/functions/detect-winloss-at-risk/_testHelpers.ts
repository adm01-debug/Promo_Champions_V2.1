/**
 * Shared helpers for scenario / catalog tests.
 * No Deno-specific imports — keeps test files focused on assertions.
 */

export function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/** Normalize `actionIncludes` to a needle list (single string → [string]).
 *  Empty / whitespace-only strings are filtered out so callers can rely on
 *  `length > 0` as a proxy for "this scenario actually asserts something". */
export function actionNeedles(a: string | string[] | undefined): string[] {
  if (a === undefined) return [];
  const arr = Array.isArray(a) ? a : [a];
  return arr.filter((s) => typeof s === "string" && s.trim().length > 0);
}

/** True when `actionIncludes` is declared AND yields at least one non-empty needle.
 *  Used by anti-regression tests to forbid `actionIncludes: []` or `""` on
 *  included scenarios (which would silently bypass the substring assertion). */
export function hasMeaningfulActionIncludes(a: string | string[] | undefined): boolean {
  return a !== undefined && actionNeedles(a).length > 0;
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
