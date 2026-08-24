// Popula race_cars para os 8 vendedores reais com cores/estilos distintos.
// Cada vendedor recebe um carro numerado e estilizado de acordo com o role:
//   - closers: F1 vermelho/laranja (velocidade pura)
//   - sdrs: kart verde/amarelo (agilidade no prospecting)
//   - hybrids: stock azul/roxo (versatilidade)
//
// Idempotente: usa upsert em race_cars.salesperson_id (unique).
import { createClient } from '@supabase/supabase-js';

const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzeXhmcHFsc3NwbGR1YnB0cmRsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTgyMDg4MiwiZXhwIjoyMTAxMzk2ODgyfQ.gHonefmUBT3BQGT7EgnJ41vBKc-fTso1audID5FNBoo';

const SUPABASE_URL =
  process.env.SUPABASE_URL || 'https://usyxfpqlsspldubptrdl.supabase.co';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface CarSpec {
  car_number: number;
  car_style: 'f1' | 'stock' | 'kart';
  primary_color: string;
  secondary_color: string;
  nickname: string;
  victory_quote: string;
}

const CAR_PRESETS: Record<string, CarSpec> = {
  Leticia:     { car_number: 1,  car_style: 'f1',   primary_color: '#EF4444', secondary_color: '#FCA5A5', nickname: 'Vermelho Veloz',   victory_quote: 'Nunca é sobre velocidade, é sobre precisão.' },
  Danyelle:    { car_number: 2,  car_style: 'f1',   primary_color: '#F97316', secondary_color: '#FED7AA', nickname: 'Laranja Turbo',    victory_quote: 'Fechou? Fechou.' },
  Gabryelly:   { car_number: 7,  car_style: 'f1',   primary_color: '#DC2626', secondary_color: '#FECACA', nickname: 'Fúria Rubra',      victory_quote: 'Quem tem metas não tem medo de retas.' },
  Andriele:    { car_number: 11, car_style: 'kart', primary_color: '#22C55E', secondary_color: '#BBF7D0', nickname: 'Verde Sprint',     victory_quote: 'Cada lead é uma semente. Eu rego até fechar.' },
  Vanessa:     { car_number: 14, car_style: 'kart', primary_color: '#84CC16', secondary_color: '#D9F99D', nickname: 'Lima Relâmpago',   victory_quote: 'Quem prospecta com amor, fecha com sobra.' },
  Guilherme:   { car_number: 23, car_style: 'kart', primary_color: '#EAB308', secondary_color: '#FEF08A', nickname: 'Sol de Outono',    victory_quote: 'Meu pipeline é meu jardim. Cuido todos os dias.' },
  Henrique:    { car_number: 33, car_style: 'stock', primary_color: '#6366F1', secondary_color: '#C7D2FE', nickname: 'Índigo Versátil',  victory_quote: 'Híbrido não é meio caminho. É o caminho completo.' },
  Sirlei:      { car_number: 88, car_style: 'stock', primary_color: '#8B5CF6', secondary_color: '#DDD6FE', nickname: 'Violeta Sábia',    victory_quote: 'Experiência é o combustível que não acaba.' },
};

async function main() {
  console.log('Buscando vendedores reais...');
  const { data: salespeople, error: spErr } = await supabase
    .from('salespeople')
    .select('id, name, role, is_active')
    .in('name', Object.keys(CAR_PRESETS))
    .eq('is_active', true);
  if (spErr) throw spErr;
  if (!salespeople || salespeople.length === 0) {
    throw new Error('Nenhum vendedor real encontrado. Rode seed-real-people.ts primeiro.');
  }
  console.log(`Encontrados ${salespeople.length} vendedores.`);

  let upserted = 0;
  let skipped = 0;
  for (const sp of salespeople) {
    const preset = CAR_PRESETS[sp.name];
    if (!preset) {
      console.warn(`  • ${sp.name}: sem preset definido, pulando`);
      skipped++;
      continue;
    }
    const row = {
      salesperson_id: sp.id,
      car_number: preset.car_number,
      car_style: preset.car_style,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      nickname: preset.nickname,
      victory_quote: preset.victory_quote,
      total_wins: 0,
      total_races: 0,
      total_overtakes: 0,
    };
    const { error } = await supabase
      .from('race_cars')
      .upsert(row, { onConflict: 'salesperson_id' });
    if (error) {
      console.error(`  ✗ ${sp.name} (#${preset.car_number}): ${error.message}`);
    } else {
      console.log(`  ✓ ${sp.name.padEnd(11)} #${preset.car_number} ${preset.car_style.padEnd(5)} ${preset.nickname}`);
      upserted++;
    }
  }

  console.log(`\nResumo: ${upserted} upserts OK, ${skipped} pulados.`);
  if (upserted > 0) {
    const { data: all } = await supabase.from('race_cars').select('car_number, nickname, car_style');
    console.log('\nGrid atual:');
    (all ?? [])
      .sort((a, b) => a.car_number - b.car_number)
      .forEach(c => console.log(`  #${c.car_number} ${c.car_style.padEnd(5)} — ${c.nickname}`));
  }
}

main().catch((err) => {
  console.error('Falhou:', err);
  process.exit(1);
});
