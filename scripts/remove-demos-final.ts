import { createClient } from '@supabase/supabase-js';
const url = 'https://usyxfpqlsspldubptrdl.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeXhmcHFsc3NwbGR1YnB0cmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgyMDg4MiwiZXhwIjoyMTAxMzk2ODgyfQ.gHonefmUBT3BQGT7EgnJ41vBKc-fTso1audID5FNBoo';
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const ADMIN = 'Administrador Promo Brindes';
const log = (...a) => console.log('•', ...a);

const { data: people } = await sb.from('salespeople').select('id, name, role');
const demoIds = (people ?? []).filter(p => p.name !== ADMIN && /^Vendedor Demo/i.test(p.name)).map(p => p.id);
const real = (people ?? []).filter(p => p.name === ADMIN || !/^Vendedor Demo/i.test(p.name));
const admin = real.find(p => p.name === ADMIN)!;
const sdrFb = real.find(p => p.role === 'sdr') ?? admin;
const closerFb = real.find(p => p.role === 'closer') ?? admin;
log(`demo ids: ${demoIds.length}, real: ${real.length}`);

// 1) delete demo-only dependent rows in bulk
for (const [t, c] of [
  ['activities', 'salesperson_id'],
  ['tasks', 'salesperson_id'],
  ['achievements', 'salesperson_id'],
  ['battle_participants', 'salesperson_id'],
  ['activity_goals', 'salesperson_id'],
] as const) {
  const { error } = await sb.from(t).delete().in(c, demoIds);
  log(`  delete ${t}.${c}: ${error ? 'ERR ' + error.message : 'ok'}`);
}

// 2) null out demo refs in sales (which has FK with NOT NULL)
log('re-pointing sales rows');
let ok = 0, bad = 0;
const { data: salesRows } = await sb.from('sales').select('id, salesperson_id, sdr_id, closer_id').or(
  `salesperson_id.in.(${demoIds.join(',')}),sdr_id.in.(${demoIds.join(',')}),closer_id.in.(${demoIds.join(',')})`,
).limit(5000);
log(`  rows to update: ${salesRows?.length ?? 0}`);
for (const r of salesRows ?? []) {
  const patch: any = {};
  if (r.salesperson_id && demoIds.includes(r.salesperson_id)) patch.salesperson_id = admin.id;
  if (r.closer_id && demoIds.includes(r.closer_id)) patch.closer_id = closerFb.id;
  if (r.sdr_id && demoIds.includes(r.sdr_id)) patch.sdr_id = sdrFb.id;
  if (Object.keys(patch).length === 0) continue;
  const { error } = await sb.from('sales').update(patch).eq('id', r.id);
  if (error) bad++; else ok++;
}
log(`  sales re-pointed: ok=${ok} bad=${bad}`);

// 3) finally delete demos
const { error: delErr, count } = await sb.from('salespeople').delete({ count: 'exact' }).in('id', demoIds);
log(`delete demos: ${delErr ? 'ERR ' + delErr.message : 'ok, deleted=' + count}`);

const { data: final } = await sb.from('salespeople').select('id, name, role').order('name');
console.log('\nFinal roster:');
for (const p of final ?? []) console.log(`  ${p.name === ADMIN ? '🛡️' : '  '} ${p.name.padEnd(28)} ${p.role}`);
process.exit(0);
