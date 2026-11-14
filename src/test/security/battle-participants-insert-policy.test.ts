/**
 * Regressão: criar batalha (useSalesBattles.createBattle) insere >= 2
 * vendedores em battle_participants. Só admin/gestor cria batalha
 * ("Admins can manage battles" em sales_battles), então precisa existir
 * policy de INSERT viva em battle_participants que libere admin/gestor —
 * a auto-inscrição (salesperson_id = get_current_salesperson_id()) sozinha
 * recusa a linha do outro vendedor e nenhuma batalha é criada.
 *
 * Replay estático das migrations em ordem de nome: CREATE POLICY registra,
 * DROP POLICY desfaz (mesmo padrão de src/hooks/rolePermissions.test.ts).
 */
import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../../../supabase/migrations');
const TABLE = 'battle_participants';

interface LivePolicy {
  action: string;
  body: string;
}

function livePolicies(): Map<string, LivePolicy> {
  const live = new Map<string, LivePolicy>();
  const createRe =
    /CREATE\s+POLICY(?:\s+IF\s+NOT\s+EXISTS)?\s+"([^"]+)"\s+ON\s+(?:public\.)?(\w+)([^;]*);/gi;
  const dropRe =
    /DROP\s+POLICY(?:\s+IF\s+EXISTS)?\s+"([^"]+)"\s+ON\s+(?:public\.)?(\w+)/gi;
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const events: { index: number; apply: () => void }[] = [];
    for (const m of sql.matchAll(createRe)) {
      if (m[2]!.toLowerCase() !== TABLE) continue;
      const rest = m[3]!;
      const action =
        /\bFOR\s+(ALL|SELECT|INSERT|UPDATE|DELETE)\b/i.exec(rest)?.[1] ?? 'ALL';
      events.push({
        index: m.index!,
        apply: () => live.set(m[1]!, { action: action.toUpperCase(), body: rest }),
      });
    }
    for (const m of sql.matchAll(dropRe)) {
      if (m[2]!.toLowerCase() !== TABLE) continue;
      events.push({ index: m.index!, apply: () => live.delete(m[1]!) });
    }
    events.sort((a, b) => a.index - b.index).forEach(e => e.apply());
  }
  return live;
}

describe('battle_participants — INSERT para admin/gestor', () => {
  it('existe policy de INSERT viva liberando is_admin_or_manager(auth.uid())', () => {
    const policies = [...livePolicies().values()];
    const gestorInsert = policies.filter(
      p =>
        (p.action === 'INSERT' || p.action === 'ALL') &&
        /WITH\s+CHECK\s*\(\s*(?:public\.)?is_admin_or_manager\s*\(\s*auth\.uid\(\)\s*\)\s*\)/i.test(
          p.body
        )
    );
    expect(gestorInsert.length).toBeGreaterThan(0);
  });

  it('vendedor continua limitado à auto-inscrição', () => {
    const self = livePolicies().get('Users can join battles as self');
    expect(self?.action).toBe('INSERT');
    expect(self?.body).toMatch(
      /salesperson_id\s*=\s*(?:public\.)?get_current_salesperson_id\(\)/i
    );
  });
});
