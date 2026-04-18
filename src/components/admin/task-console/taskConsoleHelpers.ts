export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'epic';
export type TaskAssignmentStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';

export const DIFFICULTY_XP_DEFAULTS: Record<TaskDifficulty, number> = {
  easy: 25,
  medium: 50,
  hard: 100,
  epic: 250,
};

export const DIFFICULTY_LABELS: Record<TaskDifficulty, string> = {
  easy: 'Fácil',
  medium: 'Médio',
  hard: 'Difícil',
  epic: 'Épico',
};

export const DIFFICULTY_TONES: Record<TaskDifficulty, string> = {
  easy: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  medium: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  hard: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  epic: 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20',
};

export const STATUS_LABELS: Record<TaskAssignmentStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  submitted: 'Aguardando revisão',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
};

export const STATUS_TONES: Record<TaskAssignmentStatus, string> = {
  pending: 'bg-muted text-muted-foreground border-border',
  in_progress: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  submitted: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export const formatXp = (n: number): string => {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toLocaleString('pt-BR')} XP`;
};

export type RecurrenceRule = 'daily' | 'weekly' | 'monthly';

export const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

export const SQUAD_COLOR_PRESETS: string[] = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#64748b',
];
