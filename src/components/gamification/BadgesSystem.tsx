import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Target, 
  Flame, 
  Trophy, 
  Star, 
  Crown,
  Zap,
  Sparkles,
  Award,
  Medal,
  Rocket,
  TrendingUp,
  Calendar,
  Clock,
  Gift,
  Diamond,
  Heart,
  Shield,
  Swords
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  category: 'streak' | 'level' | 'goals' | 'special';
  requirement: {
    type: 'streak' | 'level' | 'goals' | 'xp';
    value: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak badges
  {
    id: 'streak_3',
    name: 'Em Chamas',
    description: '3 dias consecutivos batendo meta',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    category: 'streak',
    requirement: { type: 'streak', value: 3 },
    rarity: 'common'
  },
  {
    id: 'streak_5',
    name: 'Consistente',
    description: '5 dias consecutivos batendo meta',
    icon: Flame,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    category: 'streak',
    requirement: { type: 'streak', value: 5 },
    rarity: 'common'
  },
  {
    id: 'streak_7',
    name: 'Imparável',
    description: '7 dias consecutivos batendo meta',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-600/10',
    borderColor: 'border-orange-600/30',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
    rarity: 'rare'
  },
  {
    id: 'streak_10',
    name: 'Fogo Sagrado',
    description: '10 dias consecutivos batendo meta',
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    category: 'streak',
    requirement: { type: 'streak', value: 10 },
    rarity: 'epic'
  },
  {
    id: 'streak_15',
    name: 'Lenda Viva',
    description: '15 dias consecutivos batendo meta',
    icon: Sparkles,
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
    borderColor: 'border-red-600/30',
    category: 'streak',
    requirement: { type: 'streak', value: 15 },
    rarity: 'legendary'
  },
  {
    id: 'streak_30',
    name: 'Fênix',
    description: '30 dias consecutivos batendo meta',
    icon: Rocket,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
    rarity: 'legendary'
  },

  // Level badges
  {
    id: 'level_5',
    name: 'Habilidoso',
    description: 'Alcançou nível 5',
    icon: Star,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    category: 'level',
    requirement: { type: 'level', value: 5 },
    rarity: 'common'
  },
  {
    id: 'level_10',
    name: 'Grão-Mestre',
    description: 'Alcançou nível 10',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    category: 'level',
    requirement: { type: 'level', value: 10 },
    rarity: 'rare'
  },
  {
    id: 'level_15',
    name: 'Imortal',
    description: 'Alcançou nível 15',
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    category: 'level',
    requirement: { type: 'level', value: 15 },
    rarity: 'epic'
  },
  {
    id: 'level_20',
    name: 'O Vendedor',
    description: 'Alcançou nível máximo 20',
    icon: Diamond,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    category: 'level',
    requirement: { type: 'level', value: 20 },
    rarity: 'legendary'
  },

  // Goals badges
  {
    id: 'goals_1',
    name: 'Primeira Vitória',
    description: 'Bateu a primeira meta diária',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    category: 'goals',
    requirement: { type: 'goals', value: 1 },
    rarity: 'common'
  },
  {
    id: 'goals_10',
    name: 'Dedicado',
    description: 'Bateu 10 metas diárias',
    icon: Award,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    category: 'goals',
    requirement: { type: 'goals', value: 10 },
    rarity: 'common'
  },
  {
    id: 'goals_30',
    name: 'Campeão',
    description: 'Bateu 30 metas diárias',
    icon: Trophy,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    category: 'goals',
    requirement: { type: 'goals', value: 30 },
    rarity: 'rare'
  },
  {
    id: 'goals_50',
    name: 'Elite',
    description: 'Bateu 50 metas diárias',
    icon: Medal,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    category: 'goals',
    requirement: { type: 'goals', value: 50 },
    rarity: 'epic'
  },
  {
    id: 'goals_100',
    name: 'Centurião',
    description: 'Bateu 100 metas diárias',
    icon: Swords,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    category: 'goals',
    requirement: { type: 'goals', value: 100 },
    rarity: 'legendary'
  },

  // XP badges
  {
    id: 'xp_1000',
    name: 'Mil XP',
    description: 'Acumulou 1.000 XP',
    icon: Zap,
    color: 'text-xp',
    bgColor: 'bg-xp/10',
    borderColor: 'border-xp/30',
    category: 'special',
    requirement: { type: 'xp', value: 1000 },
    rarity: 'common'
  },
  {
    id: 'xp_5000',
    name: 'Poderoso',
    description: 'Acumulou 5.000 XP',
    icon: Zap,
    color: 'text-xp',
    bgColor: 'bg-xp/10',
    borderColor: 'border-xp/30',
    category: 'special',
    requirement: { type: 'xp', value: 5000 },
    rarity: 'rare'
  },
  {
    id: 'xp_10000',
    name: 'Titã',
    description: 'Acumulou 10.000 XP',
    icon: TrendingUp,
    color: 'text-xp',
    bgColor: 'bg-xp/10',
    borderColor: 'border-xp/30',
    category: 'special',
    requirement: { type: 'xp', value: 10000 },
    rarity: 'epic'
  },
];

