// Seed real-named salespeople (não toca o admin). Idempotente.
import { createClient } from '@supabase/supabase-js';
import { requireSupabaseAdminEnv } from './lib/requireSupabaseAdminEnv';

const { supabaseUrl: url, serviceRoleKey: key } = requireSupabaseAdminEnv();

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const log = (...a) => console.log('•', ...a);

// Names -> role. Admin stays untouched.
const SEED: { name: string; email: string; role: 'closer' | 'sdr' | 'hybrid' }[] = [
  { name: 'Leticia',    email: 'leticia@promobrindes.com.br',    role: 'closer' },
  { name: 'Danyelle',   email: 'danyelle@promobrindes.com.br',   role: 'closer' },
  { name: 'Gabryelly',  email: 'gabryelly@promobrindes.com.br',  role: 'closer' },
  { name: 'Andriele',   email: 'andriele@promobrindes.com.br',   role: 'sdr' },
  { name: 'Vanessa',    email: 'vanessa@promobrindes.com.br',    role: 'sdr' },
  { name: 'Guilherme',  email: 'guilherme@promobrindes.com.br',  role: 'sdr' },
  { name: 'Henrique',   email: 'henrique@promobrindes.com.br',   role: 'hybrid' },
  { name: 'Sirlei',     email: 'sirlei@promobrindes.com.br',     role: 'hybrid' },
];

const { data: existing, error: loadErr } = await sb.from('salespeople').select('*');
if (loadErr) throw loadErr;

// Don't touch the admin: any row whose email contains the admin handle or
// whose name explicitly mentions "Administrador" / "Admin".
const ADMIN_NAME = 'Administrador Promo Brindes';
type ExistingSalesperson = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  squad_id: string | null;
};
const byName = new Map<string, ExistingSalesperson>();
const byEmail = new Map<string, ExistingSalesperson>();
for (const row of existing ?? []) {
  if (row.name === ADMIN_NAME || /admin/i.test(row.name)) continue;
  byName.set(row.name.toLowerCase(), row);
  if (row.email) byEmail.set(row.email.toLowerCase(), row);
}

// Three squads (already created by previous seed) — pick round-robin
const { data: squads } = await sb.from('squads').select('id, name');
const squadIds = (squads ?? []).map((s) => s.id);
log(`existing salespeople: ${existing?.length}, squads: ${squadIds.length}`);

let created = 0;
let updated = 0;
let skipped = 0;

for (let i = 0; i < SEED.length; i++) {
  const seed = SEED[i]!;
  const existingRow = byName.get(seed.name.toLowerCase()) ?? byEmail.get(seed.email.toLowerCase());

  // Compose squad_id round-robin across available squads
  const squadId = squadIds[i % Math.max(1, squadIds.length)] ?? null;

  if (existingRow) {
    // Update only fields that drifted (name, email, role, squad).
    // Preserve score_total, commission_rate, is_active, auth_user_id.
    const patch: Partial<Pick<ExistingSalesperson, 'name' | 'email' | 'role' | 'squad_id'>> = {};
    if (existingRow.name !== seed.name) patch.name = seed.name;
    if (existingRow.email !== seed.email) patch.email = seed.email;
    if (existingRow.role !== seed.role) patch.role = seed.role;
    if (existingRow.squad_id !== squadId) patch.squad_id = squadId;
    if (Object.keys(patch).length === 0) {
      skipped++;
      continue;
    }
    const { error } = await sb.from('salespeople').update(patch).eq('id', existingRow.id);
    if (error) { console.error('update err', seed.name, error); continue; }
    updated++;
    log(`updated ${seed.name} (${seed.role})`);
  } else {
    const { error } = await sb.from('salespeople').insert({
      name: seed.name,
      email: seed.email,
      role: seed.role,
      squad_id: squadId,
      commission_rate: 8,
      is_active: true,
      score_total: 0,
      notify_sales_in_app: true,
      notify_sales_email: false,
    }).select('id, name');
    if (error) { console.error('insert err', seed.name, error); continue; }
    created++;
    log(`created ${seed.name} (${seed.role}) → squad ${(squadId ?? '').slice(0, 8)}`);
  }
}

// Report final state
const { data: finalState } = await sb.from('salespeople').select('id, name, email, role, squad_id, score_total');
console.log('\nFinal salespeople roster:');
for (const s of finalState ?? []) {
  const isAdmin = s.name === ADMIN_NAME;
  console.log(`  ${isAdmin ? '🛡️' : '  '} ${s.name.padEnd(28)} role=${s.role.padEnd(7)} squad=${(s.squad_id ?? '').slice(0, 8)} score=${s.score_total}`);
}
log(`\n✅ done: created=${created} updated=${updated} skipped=${skipped} (admin preserved)`);
process.exit(0);
