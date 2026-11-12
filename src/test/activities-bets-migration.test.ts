/**
 * Regressão da migration de apostas de performance (soft-delete de atividades).
 *
 * Validado em Postgres 16 com o schema do snapshot: antes da correção, com 1 aposta
 * 'revenue' ativa, TODO INSERT em sales falhava (`record "new" has no field "value"`,
 * trigger tr_update_bets_on_sale) e a aposta ganha pelo recálculo global creditava o
 * XP 2x (UPDATE em salesperson_xp + INSERT em xp_history, cujo trigger soma de novo).
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION = path.resolve(
  __dirname,
  '../../supabase/migrations/20261112140200_activities_soft_delete_apostas_placar.sql'
);
// Só código: comentários citam de propósito as colunas/tabelas erradas.
const sql = fs.readFileSync(MIGRATION, 'utf8').replace(/--.*$/gm, '');

function functionBody(name: string): string {
  const start = sql.indexOf(`CREATE OR REPLACE FUNCTION ${name}(`);
  expect(start, `função ${name} ausente na migration`).toBeGreaterThanOrEqual(0);
  const end = sql.indexOf('$function$\n;', start);
  return sql.slice(start, end);
}

describe('migration 20261112140200 — apostas de performance', () => {
  it('remove os dois triggers de process_performance_bet_event (activities e sales)', () => {
    expect(sql).toMatch(
      /DROP TRIGGER IF EXISTS tr_update_bets_on_activity ON public\.activities;/
    );
    expect(sql).toMatch(
      /DROP TRIGGER IF EXISTS tr_update_bets_on_sale ON public\.sales;/
    );
    expect(sql).not.toMatch(/NEW\.value/);
  });

  it('update_performance_bet_progress credita XP da aposta ganha só via xp_history', () => {
    const body = functionBody('private.update_performance_bet_progress');
    const wonBranch = body.slice(
      body.indexOf('IF progress_val >= bet_record.target_value'),
      body.indexOf('ELSIF now() > bet_record.ends_at')
    );
    expect(wonBranch).toMatch(/INSERT INTO public\.xp_history/);
    expect(wonBranch).not.toMatch(/UPDATE public\.salesperson_xp/);
  });

  it('handle_performance_update credita XP só via xp_history', () => {
    const body = functionBody('private.handle_performance_update');
    expect(body).toMatch(/INSERT INTO public\.xp_history/);
    expect(body).not.toMatch(/salesperson_xp|xp_transactions/);
  });
});
