
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Flame, 
  Star, 
  TrendingUp, 
  Award,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

export const SDRAchievementTracker = () => {
  return (
    <Card className="glass border-primary/20 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Flame className="h-4 w-4 text-orange-500 animate-bounce" />
          <span className="text-xs font-bold text-primary">Streak: 12 Dias</span>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Level Hexagon */}
          <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/30 relative z-10">
              <div className="text-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Nível</p>
                <p className="text-3xl font-black text-primary leading-none">14</p>
              </div>
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full scale-125"
            />
          </div>

          <div className="flex-1 w-full space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Elite Prospector 
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                </h3>
                <p className="text-xs text-muted-foreground">Faltam 450 XP para o Nível 15</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-primary">82%</span>
              </div>
            </div>
            <Progress value={82} className="h-2 bg-primary/5" />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-2 rounded-lg bg-background/50 border border-primary/5 flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-medium">Top do Mês</span>
              </div>
              <div className="p-2 rounded-lg bg-background/50 border border-primary/5 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-[10px] font-medium">Power User</span>
              </div>
              <div className="p-2 rounded-lg bg-background/50 border border-primary/5 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-[10px] font-medium">Super Growth</span>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-bold text-primary italic">PRÓXIMO: Legend</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
