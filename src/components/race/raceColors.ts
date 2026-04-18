export const RACE_CAR_COLORS = [
  { name: 'Vermelho', primary: '#ef4444', secondary: '#ffffff' },
  { name: 'Verde', primary: '#22c55e', secondary: '#ffffff' },
  { name: 'Azul', primary: '#3b82f6', secondary: '#ffffff' },
  { name: 'Amarelo', primary: '#eab308', secondary: '#1f2937' },
  { name: 'Laranja', primary: '#f97316', secondary: '#ffffff' },
  { name: 'Roxo', primary: '#a855f7', secondary: '#ffffff' },
  { name: 'Rosa', primary: '#ec4899', secondary: '#ffffff' },
  { name: 'Ciano', primary: '#06b6d4', secondary: '#1f2937' },
  { name: 'Lima', primary: '#84cc16', secondary: '#1f2937' },
  { name: 'Índigo', primary: '#6366f1', secondary: '#ffffff' },
  { name: 'Preto', primary: '#1f2937', secondary: '#fbbf24' },
  { name: 'Branco', primary: '#f3f4f6', secondary: '#1f2937' },
] as const;

export const CAR_STYLES = [
  { value: 'f1', label: 'Fórmula 1' },
  { value: 'stock', label: 'Stock Car' },
  { value: 'kart', label: 'Kart' },
] as const;

export type CarStyle = typeof CAR_STYLES[number]['value'];
