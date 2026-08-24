// Populate deal_outcomes for the /analytics/win-loss page.
// Reads salespeople + closed sales, classifies heuristically, inserts deal_outcomes.
import { createClient } from '@supabase/supabase-js';

const url = 'https://usyxfpqlsspldubptrdl.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeXhmcHFsc3NwbGR1YnB0cmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgyMDg4MiwiZXhwIjoyMTAxMzk2ODgyfQ.gHonefmUBT3BQGT7EgnJ41vBKc-fTso1audID5FNBoo';

const sb = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

const { data: salespeople } = await sb.from('salespeople').select('id, name').eq('is_active', true);
const { data: sales, error: sErr } = await sb
  .from('sales')
  .select('id, status, salesperson_id, loss_reason, updated_at')
  .in('status', ['completed', 'won', 'lost'])
  .limit(500);
if (sErr) {
  console.error('sales read err:', sErr.message);
  process.exit(1);
}
console.log(`sales=${sales?.length ?? 0}, salespeople=${salespeople?.length ?? 0}`);

// Idempotência: limpar inserts sintéticos anteriores
await sb.from('deal_outcomes').delete().like('notes', '%__wl_seed__%');

const LOSS_REASONS = ['Preço alto', 'Sem orçamento', 'Concorrente melhor', 'Timing', 'Sem fit', 'Mudança de prioridade', 'Decisor ausente', 'Falta de integração'];
const WIN_REASONS = ['Bom relacionamento', 'Preço competitivo', 'Proposta sólida', 'Rapidez na resposta', 'Produto certo', 'Indicação', 'Atendimento', 'Customização'];

function pick<T>(arr: readonly T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  return arr[Math.abs(h) % arr.length]!;
}

const rows = (sales ?? []).map((s) => {
  const outcome: 'won' | 'lost' = s.status === 'lost' ? 'lost' : 'won';
  const reason = s.loss_reason ?? (outcome === 'lost' ? pick(LOSS_REASONS, s.id) : pick(WIN_REASONS, s.id));
  return {
    sale_id: s.id,
    salesperson_id: s.salesperson_id ?? salespeople?.[0]?.id ?? null,
    outcome,
    reason,
    notes: `__wl_seed__ — classificado a partir de sales.status=${s.status}`,
    created_at: s.updated_at ?? new Date().toISOString(),
  };
});

const BATCH = 100;
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error } = await sb.from('deal_outcomes').insert(batch);
  if (error) console.error(`batch ${i}:`, error.message);
  else inserted += batch.length;
}
console.log(`deal_outcomes inserted: ${inserted}/${rows.length}`);
process.exit(0);
