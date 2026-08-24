import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import { motion } from "framer-motion";

interface TopSeller {
  id: string;
  name: string;
  avatar_url: string | null;
  unitsSold: number;
  revenue: number;
  quotesCount: number;
  ordersCount: number;
}

interface TopSellersRankListProps {
  sellers: TopSeller[];
}

const formatCompact = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const rankStyles = [
  "bg-gradient-to-r from-rank-gold/10 to-transparent border border-rank-gold/30",
  "bg-gradient-to-r from-rank-silver/10 to-transparent border border-rank-silver/20",
  "bg-gradient-to-r from-rank-bronze/10 to-transparent border border-rank-bronze/20",
];

const rankBadgeStyles = ["rank-gold", "rank-silver", "rank-bronze"];

export const TopSellersRankList = React.memo(function TopSellersRankList({ sellers }: TopSellersRankListProps) {
  if (sellers.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-display font-semibold flex items-center gap-2 mb-3">
        <Crown className="h-4 w-4 text-rank-gold" />
        Top Vendedores
      </h4>
      <div className="space-y-2">
        {sellers.map((seller, idx) => (
          <motion.div
            key={seller.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all hover-lift-sm",
              rankStyles[idx] ?? "bg-muted/30 border border-transparent"
            )}
          >
            <span
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow shrink-0",
                rankBadgeStyles[idx] ?? "bg-muted text-muted-foreground"
              )}
            >
              {idx === 0 ? <Crown className="h-3.5 w-3.5" /> : idx + 1}
            </span>

            <Avatar className="h-8 w-8 ring-2 ring-border shrink-0">
              <AvatarImage src={seller.avatar_url || undefined} />
              <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                {seller.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <span className="font-display font-semibold text-sm flex-1 truncate">
              {seller.name}
            </span>

            <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
              <span>{seller.unitsSold.toLocaleString("pt-BR")} un</span>
              <span className="font-bold text-foreground">{formatCompact(seller.revenue)}</span>
              <span className="text-primary">{seller.quotesCount} orç</span>
              <span>{seller.ordersCount} ped</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
});
