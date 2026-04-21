/**
 * Shared helpers for scenario / catalog tests.
 * No Deno-specific imports — keeps test files focused on assertions.
 */

export function includesCI(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

/** Normalize `actionIncludes` to a needle list (single string → [string]). */
export function actionNeedles(a: string | string[] | undefined): string[] {
  if (a === undefined) return [];
  return Array.isArray(a) ? a : [a];
}
