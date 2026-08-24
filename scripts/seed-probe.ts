import { createClient } from '@supabase/supabase-js';
const url = 'https://usyxfpqlsspldubptrdl.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeXhmcHFsc3NwbGR1YnB0cmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgyMDg4MiwiZXhwIjoyMTAxMzk2ODgyfQ.gHonefmUBT3BQGT7EgnJ41vBKc-fTso1audID5FNBoo';
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

// Check Aug sales + distribution
const { data: aug } = await sb.from('sales').select('salesperson_id, amount, status')
  .eq('client_name', '__aug2026__').gte('created_at', '2026-08-01').lt('created_at', '2026-09-01');
console.log(`Aug sales: ${aug?.length ?? 0}`);

const bySeller: Record<string, { won: number; lost: number; rev: number }> = {};
for (const s of aug ?? []) {
  const { data: sp } = await sb.from('salespeople').select('name').eq('id', s.salesperson_id).single();
  const name = sp?.name ?? '?';
  if (!bySeller[name]) bySeller[name] = { won: 0, lost: 0, rev: 0 };
  if (s.status === 'won') { bySeller[name].won++; bySeller[name].rev += s.amount; }
  else if (s.status === 'lost') bySeller[name].lost++;
}
console.log('\nAugust 2026:');
for (const [name, v] of Object.entries(bySeller).sort((a,b) => b[1].rev - a[1].rev)) {
  console.log(`  ${name.padEnd(14)} won=${String(v.won).padStart(2)} lost=${v.lost} rev=R$ ${v.rev.toFixed(2)}`);
}

// Try inserting one activity with the same shape
const { data: real } = await sb.from('salespeople').select('id').eq('is_active', true).limit(1).single();
const { data: c } = await sb.from('clients').select('id').limit(1).single();
const { error } = await sb.from('activities').insert({
  salesperson_id: real!.id,
  activity_type: 'call',
  outcome: 'connected',
  notes: '__probe__',
  duration_minutes: 10,
  client_id: c!.id,
  created_at: '2026-08-15T12:00:00Z',
});
console.log('\nActivity probe:', error?.message ?? 'ok');
process.exit(0);
