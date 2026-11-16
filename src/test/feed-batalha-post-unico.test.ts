/**
 * Contrato da migration que deixa um único post no feed de vitórias por
 * batalha concluída (antes: tr_victory_battle + tr_notify_battle_victory
 * gravavam 2 posts "Campeão da Arena!" na mesma transição).
 *
 * O comportamento foi provado em Postgres 16 (antes: 2 posts por conclusão,
 * 4 ao reabrir/reconcluir; depois: 1). Aqui travamos o contrato estático para
 * que nenhuma migration posterior recrie o segundo caminho nem remova a
 * guarda de idempotência.
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../../supabase/migrations');
const FIX_FILE = '20261112190000_feed_batalha_post_unico.sql';

const stripComments = (sql: string) =>
  sql
    .split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n');

const fixSql = stripComments(
  fs.readFileSync(path.join(MIGRATIONS_DIR, FIX_FILE), 'utf8')
);

const battleBranch = (() => {
  const start = fixSql.indexOf("ELSIF TG_TABLE_NAME = 'sales_battles'");
  const end = fixSql.indexOf('RETURN NEW;', start);
  return fixSql.slice(start, end);
})();

describe('migration feed_batalha_post_unico', () => {
  it('remove o trigger duplicado tr_victory_battle de forma idempotente', () => {
    expect(fixSql).toMatch(
      /DROP\s+TRIGGER\s+IF\s+EXISTS\s+tr_victory_battle\s+ON\s+public\.sales_battles\s*;/i
    );
  });

  it('nenhuma migration posterior recria tr_victory_battle', () => {
    const later = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(name => name.endsWith('.sql') && name > FIX_FILE)
      .filter(name =>
        /CREATE\s+(OR\s+REPLACE\s+)?TRIGGER\s+tr_victory_battle\b/i.test(
          stripComments(fs.readFileSync(path.join(MIGRATIONS_DIR, name), 'utf8'))
        )
      );
    expect(later).toEqual([]);
  });

  it('fn_notify_victory vira o caminho único e idempotente por battle_id', () => {
    expect(fixSql).toMatch(
      /CREATE\s+OR\s+REPLACE\s+FUNCTION\s+public\.fn_notify_victory\(\)/i
    );
    expect(battleBranch).toMatch(/OLD\.status\s+IS\s+DISTINCT\s+FROM\s+'completed'/i);
    expect(battleBranch).toMatch(/NEW\.winner_id\s+IS\s+NOT\s+NULL/i);
    expect(battleBranch).toMatch(
      /NOT\s+EXISTS\s*\([\s\S]*public\.victory_feed[\s\S]*metadata\s*->>\s*'battle_id'\s*=\s*NEW\.id::text/i
    );
    expect(battleBranch).toMatch(/jsonb_build_object\('battle_id',\s*NEW\.id\)/i);
  });

  it('mantém SECURITY INVOKER e search_path fixo', () => {
    expect(fixSql).not.toMatch(/SECURITY\s+DEFINER/i);
    expect(fixSql).toMatch(/SET\s+search_path\s+TO\s+'public'/i);
  });
});
