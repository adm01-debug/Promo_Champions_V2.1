// Seed sales + activities for August 2026 (current month shown in UI).
import { createClient } from '@supabase/supabase-js';

const url = 'https://usyxfpqlsspldubptrdl.supabase.co';
const key =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeXhmcHFsc3NwbGR1YnB0cmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgyMDg4MiwiZXhwIjoyMTAxMzk2ODgyfQ.gHonefmUBT3BQGT7EgnJ41vBKc-fTso1audID5FNBoo';

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const log = (...a) => console.log('•', ...a);

// Clean previous seed (idempotent)
await sb.from('sales').delete().eq('client_name', '__aug2026__');
await sb.from('activities').delete().like('notes', '%__aug2026__%');

const { data: people } = await sb.from('salespeople').select('id, name, role').eq('is_active', true);
const real = (people ?? []).filter(p => p.name !== 'Administrador Promo Brindes');
const { data: clients } = await sb.from('clients').select('id').limit(80);
const clientPool = clients ?? [];
const closerFb = real.find(p => p.role === 'closer') ?? real[0]!;
const sdrFb = real.find(p => p.role === 'sdr') ?? real[0]!;
log(`sellers=${real.length}, clients=${clientPool.length}`);

const PRODUCTS = [
  'Brinde Corporativo','Kit Corporativo','Caneca Premium','Agenda Executiva',
  'Pen Drive Personalizado','Camiseta Polo','Mochila Executiva','Garrafa Térmica',
  'Caderno Personalizado','Ecobag','Squeeze Premium','Bolsa Corporativa',
];

// Targets: total ~R$1.2M won in August
const TARGETS: { name: string; won: number; avg: number; lost: number }[] = [
  { name: 'Gabryelly', won: 18, avg: 28000, lost: 4 },
  { name: 'Andriele',  won: 14, avg: 26000, lost: 3 },
  { name: 'Danyelle',  won: 9,  avg: 27000, lost: 2 },
  { name: 'Vanessa',   won: 3,  avg: 21000, lost: 1 },
  { name: 'Sirlei',    won: 2,  avg: 11000, lost: 1 },
  { name: 'Leticia',   won: 2,  avg:  9000, lost: 1 },
];

const rows: any[] = [];
let seq = 0;
for (const t of TARGETS) {
  const sp = real.find(p => p.name === t.name);
  if (!sp) continue;
  // Won sales — distribute across days 1-31 of August
  for (let i = 0; i < t.won; i++) {
    const day = ((i * 1.7) % 30) + 1;
    const hour = 9 + (i % 8);
    const minute = (i * 13) % 60;
    const dt = new Date(Date.UTC(2026, 7, Math.floor(day), hour, minute));
    const amount = Math.round(t.avg * (0.6 + ((i * 17) % 80) / 100) * 100) / 100;
    const client = clientPool[(seq++) % clientPool.length]!;
    rows.push({
      client_name: '__aug2026__',
      product_name: PRODUCTS[i % PRODUCTS.length],
      amount, status: 'won', category: 'project',
      salesperson_id: sp.id,
      sdr_id: sdrFb.id,
      closer_id: closerFb.id,
      client_id: client.id,
      source: ['outbound','inbound','referral','partner'][i % 4],
      deal_status: 'completed',
      is_first_sale: i === 0,
      created_at: dt.toISOString(),
      updated_at: dt.toISOString(),
    });
  }
  // Lost
  for (let i = 0; i < t.lost; i++) {
    const day = ((i * 2.3) % 30) + 1;
    const dt = new Date(Date.UTC(2026, 7, Math.floor(day), 10 + i, 15));
    const client = clientPool[(seq++) % clientPool.length]!;
    rows.push({
      client_name: '__aug2026__',
      product_name: PRODUCTS[(i + 4) % PRODUCTS.length],
      amount: Math.round(t.avg * 0.5 * 100) / 100,
      status: 'lost', category: 'project',
      salesperson_id: sp.id,
      sdr_id: sdrFb.id,
      closer_id: closerFb.id,
      client_id: client.id,
      source: 'outbound',
      deal_status: 'lost',
      created_at: dt.toISOString(),
      updated_at: dt.toISOString(),
    });
  }
}

// Insert in chunks of 50 (commissions trigger may conflict)
let inserted = 0;
for (let i = 0; i < rows.length; i += 50) {
  const batch = rows.slice(i, i + 50);
  const { error } = await sb.from('sales').insert(batch);
  if (error) {
    console.error('batch err:', error.message);
    // Fall back: insert one-by-one skipping on conflict
    for (const r of batch) {
      const { error: e1 } = await sb.from('sales').insert(r);
      if (!e1) inserted++;
    }
  } else inserted += batch.length;
}
log(`sales inserted: ${inserted}/${rows.length}`);

// Activities — 1 sale_id NULL is fine; we'll generate ~400 activities
const ACTIVITY_TYPES = ['call','email','meeting','whatsapp','linkedin'];
const actRows: any[] = [];
let aseq = 0;
for (let d = 1; d <= 31; d++) {
  for (const sp of real) {
    const n = 1 + (d % 3 === 0 ? 2 : 1);
    for (let i = 0; i < n; i++) {
      const hour = 8 + (i % 8);
      const dt = new Date(Date.UTC(2026, 7, d, hour, (i * 11) % 60));
      const client = clientPool[(aseq++) % clientPool.length]!;
      actRows.push({
        salesperson_id: sp.id,
        activity_type: ACTIVITY_TYPES[i % ACTIVITY_TYPES.length],
        outcome: ['connected','left_message','scheduled','not_interested'][i % 4],
        notes: `Atividade #__aug2026__-${d}-${sp.name.slice(0,3)}-${i}`,
        duration_minutes: 10 + (i * 5),
        contact_name: client.name,
        client_id: client.id,
        lead_status: ['opportunity','qualified','new','contacted'][i % 4],
        qualification_score: 20 + (i * 13) % 70,
        created_at: dt.toISOString(),
      });
    }
  }
}
let aInserted = 0;
for (let i = 0; i < actRows.length; i += 100) {
  const batch = actRows.slice(i, i + 100);
  const { error } = await sb.from('activities').insert(batch);
  if (!error) aInserted += batch.length;
}
log(`activities inserted: ${aInserted}/${actRows.length}`);

// Refresh ranking
const { data: sp1 } = await sb.from('salespeople').select('id').eq('is_active', true).limit(1).single();
const { data: c1 } = await sb.from('clients').select('id').limit(1).single();
const { error: refErr } = await sb.from('sales').insert({
  client_name: '__refresh__', product_name: 'x', amount: 1,
  status: 'completed', salesperson_id: sp1!.id, client_id: c1!.id,
  deal_status: 'completed',
});
if (!refErr) await sb.from('sales').delete().eq('client_name', '__refresh__');
log('ranking refresh attempted');
process.exit(0);
