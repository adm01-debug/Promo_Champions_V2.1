import { createClient } from '@supabase/supabase-js';
import { requireSupabaseAdminEnv } from './lib/requireSupabaseAdminEnv';
const { supabaseUrl: url, serviceRoleKey: key } = requireSupabaseAdminEnv();
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const log = (...a) => console.log(new Date().toISOString(), '•', ...a);

const { data: people } = await sb.from('salespeople').select('id, name, role');
const ADMIN = 'Administrador Promo Brindes';
const demoIds = (people ?? []).filter(p => p.name !== ADMIN && /^Vendedor Demo/i.test(p.name)).map(p => p.id);
const real = (people ?? []).filter(p => p.name === ADMIN || !/^Vendedor Demo/i.test(p.name));
const admin = real.find(p => p.name === ADMIN)!;
const sdrFb = real.find(p => p.role === 'sdr') ?? admin;
const _closerFb = real.find(p => p.role === 'closer') ?? admin;
log('demo ids:', demoIds.length);

// 1) Bulk delete all activities owned by demos
log('bulk delete activities...');
const { error: eActs } = await sb.from('activities').delete().in('salesperson_id', demoIds);
log('  activities:', eActs ? 'ERR ' + eActs.message : 'ok');

// 2) Re-point sales in chunks of 100 using .in() (PostgREST will batch)
log('re-point sales in chunks...');
let totalOk = 0;
let totalBad = 0;
const CHUNK = 100;
const { data: badRows } = await sb.from('sales').select('id, salesperson_id, sdr_id, closer_id').or(
  `salesperson_id.in.(${demoIds.join(',')}),sdr_id.in.(${demoIds.join(',')})`,
).limit(5000);
log('  rows to repoint:', badRows?.length ?? 0);
for (let i = 0; i < (badRows ?? []).length; i += CHUNK) {
  const batch = (badRows ?? []).slice(i, i + CHUNK);
  // Build batch update using RPC would be ideal; instead do per-row with Promise.all
  const results = await Promise.all(batch.map(async (r) => {
    const patch: Record<string, string> = {};
    if (r.salesperson_id && demoIds.includes(r.salesperson_id)) patch.salesperson_id = admin.id;
    if (r.sdr_id && demoIds.includes(r.sdr_id)) patch.sdr_id = sdrFb.id;
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await sb.from('sales').update(patch).eq('id', r.id);
    return { ok: !error };
  }));
  const ok = results.filter(r => r.ok).length;
  const bad = results.length - ok;
  totalOk += ok;
  totalBad += bad;
  if (i % 500 === 0) log(`  progress: ${i}/${badRows?.length} ok=${totalOk} bad=${totalBad}`);
}
log(`  done: ok=${totalOk} bad=${totalBad}`);

// 3) Verify residual
const { count: sLeft } = await sb.from('sales').select('*', { count: 'exact', head: true }).in('salesperson_id', demoIds);
const { count: dLeft } = await sb.from('sales').select('*', { count: 'exact', head: true }).in('sdr_id', demoIds);
log(`residual: sales.salesperson_id=${sLeft} sales.sdr_id=${dLeft}`);

// 4) Delete demos
log('deleting demo salespeople...');
const { error: delErr, count } = await sb.from('salespeople').delete({ count: 'exact' }).in('id', demoIds);
log('  delete:', delErr ? 'ERR ' + delErr.message : `ok, deleted=${count}`);

// 5) Final roster
const { data: final } = await sb.from('salespeople').select('id, name, role').order('name');
console.log('\nFinal roster (' + final?.length + ' people):');
for (const p of final ?? []) console.log(`  ${p.name === ADMIN ? '🛡️' : '  '} ${p.name.padEnd(28)} ${p.role}`);
process.exit(0);