const RARITY_STYLES = {
  common: { ring: 'ring-gray-400/30', glow: '' },
  rare: { ring: 'ring-blue-500/30', glow: 'shadow-blue-500/20' },
  epic: { ring: 'ring-purple-500/30', glow: 'shadow-purple-500/20' },
  legendary: { ring: 'ring-amber-500/50', glow: 'shadow-amber-500/30 shadow-lg' }
};

interface BadgeCardProps {
  badge: BadgeDefinition;
  earned: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgeCard({ badge, earned, showTooltip = true, size = 'md' }: BadgeCardProps) {
  const Icon = badge.icon;
  const rarityStyle = RARITY_STYLES[badge.rarity];
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const content = (
    <motion.div
      whileHover={earned ? { scale: 1.1 } : {}}
      className={cn(
        "relative rounded-full flex items-center justify-center transition-all",
        sizeClasses[size],
        earned ? badge.bgColor : 'bg-muted/30',
        earned ? `ring-2 ${rarityStyle.ring} ${rarityStyle.glow}` : 'ring-1 ring-border/30',
        !earned && 'opacity-40 grayscale'
      )}
    >
      <Icon className={cn(
        iconSizes[size],
        earned ? badge.color : 'text-muted-foreground'
      )} />
      {earned && badge.rarity === 'legendary' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-amber-500/30"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(251, 191, 36, 0.1), transparent)'
          }}
        />
      )}
    </motion.div>
  );

  if (!showTooltip) return content;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <div className="space-y-1">
            <div className="font-medium flex items-center gap-1.5">
              <Icon className={cn("h-3.5 w-3.5", earned ? badge.color : 'text-muted-foreground')} />
              {badge.name}
            </div>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
            <Badge variant="outline" className="text-[10px] capitalize">
              {badge.rarity}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface BadgesGridProps {
  earnedBadges: string[];
  category?: 'streak' | 'level' | 'goals' | 'special' | 'all';
  showLocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function BadgesGrid({ 
  earnedBadges, 
  category = 'all', 
  showLocked = true,
  size = 'md' 
}: BadgesGridProps) {
  const filteredBadges = category === 'all' 
    ? BADGE_DEFINITIONS 
    : BADGE_DEFINITIONS.filter(b => b.category === category);

  const badgesToShow = showLocked 
    ? filteredBadges 
    : filteredBadges.filter(b => earnedBadges.includes(b.id));

  return (
    <div className="flex flex-wrap gap-2">
      {badgesToShow.map((badge) => (
        <BadgeCard
          key={badge.id}
          badge={badge}
          earned={earnedBadges.includes(badge.id)}
          size={size}
        />
      ))}
    </div>
  );
}

interface BadgesShowcaseProps {
  level: number;
  currentStreak: number;
  bestStreak: number;
  dailyGoals: number;
  totalXP: number;
}

export function BadgesShowcase({ 
  level, 
  currentStreak, 
  bestStreak, 
  dailyGoals, 
  totalXP 
}: BadgesShowcaseProps) {
  // Calculate which badges are earned
  const earnedBadges = BADGE_DEFINITIONS.filter(badge => {
    switch (badge.requirement.type) {
      case 'streak':
        return bestStreak >= badge.requirement.value;
      case 'level':
        return level >= badge.requirement.value;
      case 'goals':
        return dailyGoals >= badge.requirement.value;
      case 'xp':
        return totalXP >= badge.requirement.value;
      default:
        return false;
    }
  }).map(b => b.id);

  const categories = [
    { id: 'streak', label: 'Sequências', icon: Flame },
    { id: 'level', label: 'Níveis', icon: Star },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'special', label: 'Especiais', icon: Sparkles }
  ] as const;

  return (
    <Card className="glass-card border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Award className="h-4 w-4 text-coins" />
            Conquistas
          </CardTitle>
          <Badge variant="secondary" className="bg-coins/10 text-coins border-coins/20">
            {earnedBadges.length}/{BADGE_DEFINITIONS.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {categories.map(({ id, label, icon: CategoryIcon }) => {
              const categoryBadges = BADGE_DEFINITIONS.filter(b => b.category === id);
              const earnedInCategory = categoryBadges.filter(b => earnedBadges.includes(b.id)).length;
              
              return (
                <div key={id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CategoryIcon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {earnedInCategory}/{categoryBadges.length}
                    </span>
                  </div>
                  <BadgesGrid 
                    earnedBadges={earnedBadges} 
                    category={id} 
                    showLocked 
                    size="sm" 
                  />
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Function to get earned badge IDs from profile data
export function getEarnedBadgeIds(profile: {
  level: number;
  currentStreak: number;
  bestStreak: number;
  dailyGoalsAchieved: number;
  totalXP: number;
}): string[] {
  return BADGE_DEFINITIONS.filter(badge => {
    switch (badge.requirement.type) {
      case 'streak':
        return profile.bestStreak >= badge.requirement.value;
      case 'level':
        return profile.level >= badge.requirement.value;
      case 'goals':
        return profile.dailyGoalsAchieved >= badge.requirement.value;
      case 'xp':
        return profile.totalXP >= badge.requirement.value;
      default:
        return false;
    }
  }).map(b => b.id);
}
