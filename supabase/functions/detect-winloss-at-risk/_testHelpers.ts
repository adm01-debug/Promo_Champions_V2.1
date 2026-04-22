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
