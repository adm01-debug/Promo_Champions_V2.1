export type CarStyle = 'f1' | 'stock' | 'kart';

export type LiveryPattern =
  | 'solid'
  | 'stripes'
  | 'flames'
  | 'checkers'
  | 'dots'
  | 'pride-rainbow'
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
  // ===== Fórmula 1 =====
  { id: 'ferrari-scuderia', name: 'Ferrari Scuderia', style: 'f1', primary: '#dc2626', secondary: '#ffffff', pattern: 'solid', emoji: '🏎️' },
  { id: 'mercedes-silver', name: 'Mercedes Silver Arrow', style: 'f1', primary: '#9ca3af', secondary: '#0d9488', pattern: 'stripes', accent: '#0d9488', emoji: '🥈' },
  { id: 'mclaren-papaya', name: 'McLaren Papaya', style: 'f1', primary: '#f97316', secondary: '#1e3a8a', pattern: 'solid', emoji: '🧡' },
  { id: 'williams-heritage', name: 'Williams Heritage', style: 'f1', primary: '#1d4ed8', secondary: '#ffffff', pattern: 'stripes', accent: '#ffffff', emoji: '💙' },
  { id: 'lotus-classic', name: 'Lotus Classic', style: 'f1', primary: '#0a0a0a', secondary: '#eab308', pattern: 'stripes', accent: '#eab308', emoji: '🖤' },
  { id: 'alpine-azure', name: 'Alpine Azure', style: 'f1', primary: '#1e40af', secondary: '#ec4899', pattern: 'solid', emoji: '🩵' },
  { id: 'black-thunder', name: 'Black Thunder', style: 'f1', primary: '#ff6a00', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '⚡' },
  { id: 'power-girl', name: 'Power Girl', style: 'f1', primary: '#0a0a0a', secondary: '#ff1493', pattern: 'stripes', accent: '#ff1493', emoji: '💖' },
  { id: 'pai-ta-on', name: 'O PAI TA ON', style: 'f1', primary: '#0a0a0a', secondary: '#faff00', pattern: 'stripes', accent: '#faff00', emoji: '👑' },
  { id: 'rocket-man', name: 'Rocket Man', style: 'f1', primary: '#0a0a0a', secondary: '#ff0033', pattern: 'stripes', accent: '#ff0033', emoji: '🚀' },
  { id: 'lady-force', name: 'Lady Force', style: 'f1', primary: '#ffffff', secondary: '#ffb6d9', pattern: 'stripes', accent: '#ffb6d9', emoji: '🎀' },
  { id: 'powerfull-girl', name: 'Girl Force', style: 'f1', primary: '#0a0a0a', secondary: '#b026ff', pattern: 'stripes', accent: '#b026ff', emoji: '💜' },
  { id: 'the-panther', name: 'The Panther', style: 'f1', primary: '#0a0a0a', secondary: '#ff6a00', pattern: 'stripes', accent: '#ff6a00', emoji: '🐈‍⬛' },
  { id: 'full-energy', name: 'Full Energy', style: 'f1', primary: '#ffd60a', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '⚡' },
  { id: 'monster', name: 'Monster', style: 'f1', primary: '#0a0a0a', secondary: '#39ff14', pattern: 'stripes', accent: '#39ff14', emoji: '👹' },
  { id: 'pink', name: 'Pink', style: 'f1', primary: '#ff10f0', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '💗' },
  { id: 'black-power', name: 'Black Power', style: 'f1', primary: '#0a0a0a', secondary: '#1a1a1a', pattern: 'solid', emoji: '✊🏿' },

  // ===== Stock / NASCAR =====
  { id: 'nascar-thunder', name: 'NASCAR Thunder', style: 'stock', primary: '#dc2626', secondary: '#0a0a0a', pattern: 'flames', accent: '#fbbf24', emoji: '🔥' },
  { id: 'stock-lightning', name: 'Stock Lightning', style: 'stock', primary: '#facc15', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '⚡' },
  { id: 'stock-patriot', name: 'Stock Patriot', style: 'stock', primary: '#1e3a8a', secondary: '#ffffff', pattern: 'stripes', accent: '#dc2626', emoji: '🛡️' },
  { id: 'stock-forest', name: 'Stock Forest', style: 'stock', primary: '#15803d', secondary: '#ffffff', pattern: 'solid', emoji: '🌲' },
  { id: 'stock-midnight', name: 'Stock Midnight', style: 'stock', primary: '#1e1b4b', secondary: '#a855f7', pattern: 'stripes', accent: '#a855f7', emoji: '🌙' },
  { id: 'stock-sunset', name: 'Stock Sunset', style: 'stock', primary: '#f97316', secondary: '#ec4899', pattern: 'stripes', accent: '#ec4899', emoji: '🌅' },

  // ===== Kart =====
  { id: 'kart-mario', name: 'Kart Mario', style: 'kart', primary: '#dc2626', secondary: '#ffffff', pattern: 'solid', emoji: '🍄' },
  { id: 'kart-luigi', name: 'Kart Luigi', style: 'kart', primary: '#16a34a', secondary: '#ffffff', pattern: 'solid', emoji: '🍀' },
  { id: 'kart-peach', name: 'Kart Peach', style: 'kart', primary: '#f9a8d4', secondary: '#fbbf24', pattern: 'solid', emoji: '👑' },
  { id: 'kart-toad', name: 'Kart Toad', style: 'kart', primary: '#ffffff', secondary: '#dc2626', pattern: 'dots', accent: '#dc2626', emoji: '🍄' },
  { id: 'kart-shadow', name: 'Kart Shadow', style: 'kart', primary: '#0a0a0a', secondary: '#06b6d4', pattern: 'solid', emoji: '🦇' },

  // ===== Pride / Inclusivos =====
  { id: 'pride-rainbow', name: 'Pride Force', style: 'f1', primary: '#ef4444', secondary: '#ffffff', pattern: 'pride-rainbow', emoji: '🏳️‍🌈', pride: true },
  { id: 'pride-trans', name: 'Orgulho Kart', style: 'kart', primary: '#ef4444', secondary: '#ffffff', pattern: 'pride-rainbow', emoji: '🏳️‍⚧️', pride: true },
  { id: 'pride-bi', name: 'Turbo Pride', style: 'stock', primary: '#ef4444', secondary: '#ffffff', pattern: 'pride-rainbow', emoji: '💗', pride: true },
] as const;

export const DEFAULT_PRESET_ID = 'ferrari-scuderia';

export function getPresetById(id: string | null | undefined): RaceCarPreset {
  if (!id) return RACE_CAR_PRESETS[0];
  return RACE_CAR_PRESETS.find((p) => p.id === id) ?? RACE_CAR_PRESETS[0];
}

/**
 * Inferência retrocompatível: mapeia carros antigos (sem preset_id)
 * para o preset visualmente mais próximo via cor + estilo.
 */
export function inferPresetFromColors(
  primary: string,
  style: CarStyle,
): RaceCarPreset {
  const match = RACE_CAR_PRESETS.find(
    (p) => p.style === style && p.primary.toLowerCase() === primary.toLowerCase(),
  );
  if (match) return match;
  const sameStyle = RACE_CAR_PRESETS.find((p) => p.style === style);
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
