import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trophy, 
  Target, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

const ProfilePerformanceCard = React.memo(function ProfilePerformanceCard() {
  const { salesperson } = useAuth();

  // Mock data for high-fidelity feel - in a real app this would come from a specialized hook
  const stats = [
    { 
      label: "Nível Ativo", 
      value: 42, 
      icon: Trophy, 
      color: "text-yellow-500", 
      bg: "bg-yellow-500/10",
      description: "Elite Ranger" 
    },
    { 
      label: "Win Rate", 
      value: "68%", 
      icon: Target, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10",
      description: "+5% vs Méd." 
    },
    { 
      label: "Velocidade", 
      value: "9.2", 
      icon: Zap, 
      color: "text-orange-500", 
      bg: "bg-orange-500/10",
      description: "Ultra-Fast" 
    },
    { 
      label: "Qualidade", 
      value: "A+", 
      icon: ShieldCheck, 
      color: "text-green-500", 
      bg: "bg-green-500/10",
      description: "Impecável" 
    }
  ];

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md shadow-xl">
      <CardContent className="p-0">
        <div className="relative p-6">
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Star className="w-24 h-24 rotate-12" />
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-accent p-0.5 shadow-lg shadow-primary/20">
                <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                   {salesperson?.avatar_url ? (
                     <img src={salesperson.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <span className="text-xl font-bold text-primary">
                       {salesperson?.name?.substring(0, 2).toUpperCase() || "JD"}
                     </span>
                   )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-success flex items-center justify-center border-2 border-background shadow-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold tracking-tight">{salesperson?.name || "Usuário Elite"}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  {salesperson?.role || "Vendedor"}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                  Membro desde 2024
                </span>
              </div>
            </div>

            <button className="p-2 rounded-xl hover:bg-accent transition-colors group">
              <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-2xl bg-accent/30 border border-white/5 hover:border-primary/20 transition-all cursor-default"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight">
                    {stat.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black">{stat.value}</span>
                  <span className="text-[9px] text-muted-foreground font-medium italic">
                    {stat.description}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/5">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">XP Progress</span>
              <span className="text-[10px] font-bold text-primary">2.450 / 3.000 XP</span>
            </div>
            <div className="h-1.5 w-full bg-accent/30 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "82%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-xp-shimmer rounded-full"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProfilePerformanceCard.displayName = "ProfilePerformanceCard";
export default ProfilePerformanceCard;
