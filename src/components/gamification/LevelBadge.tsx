import { FC } from 'react';
import { Badge } from '@/components/ui/badge';
import { getLevelFromXP } from '@/lib/gamification';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  totalXP: number;
  className?: string;
}

export const LevelBadge: FC<LevelBadgeProps> = ({ totalXP, className }) => {
  const levelInfo = getLevelFromXP(totalXP);
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs font-medium px-2 py-0.5",
        "bg-gradient-to-r from-primary/20 to-accent/20",
        "border-primary/30 text-primary",
        className
      )}
    >
      {levelInfo.emoji} Nv. {levelInfo.level}
    </Badge>
  );
};
