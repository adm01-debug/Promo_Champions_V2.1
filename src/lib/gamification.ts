// Gamification utility functions

interface LevelInfo {
  level: number;
  title: string;
  emoji: string;
  minXP: number;
  maxXP: number;
  progressPercent: number;
}

const LEVELS = [
  { level: 1, title: 'Iniciante', emoji: '🌱', minXP: 0, maxXP: 100 },
  { level: 2, title: 'Aprendiz', emoji: '📚', minXP: 100, maxXP: 300 },
  { level: 3, title: 'Praticante', emoji: '💪', minXP: 300, maxXP: 600 },
  { level: 4, title: 'Competente', emoji: '⭐', minXP: 600, maxXP: 1000 },
  { level: 5, title: 'Proficiente', emoji: '🔥', minXP: 1000, maxXP: 1500 },
  { level: 6, title: 'Experiente', emoji: '💎', minXP: 1500, maxXP: 2100 },
  { level: 7, title: 'Avançado', emoji: '🚀', minXP: 2100, maxXP: 2800 },
  { level: 8, title: 'Expert', emoji: '👑', minXP: 2800, maxXP: 3600 },
  { level: 9, title: 'Mestre', emoji: '🏆', minXP: 3600, maxXP: 4500 },
  { level: 10, title: 'Lenda', emoji: '⚡', minXP: 4500, maxXP: 5500 },
  { level: 11, title: 'Campeão', emoji: '🎯', minXP: 5500, maxXP: 6600 },
  { level: 12, title: 'Veterano', emoji: '🛡️', minXP: 6600, maxXP: 7800 },
  { level: 13, title: 'Elite', emoji: '💫', minXP: 7800, maxXP: 9100 },
  { level: 14, title: 'Supremo', emoji: '🌟', minXP: 9100, maxXP: 10500 },
  { level: 15, title: 'Imortal', emoji: '✨', minXP: 10500, maxXP: 12000 },
  { level: 16, title: 'Titã', emoji: '⚔️', minXP: 12000, maxXP: 13600 },
  { level: 17, title: 'Semideus', emoji: '🌙', minXP: 13600, maxXP: 15300 },
  { level: 18, title: 'Deus', emoji: '☀️', minXP: 15300, maxXP: 17100 },
  { level: 19, title: 'Criador', emoji: '🌈', minXP: 17100, maxXP: 19000 },
  { level: 20, title: 'Onipotente', emoji: '👁️', minXP: 19000, maxXP: Infinity },
];

export function getLevelFromXP(totalXP: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      const level = LEVELS[i];
      const xpInLevel = totalXP - level.minXP;
      const levelRange = level.maxXP - level.minXP;
      const progressPercent = Math.min((xpInLevel / levelRange) * 100, 100);
      
      return {
        ...level,
        progressPercent,
      };
    }
  }
  
  return {
    ...LEVELS[0],
    progressPercent: 0,
  };
}

export function getXPForNextLevel(totalXP: number): number {
  const currentLevel = getLevelFromXP(totalXP);
  return currentLevel.maxXP - totalXP;
}

export function formatXP(xp: number): string {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k`;
  }
  return xp.toString();
}

export { LEVELS };
