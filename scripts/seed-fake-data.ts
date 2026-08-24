// Seed: distribute existing sales/activities/tasks across all salespeople,
// create race seasons + battle participants, achievements, daily_metrics,
// activity_goals, squads. Idempotent: safe to re-run (uses upsert where
// possible, deletes its own seed rows by stable prefix where needed).
import { createClient } from '@supabase/supabase-js';

const url = 'https://usyxfpqlsspldubptrdl.supabase.co';
const key =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeXhmcHFsc3NwbGR1YnB0cmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgyMDg4MiwiZXhwIjoyMTAxMzk2ODgyfQ.gHonefmUBT3BQGT7EgnJ41vBKc-fTso1audID5FNBoo';

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const log = (...a) => console.log('•', ...a);

async function chunk<T>(rows: T[], size: number): Promise<T[][]> {
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
// 0) Load salespeople (9) and group by role
// ─────────────────────────────────────────────────────────────────────────
const { data: sps, error: spErr } = await sb.from('salespeople').select('*');
if (spErr) throw spErr;
const closers = (sps ?? []).filter((s) => s.role === 'closer');
const sdrs = (sps ?? []).filter((s) => s.role === 'sdr');
const hybrids = (sps ?? []).filter((s) => s.role === 'hybrid');
log(`people: ${sps?.length} (closer=${closers.length} sdr=${sdrs.length} hybrid=${hybrids.length})`);

// Deterministic shuffle by id so each seller gets a stable slice
function pickByMod<T>(arr: T[], mod: number, key: (t: T) => string): T {
  const idx = mod % arr.length;
  return arr[idx];
}
const allSellers = [...closers, ...sdrs, ...hybrids];
const closerIds = closers.map((c) => c.id);
const sdrIds = sdrs.map((s) => s.id);

// ─────────────────────────────────────────────────────────────────────────
// 1) Squads (3 teams of 3 sellers each)
// ─────────────────────────────────────────────────────────────────────────
const SQUAD_NAMES = ['Falcons', 'Wolves', 'Phoenix'];
const SQUAD_COLORS = ['#22d3ee', '#f97316', '#a855f7'];

// Upsert via insert — assume squads empty; if a name exists already, skip
const { data: existingSquads } = await sb.from('squads').select('id, name');
const squadMap = new Map<string, string>();
for (const s of existingSquads ?? []) squadMap.set(s.name, s.id);

const squadRows = SQUAD_NAMES.filter((n) => !squadMap.has(n)).map((name, i) => ({
  name,
  color: SQUAD_COLORS[i],
  description: `Time comercial ${name}`,
}));
if (squadRows.length) {
  const { data: ins, error } = await sb.from('squads').insert(squadRows).select('id, name');
  if (error) throw error;
  for (const s of ins ?? []) squadMap.set(s.name, s.id);
  log('squads inserted:', ins?.length);
}

// Assign each seller to a squad (round-robin)
for (let i = 0; i < allSellers.length; i++) {
  const s = allSellers[i];
  const sqId = squadMap.get(SQUAD_NAMES[i % SQUAD_NAMES.length]!);
  if (s.squad_id !== sqId) {
    await sb.from('salespeople').update({ squad_id: sqId }).eq('id', s.id);
  }
}
log('salespeople assigned to squads');

// ─────────────────────────────────────────────────────────────────────────
// 2) Redistribute sales across all closers/hybrids (round-robin by created_at
//    hash). Add sdr_id/closer_id split so analytics sees SDR pipeline.
// ─────────────────────────────────────────────────────────────────────────
const { data: allSales } = await sb.from('sales').select('id, salesperson_id, sdr_id, closer_id, created_at, amount, status');
if (!allSales) throw new Error('no sales');
log('sales:', allSales.length);

const updates: { id: string; salesperson_id: string; sdr_id: string | null; closer_id: string | null }[] = [];
let i = 0;
for (const sale of allSales) {
  // Hash by created_at charcode mod so distribution is stable across runs
  const hash = (sale.created_at || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const closer = closerIds[hash % closerIds.length] ?? closerIds[0]!;
  const sdr = sdrIds[hash % sdrIds.length] ?? null;
  // Hybrids alternate in to ensure all sellers receive deals
  const owner = i % 4 === 0 && hybrids.length ? hybrids[hash % hybrids.length]!.id : closer;
  updates.push({
    id: sale.id,
    salesperson_id: owner,
    sdr_id: sdr,
    closer_id: closer,
  });
  i++;
}

for (const batch of await chunk(updates, 250)) {
  // Use UPDATE-by-id rather than upsert so we don't accidentally overwrite
  // NOT NULL columns that aren't in the patch.
  await Promise.all(
    batch.map((u) =>
      sb.from('sales').update({ salesperson_id: u.salesperson_id, sdr_id: u.sdr_id, closer_id: u.closer_id }).eq('id', u.id)
    )
  );
}
log('sales redistributed (sdr_id/closer_id added):', updates.length);

// ─────────────────────────────────────────────────────────────────────────
// 3) Recompute salespeople.score_total = sum of won revenue / 1000
// ─────────────────────────────────────────────────────────────────────────
const totals = new Map<string, number>();
for (const u of updates) {
  const sale = allSales.find((s) => s.id === u.id)!;
  if (sale.status === 'won') totals.set(u.salesperson_id, (totals.get(u.salesperson_id) ?? 0) + (sale.amount || 0));
}
for (const [id, revenue] of totals) {
  await sb.from('salespeople').update({ score_total: Math.round(revenue / 1000) }).eq('id', id);
}
log('score_total updated for', totals.size, 'sellers');

// ─────────────────────────────────────────────────────────────────────────
// 4) Race seasons — one active for closer, one for sdr; one historical.
// ─────────────────────────────────────────────────────────────────────────
const { data: existingSeasons } = await sb.from('race_seasons').select('id, name');
const seasonMap = new Map<string, string>();
for (const s of existingSeasons ?? []) seasonMap.set(s.name, s.id);

const now = new Date();
const isoDays = (d: Date) => d.toISOString().slice(0, 10);
const seasonSeeds = [
  {
    name: 'Q3 Closer Sprint',
    role_type: 'closer',
    track_type: 'oval',
    start_date: isoDays(new Date(now.getTime() - 14 * 86400_000)),
    end_date: isoDays(new Date(now.getTime() + 14 * 86400_000)),
    status: 'active',
    goal_amount: 500000,
  },
  {
    name: 'Q3 SDR Showdown',
    role_type: 'sdr',
    track_type: 'circuit',
    start_date: isoDays(new Date(now.getTime() - 7 * 86400_000)),
    end_date: isoDays(new Date(now.getTime() + 21 * 86400_000)),
    status: 'active',
    goal_amount: 200,
  },
  {
    name: 'Q2 Closer Cup',
    role_type: 'closer',
    track_type: 'street',
    start_date: isoDays(new Date(now.getTime() - 90 * 86400_000)),
    end_date: isoDays(new Date(now.getTime() - 60 * 86400_000)),
    status: 'finished',
    goal_amount: 400000,
  },
];
const seasonInserts = seasonSeeds.filter((s) => !seasonMap.has(s.name));
if (seasonInserts.length) {
  const { data: ins, error } = await sb.from('race_seasons').insert(seasonInserts).select('id, name');
  if (error) throw error;
  for (const s of ins ?? []) seasonMap.set(s.name, s.id);
  log('race_seasons inserted:', ins?.length);
}

// Set winner for the finished one (best closer by won revenue)
const finishedId = seasonMap.get('Q2 Closer Cup');
if (finishedId && closerIds[0]) {
  const winner = closerIds[0]!;
  const { data: won } = await sb
    .from('sales')
    .select('salesperson_id, amount')
    .eq('status', 'won')
    .in('salesperson_id', closerIds);
  const bySeller = new Map<string, number>();
  for (const w of won ?? []) bySeller.set(w.salesperson_id, (bySeller.get(w.salesperson_id) ?? 0) + (w.amount || 0));
  const ranked = [...bySeller.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked[0] && !seasonSeeds.find((s) => s.name === 'Q2 Closer Cup')) {
    // safety: skip if not relevant
  }
  if (ranked[0]) {
    await sb.from('race_seasons').update({ winner_id: ranked[0][0] }).eq('id', finishedId);
    log('Q2 Closer Cup winner:', ranked[0][0], 'rev:', ranked[0][1].toFixed(0));
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 5) Sales battles — 2 active (revenue, calls) + 1 historical. Battle
//    participants join via sales_battles, NOT race_seasons (different table).
// ─────────────────────────────────────────────────────────────────────────
const { data: existingBattles } = await sb.from('sales_battles').select('id, title');
const battleMap = new Map<string, string>();
for (const b of existingBattles ?? []) battleMap.set(b.title, b.id);

const battleSeeds = [
  {
    title: 'Q3 Closer Revenue Battle',
    battle_type: 'team',
    metric: 'revenue',
    target_value: 200000,
    starts_at: new Date(now.getTime() - 14 * 86400_000).toISOString(),
    ends_at: new Date(now.getTime() + 14 * 86400_000).toISOString(),
    status: 'active',
    xp_reward: 500,
  },
  {
    title: 'Q3 SDR Call Showdown',
    battle_type: 'team',
    metric: 'calls',
    target_value: 500,
    starts_at: new Date(now.getTime() - 7 * 86400_000).toISOString(),
    ends_at: new Date(now.getTime() + 21 * 86400_000).toISOString(),
    status: 'active',
    xp_reward: 300,
  },
  {
    title: 'Q2 Meetings Cup',
    battle_type: '1v1',
    metric: 'meetings',
    target_value: 100,
    starts_at: new Date(now.getTime() - 90 * 86400_000).toISOString(),
    ends_at: new Date(now.getTime() - 60 * 86400_000).toISOString(),
    status: 'completed',
    xp_reward: 250,
  },
];
const battleInserts = battleSeeds.filter((b) => !battleMap.has(b.title));
if (battleInserts.length) {
  const { data: ins, error } = await sb.from('sales_battles').insert(battleInserts).select('id, title');
  if (error) throw error;
  for (const b of ins ?? []) battleMap.set(b.title, b.id);
  log('sales_battles inserted:', ins?.length);
}

const revenueBattleId = battleMap.get('Q3 Closer Revenue Battle');
const callsBattleId = battleMap.get('Q3 SDR Call Showdown');
const completedBattleId = battleMap.get('Q2 Meetings Cup');

// Clear existing participants for our battles so the run is idempotent
if (revenueBattleId || callsBattleId || completedBattleId) {
  const ids = [revenueBattleId, callsBattleId, completedBattleId].filter(Boolean) as string[];
  await sb.from('battle_participants').delete().in('battle_id', ids);
}

// Compute scores
const sinceIso = new Date(now.getTime() - 14 * 86400_000).toISOString();
const { data: recentWon } = await sb
  .from('sales')
  .select('salesperson_id, amount, status')
  .eq('status', 'won')
  .gte('created_at', sinceIso);
const closerScores = new Map<string, number>();
for (const w of recentWon ?? []) {
  if (!closerIds.includes(w.salesperson_id)) continue;
  closerScores.set(w.salesperson_id, (closerScores.get(w.salesperson_id) ?? 0) + (w.amount || 0));
}

const { data: recentActs } = await sb
  .from('activities')
  .select('salesperson_id, activity_type')
  .gte('created_at', sinceIso);
const sdrScores = new Map<string, number>();
for (const a of recentActs ?? []) {
  if (!sdrIds.includes(a.salesperson_id)) continue;
  if (a.activity_type === 'call') sdrScores.set(a.salesperson_id, (sdrScores.get(a.salesperson_id) ?? 0) + 1);
}

const battleRows: { battle_id: string; salesperson_id: string; team_name: string | null; current_score: number }[] = [];
if (revenueBattleId) {
  const teamNames = ['Alpha', 'Bravo', 'Charlie'];
  closerIds.forEach((sid, idx) => {
    battleRows.push({
      battle_id: revenueBattleId,
      salesperson_id: sid,
      team_name: teamNames[idx % teamNames.length] ?? null,
      current_score: Math.round((closerScores.get(sid) ?? 0) / 1000),
    });
  });
}
if (callsBattleId) {
  const teamNames = ['Hunter', 'Tracker', 'Scout'];
  sdrIds.forEach((sid, idx) => {
    battleRows.push({
      battle_id: callsBattleId,
      salesperson_id: sid,
      team_name: teamNames[idx % teamNames.length] ?? null,
      current_score: sdrScores.get(sid) ?? 0,
    });
  });
}
if (battleRows.length) {
  const { error } = await sb.from('battle_participants').insert(battleRows);
  if (error) throw error;
  log('battle_participants inserted:', battleRows.length);
}

// ─────────────────────────────────────────────────────────────────────────
// 6) Achievements — popular achievement types per seller
// ─────────────────────────────────────────────────────────────────────────
const { data: existingAch } = await sb.from('achievements').select('id');
if (!existingAch || existingAch.length === 0) {
  const ACH_TYPES = [
    'first_sale', 'streak_7d', 'streak_30d', 'top_week', 'top_month',
    'goal_100pct', 'mega_deal', 'fast_closer', 'pipeline_king',
  ];
  const rows: { salesperson_id: string; achievement_type: string; achievement_date: string; details: any }[] = [];
  for (const sp of allSellers) {
    const count = 2 + Math.floor(((sp.id.charCodeAt(0) ?? 0) % 5));
    for (let k = 0; k < count; k++) {
      const type = ACH_TYPES[(sp.id.charCodeAt(0) + k) % ACH_TYPES.length]!;
      const daysAgo = (k + 1) * 7 + ((sp.id.charCodeAt(1) ?? 0) % 14);
      const date = new Date(now.getTime() - daysAgo * 86400_000).toISOString().slice(0, 10);
      rows.push({
        salesperson_id: sp.id,
        achievement_type: type,
        achievement_date: date,
        details: { source: 'seed-script', weight: 10 + k * 5 },
      });
    }
  }
  for (const batch of await chunk(rows, 200)) {
    const { error } = await sb.from('achievements').insert(batch);
    if (error) throw error;
  }
  log('achievements inserted:', rows.length);
}

// ─────────────────────────────────────────────────────────────────────────
// 7) Daily metrics — 30 days for the team
// ─────────────────────────────────────────────────────────────────────────
const { data: existingDm } = await sb.from('daily_metrics').select('id').limit(1);
const dmRows: { date: string; revenue: number; revenue_goal: number; total_sales: number; new_clients: number; conversion_rate: number; avg_ticket: number }[] = [];
for (let d = 0; d < 30; d++) {
  const date = new Date(now.getTime() - d * 86400_000).toISOString().slice(0, 10);
  const dayRev = 25000 + Math.floor(Math.sin(d / 3) * 8000) + d * 600;
  const sales = 8 + Math.floor(Math.cos(d / 2) * 4) + (d % 5);
  const newClients = 1 + (d % 3);
  const conv = 18 + (d % 6);
  const ticket = sales ? dayRev / sales : 0;
  dmRows.push({
    date,
    revenue: dayRev,
    revenue_goal: 50000,
    total_sales: Math.max(1, sales),
    new_clients: newClients,
    conversion_rate: conv,
    avg_ticket: Math.round(ticket),
  });
}
if (!existingDm || existingDm.length === 0) {
  for (const batch of await chunk(dmRows, 100)) {
    const { error } = await sb.from('daily_metrics').insert(batch);
    if (error) throw error;
  }
  log('daily_metrics inserted:', dmRows.length);
}

// ─────────────────────────────────────────────────────────────────────────
// 8) Activity goals per seller (metas)
// ─────────────────────────────────────────────────────────────────────────
const { data: existingAg } = await sb.from('activity_goals').select('id');
if (!existingAg || existingAg.length === 0) {
  const agRows = allSellers.map((sp) => ({
    salesperson_id: sp.id,
    calls_goal: 60,
    emails_goal: 120,
    meetings_goal: 20,
    linkedin_goal: 30,
    whatsapp_goal: 50,
  }));
  const { error } = await sb.from('activity_goals').insert(agRows);
  if (error) throw error;
  log('activity_goals inserted:', agRows.length);
}

log('✅ seed complete');
process.exit(0);