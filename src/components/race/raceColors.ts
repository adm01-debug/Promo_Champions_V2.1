export type CarStyle = 'f1' | 'stock' | 'kart';

export type LiveryPattern =
  | 'solid'
  | 'stripes'
  | 'flames'
  | 'checkers'
  | 'dots'
  | 'pride-rainbow'
  | 'pride-rainbow-diagonal'
  | 'pride-trans'
  | 'pride-bi';

export interface RaceCarPreset {
  id: string;
  name: string;
  style: CarStyle;
  primary: string;
  secondary: string;
  /** Cor extra usada por algumas liveries (chamas, listras, detalhes). */
  accent?: string;
  pattern: LiveryPattern;
  emoji: string;
  /** Marca presets de temas inclusivos / Pride. */
  pride?: boolean;
}

export const RACE_CAR_PRESETS: readonly RaceCarPreset[] = [
  // Ordem definida pelo usuário (1-26)
  { id: 'rocket-man', name: 'Rocket Man Group', style: 'f1', primary: '#0a0a0a', secondary: '#ff0033', pattern: 'stripes', accent: '#ff0033', emoji: '🚀' },
  { id: 'power-girl', name: 'Scuderia Power Girl', style: 'f1', primary: '#0a0a0a', secondary: '#ff1493', pattern: 'stripes', accent: '#ff1493', emoji: '💖' },
  { id: 'monster', name: 'Monster League', style: 'f1', primary: '#0a0a0a', secondary: '#39ff14', pattern: 'stripes', accent: '#39ff14', emoji: '👹' },
  { id: 'pride-rainbow', name: 'Pride Force', style: 'f1', primary: '#ef4444', secondary: '#ffffff', pattern: 'pride-rainbow', emoji: '🏳️‍🌈', pride: true },
  { id: 'powerfull-girl', name: 'Girl Force', style: 'f1', primary: '#0a0a0a', secondary: '#b026ff', pattern: 'stripes', accent: '#b026ff', emoji: '💜' },
  { id: 'black-power', name: 'Scuderia Black Power', style: 'f1', primary: '#0a0a0a', secondary: '#1a1a1a', pattern: 'solid', emoji: '✊🏿' },
  { id: 'f1-fire-force', name: 'Fire Force', style: 'f1', primary: '#dc2626', secondary: '#0a0a0a', pattern: 'flames', accent: '#fbbf24', emoji: '🔥' },
  { id: 'f1-pai-on', name: 'Scuderia o Pai ta ON', style: 'f1', primary: '#0a0a0a', secondary: '#eaff00', pattern: 'stripes', accent: '#eaff00', emoji: '👨' },
  { id: 'lady-force', name: 'Lady Force', style: 'f1', primary: '#ffffff', secondary: '#ffb6d9', pattern: 'stripes', accent: '#ffb6d9', emoji: '🎀' },
  { id: 'shadow-force', name: 'Shadow Force', style: 'f1', primary: '#0a0a0a', secondary: '#7f1d1d', pattern: 'stripes', accent: '#7f1d1d', emoji: '🖤' },
  { id: 'f1-sun-tzu-force', name: 'Sun Tzu Force', style: 'f1', primary: '#0a0a0a', secondary: '#b8860b', pattern: 'stripes', accent: '#b8860b', emoji: '☀️' },
  { id: 'the-panther', name: 'Phanter Group', style: 'f1', primary: '#0a0a0a', secondary: '#ff6a00', pattern: 'stripes', accent: '#ff6a00', emoji: '🐈‍⬛' },
  { id: 'pink', name: 'Pink Leagues', style: 'f1', primary: '#ff10f0', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '💗' },
  { id: 'scuderia-alpha', name: 'Scuderia Alpha', style: 'f1', primary: '#0a0a0a', secondary: '#00d4ff', pattern: 'stripes', accent: '#00d4ff', emoji: '🔵' },
  { id: 'full-energy', name: 'Full Energy Group', style: 'f1', primary: '#ffd60a', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '⚡' },
  { id: 'mercedes-silver', name: 'Scuderia Shine', style: 'f1', primary: '#9ca3af', secondary: '#0d9488', pattern: 'stripes', accent: '#0d9488', emoji: '🥈' },
  { id: 'scuderia-pride', name: 'Scuderia Pride', style: 'f1', primary: '#0a0a0a', secondary: '#ffffff', pattern: 'pride-rainbow-diagonal', emoji: '🌈', pride: true },
  { id: 'f1-princess-force', name: 'Princess League', style: 'f1', primary: '#fbcfe8', secondary: '#facc15', pattern: 'stripes', accent: '#0a0a0a', emoji: '👑' },
  { id: 'ferrari-scuderia', name: 'Red Force', style: 'f1', primary: '#dc2626', secondary: '#ffffff', pattern: 'solid', emoji: '🏎️' },
  { id: 'cooper-league', name: 'Cooper League', style: 'f1', primary: '#15803d', secondary: '#ffffff', pattern: 'stripes', accent: '#ffffff', emoji: '🌲' },
  { id: 'religion-force', name: 'Religion Force', style: 'f1', primary: '#ffffff', secondary: '#d4af37', pattern: 'stripes', accent: '#d4af37', emoji: '✝️' },
  { id: 'black-thunder', name: 'Black Thunder League', style: 'f1', primary: '#ff6a00', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '⚡' },
  { id: 'alpine-azure', name: 'Pink and Blue Group', style: 'f1', primary: '#ec4899', secondary: '#3b82f6', pattern: 'stripes', accent: '#3b82f6', emoji: '💗' },
  { id: 'williams-heritage', name: 'Scuderia Classic', style: 'f1', primary: '#1d4ed8', secondary: '#ffffff', pattern: 'stripes', accent: '#ffffff', emoji: '💙' },
  { id: 'mclaren-papaya', name: 'Scuderia Power Sun', style: 'f1', primary: '#f97316', secondary: '#eab308', pattern: 'solid', accent: '#eab308', emoji: '🧡' },
  { id: 'gold-fury', name: 'Scuderia Gold Fury', style: 'f1', primary: '#d4af37', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '🏆' },

  // Não listado pelo usuário, mantido ao final para preservar o preset:
  { id: 'f1-mae-on', name: 'Scuderia a Mãe ta ON', style: 'f1', primary: '#ec4899', secondary: '#ffffff', pattern: 'stripes', accent: '#ffffff', emoji: '👩' },
] as const;

