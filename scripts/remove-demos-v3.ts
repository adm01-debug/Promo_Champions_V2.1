// Delete demo salespeople + all their associated sales/activities/achievements
// /battle_participants/activity_goals. This is destructive for the demo
// rows but preserves admin + real names.
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
const demoIds = (people ?? []).filter((p) => p.name !== ADMIN_NAME && /^Vendedor Demo/i.test(p.name)).map((p) => p.id);
const realCount = (people ?? []).length - demoIds.length;
log(`demo ids to delete: ${demoIds.length}, real to keep: ${realCount}`);

if (demoIds.length === 0) {
  log('nothing to do');
  process.exit(0);
}

// Delete associated rows that FK to salespeople, in batch (PostgREST handles
// the FK on cascade or the simple bulk delete).
log('delete activities owned by demos');
const { error: eActs } = await sb.from('activities').delete().in('salesperson_id', demoIds);
log(`  → ${eActs ? 'ERR ' + eActs.message : 'ok'}`);

log('delete tasks owned by demos');
const { error: eTasks } = await sb.from('tasks').delete().in('salesperson_id', demoIds);
log(`  → ${eTasks ? 'ERR ' + eTasks.message : 'ok'}`);

log('delete achievements owned by demos');
const { error: eAch } = await sb.from('achievements').delete().in('salesperson_id', demoIds);
log(`  → ${eAch ? 'ERR ' + eAch.message : 'ok'}`);

log('delete battle_participants owned by demos');
const { error: eBp } = await sb.from('battle_participants').delete().in('salesperson_id', demoIds);
log(`  → ${eBp ? 'ERR ' + eBp.message : 'ok'}`);

log('delete activity_goals owned by demos');
const { error: eAg } = await sb.from('activity_goals').delete().in('salesperson_id', demoIds);
log(`  → ${eAg ? 'ERR ' + eAg.message : 'ok'}`);

// Sales have 3 FK columns (salesperson_id, sdr_id, closer_id). For each
// demo id, null out whichever columns it's in (instead of cascade-deleting
// all sales — that would be lossy). We'll do this row-by-row on sales.
log('nulling demo refs in sales');
let salesTouched = 0;
const { data: salesRows } = await sb.from('sales').select('id, salesperson_id, sdr_id, closer_id').or(
  `salesperson_id.in.(${demoIds.join(',')}),sdr_id.in.(${demoIds.join(',')}),closer_id.in.(${demoIds.join(',')})`,
).limit(5000);
log(`  sales referencing demos: ${salesRows?.length ?? 0}`);
const admin = (people ?? []).find((p) => p.name === ADMIN_NAME);
const sdrFallback = (people ?? []).find((p) => p.role === 'sdr' && !demoIds.includes(p.id));
const closerFallback = (people ?? []).find((p) => p.role === 'closer' && !demoIds.includes(p.id));

// Group rows by id to do single update per row
const updatesById = new Map<string, { salesperson_id?: string; sdr_id?: string | null; closer_id?: string }>();
for (const r of salesRows ?? []) {
  const cur = updatesById.get(r.id) ?? {};
  if (r.salesperson_id && demoIds.includes(r.salesperson_id)) cur.salesperson_id = admin?.id;
  if (r.sdr_id && demoIds.includes(r.sdr_id)) cur.sdr_id = sdrFallback?.id ?? null;
  if (r.closer_id && demoIds.includes(r.closer_id)) cur.closer_id = closerFallback?.id ?? admin?.id;
  if (Object.keys(cur).length) updatesById.set(r.id, cur);
}

let okUpdates = 0;
let failedUpdates = 0;
for (const [id, patch] of updatesById) {
  // Convert undefined → no-op; null is allowed for sdr_id
  const clean: any = {};
  if (patch.salesperson_id !== undefined) clean.salesperson_id = patch.salesperson_id;
  if (patch.sdr_id !== undefined) clean.sdr_id = patch.sdr_id;
  if (patch.closer_id !== undefined) clean.closer_id = patch.closer_id;
  const { error } = await sb.from('sales').update(clean).eq('id', id);
  if (error) failedUpdates++;
  else okUpdates++;
}
log(`  sales re-pointed: ok=${okUpdates} failed=${failedUpdates}`);
salesTouched = okUpdates;

// Final check: any remaining demo refs?
async function stillDemo(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const [t, cols] of Object.entries({
    sales: ['salesperson_id', 'sdr_id', 'closer_id'],
    activities: ['salesperson_id'],
    tasks: ['salesperson_id'],
    achievements: ['salesperson_id'],
    battle_participants: ['salesperson_id'],
    activity_goals: ['salesperson_id'],
  })) {
    let n = 0;
    for (const c of cols) {
      const { data } = await sb.from(t).select('id').in(c, demoIds).limit(5000);
      n += data?.length ?? 0;
    }
    out[t] = n;
  }
  return out;
}
log('residual demo refs:', await stillDemo());

// Delete demo salespeople
log(`deleting ${demoIds.length} demo salespeople`);
const { error: delErr, count } = await sb.from('salespeople').delete({ count: 'exact' }).in('id', demoIds);
if (delErr) {
  log('DELETE failed:', delErr.message);
  process.exit(1);
}
log(`  → deleted ${count} rows`);

const { data: finalRoster } = await sb.from('salespeople').select('id, name, role').order('name');
console.log('\nFinal roster:');
for (const p of finalRoster ?? []) {
  const isAdmin = p.name === ADMIN_NAME;
  console.log(`  ${isAdmin ? '🛡️' : '  '} ${p.name.padEnd(28)} ${p.role}`);
}
log('\n✅ done');
process.exit(0);