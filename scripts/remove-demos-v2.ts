// Re-point sales/activities FK references off demo salespeople, then delete
// the demo rows. Done row-by-row with skip-on-error so an audit_log trigger
// bug on one row doesn't abort the rest of the batch.
import { createClient } from '@supabase/supabase-js';

const url = 'https://usyxfpqlsspldubptrdl.supabase.co';
const key =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeXhmcHFsc3NwbGR1YnB0cmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgyMDg4MiwiZXhwIjoyMTAxMzk2ODgyfQ.gHonefmUBT3BQGT7EgnJ41vBKc-fTso1audID5FNBoo';

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const log = (...a) => console.log('•', ...a);
const ADMIN_NAME = 'Administrador Promo Brindes';

const { data: people } = await sb.from('salespeople').select('id, name, role');
const demoIds = new Set(
  (people ?? []).filter((p) => p.name !== ADMIN_NAME && /^Vendedor Demo/i.test(p.name)).map((p) => p.id),
);
const real = (people ?? []).filter((p) => !demoIds.has(p.id));
const admin = real.find((p) => p.name === ADMIN_NAME)!;
const sdrFallback = real.find((p) => p.role === 'sdr') ?? admin;
const closerFallback = real.find((p) => p.role === 'closer') ?? admin;
log(`demo ids: ${demoIds.size}, real: ${real.length}`);

// Per-row updates (so one failure doesn't abort others)
async function repointRowByRow(table: string, col: string, fallback: string) {
  // Use a server-side filter via .in, but iterate in small chunks
  const { data: rows } = await sb.from(table).select('id').in(col, [...demoIds]).limit(1000);
  let ok = 0;
  let bad = 0;
  for (const r of rows ?? []) {
    const { error } = await sb.from(table).update({ [col]: fallback }).eq('id', r.id);
    if (error) bad++;
    else ok++;
  }
  log(`  ${table}.${col}: ok=${ok} bad=${bad}`);
  return ok;
}

log('re-pointing sales.salesperson_id → admin');
await repointRowByRow('sales', 'salesperson_id', admin.id);
log('re-pointing sales.closer_id → closer fallback');
await repointRowByRow('sales', 'closer_id', closerFallback.id);
log('re-pointing sales.sdr_id → SDR fallback');
await repointRowByRow('sales', 'sdr_id', sdrFallback.id);
log('re-pointing activities.salesperson_id → admin');
await repointRowByRow('activities', 'salesperson_id', admin.id);

// Refresh: who still references a demo id?
async function stillDemo() {
  const out: Record<string, number> = {};
  for (const t of ['sales', 'activities', 'tasks']) {
    const cols = t === 'sales' ? ['salesperson_id', 'sdr_id', 'closer_id'] : ['salesperson_id'];
    let n = 0;
    for (const c of cols) {
      const { data } = await sb.from(t).select('id').in(c, [...demoIds]).limit(5000);
      n += data?.length ?? 0;
    }
    out[t] = n;
  }
  return out;
}
log('checking residual demo refs:', await stillDemo());

// Delete demo rows
log(`deleting ${demoIds.size} demo salespeople`);
let deleteOk = 0;
let deleteBad = 0;
for (const id of demoIds) {
  const { error } = await sb.from('salespeople').delete().eq('id', id);
  if (error) {
    deleteBad++;
    log(`  could not delete ${id}: ${error.message}`);
  } else deleteOk++;
}
log(`delete: ok=${deleteOk} bad=${deleteBad}`);

const { data: finalRoster } = await sb.from('salespeople').select('id, name, role').order('name');
console.log('\nFinal roster:');
for (const p of finalRoster ?? []) {
  const isAdmin = p.name === ADMIN_NAME;
  console.log(`  ${isAdmin ? '🛡️' : '  '} ${p.name.padEnd(28)} ${p.role}`);
}
log('\n✅ done');
process.exit(0);