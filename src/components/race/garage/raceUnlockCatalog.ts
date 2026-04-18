// Catálogo de itens desbloqueáveis da Garagem
export type UnlockCategory = 'decal' | 'neon' | 'skin';
export type RaceLeague = 'bronze' | 'prata' | 'ouro' | 'platina' | 'diamante';

export interface RaceUnlockItem {
  key: string;
  label: string;
  description: string;
  category: UnlockCategory;
  requiredLeague: RaceLeague;
  /** Cor preview (hsl token) */
  previewColor: string;
}

export const RACE_UNLOCK_CATALOG: RaceUnlockItem[] = [
  // Decals
  { key: 'decal_flame', label: 'Chamas', description: 'Decal de chamas laterais', category: 'decal', requiredLeague: 'bronze', previewColor: 'hsl(var(--destructive))' },
  { key: 'decal_lightning', label: 'Raio', description: 'Raio dourado no capô', category: 'decal', requiredLeague: 'prata', previewColor: 'hsl(var(--coins))' },
  { key: 'decal_skull', label: 'Caveira', description: 'Caveira pirata cromada', category: 'decal', requiredLeague: 'ouro', previewColor: 'hsl(var(--muted-foreground))' },
  { key: 'decal_dragon', label: 'Dragão', description: 'Dragão chinês esculpido', category: 'decal', requiredLeague: 'platina', previewColor: 'hsl(var(--primary))' },
  // Neons
  { key: 'neon_blue', label: 'Neon Azul', description: 'Brilho azul sob o chassi', category: 'neon', requiredLeague: 'prata', previewColor: 'hsl(217 91% 60%)' },
  { key: 'neon_purple', label: 'Neon Roxo', description: 'Brilho roxo místico', category: 'neon', requiredLeague: 'ouro', previewColor: 'hsl(280 87% 65%)' },
  { key: 'neon_rainbow', label: 'Neon Arco-íris', description: 'Cores cíclicas premium', category: 'neon', requiredLeague: 'diamante', previewColor: 'hsl(var(--streak))' },
  // Skins
  { key: 'skin_gold', label: 'Skin Dourada', description: 'Cromagem totalmente dourada', category: 'skin', requiredLeague: 'ouro', previewColor: 'hsl(var(--coins))' },
  { key: 'skin_carbon', label: 'Carbono', description: 'Fibra de carbono fosca', category: 'skin', requiredLeague: 'platina', previewColor: 'hsl(var(--foreground))' },
  { key: 'skin_diamond', label: 'Diamante', description: 'Acabamento iridescente', category: 'skin', requiredLeague: 'diamante', previewColor: 'hsl(var(--primary))' },
];

export const LEAGUE_LABELS: Record<RaceLeague, string> = {
  bronze: 'Bronze',
  prata: 'Prata',
  ouro: 'Ouro',
  platina: 'Platina',
  diamante: 'Diamante',
};

export const LEAGUE_ORDER: Record<RaceLeague, number> = {
  bronze: 1, prata: 2, ouro: 3, platina: 4, diamante: 5,
};

export function canUnlock(userLeague: RaceLeague, required: RaceLeague): boolean {
  return LEAGUE_ORDER[userLeague] >= LEAGUE_ORDER[required];
}