export const DEFAULT_PRESET_ID = 'ferrari-scuderia';

export function getPresetById(id: string | null | undefined): RaceCarPreset {
  const fallback =
    RACE_CAR_PRESETS.find((p) => p.id === DEFAULT_PRESET_ID) ?? RACE_CAR_PRESETS[0];
  if (!id) return fallback;
  return RACE_CAR_PRESETS.find((p) => p.id === id) ?? fallback;
}

/**
 * Inferência retrocompatível: mapeia carros antigos (sem preset_id)
 * para o preset visualmente mais próximo via cor + estilo.
 * Quando vários presets compartilham `primary+style`, `secondary` (opcional)
 * é usado como tie-breaker case-insensitive.
 */
export function inferPresetFromColors(
  primary: string,
  style: CarStyle,
  secondary?: string,
): RaceCarPreset {
  const p = primary.toLowerCase();
  const s = secondary?.toLowerCase();
  const candidates = RACE_CAR_PRESETS.filter(
    (preset) => preset.style === style && preset.primary.toLowerCase() === p,
  );
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1 && s) {
    const tie = candidates.find((c) => c.secondary.toLowerCase() === s);
    if (tie) return tie;
  }
  if (candidates.length > 0) return candidates[0];
  const sameStyle = RACE_CAR_PRESETS.find((preset) => preset.style === style);
  return sameStyle ?? RACE_CAR_PRESETS[0];
}

// ===== Legado (mantido p/ compat com componentes ainda não migrados) =====
export const RACE_CAR_COLORS = RACE_CAR_PRESETS.slice(0, 12).map((p) => ({
  name: p.name,
  primary: p.primary,
  secondary: p.secondary,
}));

export const CAR_STYLES = [
  { value: 'f1', label: 'Fórmula 1' },
  { value: 'stock', label: 'Stock Car' },
  { value: 'kart', label: 'Kart' },
] as const;
