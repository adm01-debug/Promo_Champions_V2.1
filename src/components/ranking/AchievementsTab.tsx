import { memo } from "react";
import { Flame, Trophy, Star, Sparkles, Target, Zap, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface AchievementData {
  id: string;
  achievement_type: string;
  achievement_date: string;
  details: { name?: string; streak?: number } | null;
  salespeople: { name: string; avatar_url: string | null } | null;
}

interface AchievementsTabProps {
  achievements: AchievementData[];
}

export const AchievementsTab = memo(function AchievementsTab({ achievements }: AchievementsTabProps) {
  if (!achievements || achievements.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="glass border-border/50">
          <CardContent className="py-24 text-center">
            <div className="relative inline-block mb-6">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground/20" />
              <Star className="h-6 w-6 text-muted-foreground/30 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-muted-foreground uppercase tracking-widest">Nenhuma conquista ainda</h3>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
              A arena está silenciosa. Comece a fechar contratos para desbloquear honrarias de elite.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {achievements.map((achievement) => {
        const details = achievement.details as { name?: string; streak?: number } | null;
        const isStreak = achievement.achievement_type.includes("streak");
        const isElite = achievement.achievement_type.includes("elite") || (details?.streak || 0) > 5;

        return (
          <motion.div key={achievement.id} variants={itemVariants}>
            <Card className={`glass border-border/40 overflow-hidden relative group hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10`}>
              {isElite && (
                <div className="absolute top-0 right-0 p-1">
                  <div className="bg-rank-gold/20 text-rank-gold text-[10px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Elite
                  </div>
                </div>
              )}
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${
                    isStreak 
                      ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-500" 
                      : "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 text-blue-500"
                  }`}>
                    {isStreak ? (
                      <Flame className={`h-7 w-7 ${isElite ? "animate-pulse" : ""}`} />
                    ) : (
                      <Zap className="h-7 w-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 border border-border/50 ring-2 ring-background">
                        <AvatarImage src={achievement.salespeople?.avatar_url || ""} />
                        <AvatarFallback className="text-[10px] font-bold">
                          {(achievement.salespeople?.name || "?")[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-black text-sm truncate uppercase tracking-tight">
                        {achievement.salespeople?.name || "Guerreiro"}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-black text-lg leading-tight group-hover:text-primary transition-colors">
                        {isStreak ? `STREAK DE ${details?.streak || 0} DIAS` : "CONTRATO DE IMPACTO"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px] font-black h-5 px-1.5 uppercase bg-muted/50 border-0">
                          {isStreak ? "Persistência" : "Performance"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase">
                          {format(new Date(achievement.achievement_date), "dd MMM yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/20 flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                    ))}
                  </div>
                  <Sparkles className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-colors duration-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
});
