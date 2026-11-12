/**
 * Contrato: funções SQL que medem atividade real de um deal/gravação não
 * podem contar `activities` apagadas por soft delete (deleted_at).
 *
 * Replay estático das migrations (mesmo padrão de rolePermissions.test.ts):
 * para cada função, a ÚLTIMA migration que a (re)cria vale como definição
 * viva — e todo SELECT em public.activities dela precisa filtrar
 * `deleted_at IS NULL`. Uma migration futura que recrie a função sem o
 * filtro quebra este teste.
 *
 * A prova de comportamento (antes/depois em Postgres 16) está na PR de
 * 20261112190200_funcoes_activities_ignoram_soft_delete.sql.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../../supabase/migrations');

const FUNCTIONS = [
  'calculate_deal_health',
  'compute_pipeline_inspection',
  'create_activities_from_action_items',
  'get_semantic_coverage',
] as const;

/** Corpo ($$ … $$) da última definição de `fn` nas migrations, com o arquivo. */
function lastDefinition(fn: string): { file: string; body: string } {
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
  const re = new RegExp(
    `CREATE\\s+OR\\s+REPLACE\\s+FUNCTION\\s+public\\.${fn}\\s*\\([\\s\\S]*?AS\\s+\\$\\$([\\s\\S]*?)\\$\\$`,
    'gi'
  );
  let found: { file: string; body: string } | null = null;
  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    for (const m of sql.matchAll(re)) found = { file, body: m[1]! };
  }
  if (!found) throw new Error(`nenhuma migration define public.${fn}`);
  return found;
}

/** Cada trecho que lê public.activities, até o fim do comando/subquery. */
function activityReads(body: string): string[] {
  return [...body.matchAll(/FROM\s+public\.activities\b[^;)]*/gi)].map(m => m[0]);
}

describe('funções SQL ignoram activities apagadas (soft delete)', () => {
  it.each(FUNCTIONS)('%s: toda leitura de activities filtra deleted_at IS NULL', fn => {
    const { file, body } = lastDefinition(fn);
    const reads = activityReads(body);
    expect(
      reads.length,
      `${fn} em ${file} deveria ler public.activities`
    ).toBeGreaterThan(0);
    for (const read of reads) {
      expect(read, `${fn} em ${file}`).toMatch(/deleted_at\s+IS\s+NULL/i);
    }
  });

  it('a correção não desfaz o status canônico nem o alias anti-ambiguidade', () => {
    expect(lastDefinition('compute_pipeline_inspection').body).toContain(
      "status NOT IN ('completed','won','closed','lost','cancelled')"
    );
    const coverage = lastDefinition('get_semantic_coverage').body;
    expect(coverage).toMatch(/FROM\s+public\.semantic_index\s+si\b/);
    expect(coverage).toMatch(/GROUP\s+BY\s+si\.entity_type/);
  });
});
