// Guard-rail estático: atividade excluída (soft-delete via `deleted_at`) não pode aparecer
// nem contar em tela nenhuma. A RLS de SELECT de `activities` não filtra `deleted_at`
// (o UPDATE...RETURNING do soft-delete depende disso), então TODA leitura
// `.from('activities').select(...)` no front precisa de `.is('deleted_at', null)` na cadeia.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RE_FROM_ACTIVITIES = /\.from\(\s*['"]activities['"]\s*\)/g;
const RE_WRITE = /^\s*\.(insert|update|upsert|delete)\(/;

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (
      (p.endsWith('.ts') || p.endsWith('.tsx')) &&
      !/\.(test|spec)\.tsx?$/.test(p) &&
      !p.endsWith('types.ts')
    )
      out.push(p);
  }
  return out;
}

/** Trecho da cadeia que começa em `start`, até `;`, `,` ou `)` fora de parênteses. */
function chainFrom(src: string, start: number) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const ch = src[i];
    if (ch === '(') depth++;
    else if (ch === ')') {
      if (depth === 0) return src.slice(start, i);
      depth--;
    } else if ((ch === ';' || ch === ',') && depth === 0) return src.slice(start, i);
  }
  return src.slice(start);
}

describe('soft-delete de activities — guard-rail', () => {
  it('toda leitura de activities no front filtra deleted_at IS NULL', () => {
    const offenders: string[] = [];
    let reads = 0;
    for (const file of walk('src')) {
      const src = readFileSync(file, 'utf8');
      for (const match of src.matchAll(RE_FROM_ACTIVITIES)) {
        const rest = src.slice((match.index ?? 0) + match[0].length);
        if (RE_WRITE.test(rest)) continue;
        reads++;
        const chain = chainFrom(src, (match.index ?? 0) + match[0].length);
        if (!/\.is\(\s*['"]deleted_at['"]\s*,\s*null\s*\)/.test(chain)) {
          const line = src.slice(0, match.index).split('\n').length;
          offenders.push(`${file}:${line}`);
        }
      }
    }
    expect(reads).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});
