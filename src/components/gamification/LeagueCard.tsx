import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Zap, Shield } from "lucide-react";
import { useLeagues, LEAGUE_CONFIG, type LeagueTier } from "@/hooks/gamification/useLeagues";
import { cn } from "@/lib/utils";

function _LeagueCard() {
  const { data: members, isLoading } = useLeagues();

  if (isLoading) {
    return (
      <div className="glass rounded-xl p-5 animate-pulse">
        <div className="h-6 bg-muted/50 rounded w-40 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/30 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) return null;

  // Group by league
  const leagueGroups = Object.entries(LEAGUE_CONFIG)
    .reverse()
    .map(([tier, config]) => ({
      tier: tier as LeagueTier,
      config,
      members: members.filter((m) => m.league === tier),
    }))
    .filter((g) => g.members.length > 0);

  return (
    <div className="glass rounded-xl border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/40 bg-gradient-to-r from-primary/[0.03] to-transparent">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Sistema de Ligas</h2>
            <p className="text-xs text-muted-foreground">
              Suba de liga para ganhar bônus de XP! 🏆
            </p>
          </div>
        </div>
      </div>

      {/* League tiers overview */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {Object.entries(LEAGUE_CONFIG).map(([tier, config]) => {
            const count = members.filter((m) => m.league === tier).length;
            return (
              <motion.div
                key={tier}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
                  count > 0 ? "border-border/50" : "border-border/20 opacity-50"
                )}
                whileHover={{ scale: 1.05 }}
              >
                <span>{config.emoji}</span>
                <span>{config.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                    {count}
                  </Badge>
                )}
                {config.xpBonus > 0 && (
                  <span className="text-[10px] text-success">+{config.xpBonus}%</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* League groups */}
      <ScrollArea className="max-h-[400px]">
        <div className="p-4 space-y-4">
          {leagueGroups.map(({ tier, config, members: leagueMembers }) => (
            <div key={tier}>
              {/* League header */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{config.emoji}</span>
                <span className="text-sm font-bold">{config.label}</span>
                <div className="flex-1 h-px bg-border/30" />
                {config.xpBonus > 0 && (
                  <span className="text-[10px] text-success flex items-center gap-0.5">
                    <Zap className="h-2.5 w-2.5" />
                    +{config.xpBonus}% XP
                  </span>
                )}
              </div>

              {/* Members */}
              <div className="space-y-1.5">
                {leagueMembers.map((member, idx) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors",
                      idx === 0 && tier === "legendary" ? "bg-streak/5 border border-streak/20" :
                      idx === 0 && tier === "diamond" ? "bg-accent/5 border border-accent/20" :
                      idx === 0 && tier === "gold" ? "bg-warning/5 border border-warning/20" : ""
                    )}
                  >
                    {/* Rank */}
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">
                      {idx + 1}
                    </span>

                    {/* Avatar */}
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                        {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{member.name}</span>
                    </div>

                    {/* Points */}
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-bold">{member.points.toLocaleString("pt-BR")}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

export const LeagueCard = React.memo(_LeagueCard);
