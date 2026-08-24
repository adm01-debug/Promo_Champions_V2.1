// Remove demo salespeople (Vendedor Demo N) and re-point sales/activities/tasks
// that referenced them so the demo ids don't leave orphaned FK references.
// Keeps admin + real names.
import { createClient } from '@supabase/supabase-js';

const url = 'https://usyxfpqlsspldubptrdl.supabase.co';
const key =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeXhmcHFsc3NwbGR1YnB0cmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgyMDg4MiwiZXhwIjoyMTAxMzk2ODgyfQ.gHonefmUBT3BQGT7EgnJ41vBKc-fTso1audID5FNBoo';

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const log = (...a) => console.log('•', ...a);

const { data: people, error } = await sb.from('salespeople').select('id, name, role');
if (error) throw error;

const ADMIN_NAME = 'Administrador Promo Brindes';
const demoIds = (people ?? [])
  .filter((p) => p.name !== ADMIN_NAME && /^Vendedor Demo/i.test(p.name))
  .map((p) => p.id);

const realPeople = (people ?? []).filter(
  (p) => p.name === ADMIN_NAME || !/^Vendedor Demo/i.test(p.name),
);
log(`demo ids: ${demoIds.length}, real people to keep: ${realPeople.length}`);

if (demoIds.length === 0) {
  log('nothing to do');
  process.exit(0);
}

// Pick a fallback closer and SDR for orphaned references.
const fallbackCloser = realPeople.find((p) => p.role === 'closer') ?? realPeople[0];
const fallbackSdr = realPeople.find((p) => p.role === 'sdr') ?? realPeople[0];
const fallbackAny = realPeople[0];
if (!fallbackCloser || !fallbackAny) throw new Error('no real salespeople to fall back on');

async function nullOut(table: string, col: string, ids: string[]) {
  // For each demo id, re-point to a real closer; if column is optional, set null
  // where the column allows nulls. Here we re-point to the admin to be safe.
  for (const id of ids) {
    const { error } = await sb.from(table).update({ [col]: fallbackCloser.id }).eq(col, id);
    if (error) console.error(`  warn re-point ${table}.${col}`, id, error.message);
  }
  return ids.length;
}

// Re-point sales columns that reference salespeople (FK)
log('re-pointing sales.salesperson_id → admin');
const { error: e1 } = await sb.from('sales').update({ salesperson_id: fallbackCloser.id }).in('salesperson_id', demoIds);
if (e1) console.error('  warn sales.salesperson_id:', e1.message);
log('re-pointing sales.closer_id → admin');
const { error: e2 } = await sb.from('sales').update({ closer_id: fallbackCloser.id }).in('closer_id', demoIds);
if (e2) console.error('  warn sales.closer_id:', e2.message);
log('re-pointing sales.sdr_id → SDR (or null)');
const { error: e3 } = await sb.from('sales').update({ sdr_id: fallbackSdr.id }).in('sdr_id', demoIds);
if (e3) console.error('  warn sales.sdr_id:', e3.message);

// Re-point activities.salesperson_id
log('re-pointing activities.salesperson_id → admin');
const { error: e4 } = await sb.from('activities').update({ salesperson_id: fallbackCloser.id }).in('salesperson_id', demoIds);
if (e4) console.error('  warn activities:', e4.message);

// Re-point tasks.salesperson_id
log('re-pointing tasks.salesperson_id → admin');
const { error: e5 } = await sb.from('tasks').update({ salesperson_id: fallbackCloser.id }).in('salesperson_id', demoIds);
if (e5) console.error('  warn tasks:', e5.message);

// Re-point achievements.salesperson_id (delete is safer — these are decorative)
log('deleting achievements of demos');
const { error: e6 } = await sb.from('achievements').delete().in('salesperson_id', demoIds);
if (e6) console.error('  warn achievements:', e6.message);

// battle_participants FK -> salespeople (delete or re-point)
log('deleting battle_participants of demos');
const { error: e7 } = await sb.from('battle_participants').delete().in('salesperson_id', demoIds);
if (e7) console.error('  warn battle_participants:', e7.message);

// activity_goals -> salespeople (delete; FK from real people is separate)
log('deleting activity_goals of demos');
const { error: e8 } = await sb.from('activity_goals').delete().in('salesperson_id', demoIds);
if (e8) console.error('  warn activity_goals:', e8.message);

// Finally delete the demo salespeople
log(`deleting ${demoIds.length} demo salespeople`);
const { error: delErr } = await sb.from('salespeople').delete().in('id', demoIds);
if (delErr) {
  console.error('delete failed:', delErr.message);
  process.exit(1);
}

const { data: finalRoster } = await sb.from('salespeople').select('id, name, role').order('name');
console.log('\nFinal roster:');
for (const p of finalRoster ?? []) {
  const isAdmin = p.name === ADMIN_NAME;
  console.log(`  ${isAdmin ? '🛡️' : '  '} ${p.name.padEnd(28)} ${p.role}`);
}
log('\n✅ done');
process.exit(0);