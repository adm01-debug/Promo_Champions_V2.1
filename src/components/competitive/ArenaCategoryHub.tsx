import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type ArenaCategoryId =
  | "all"
  | "ranking"
  | "competitions"
  | "profile"
  | "broadcast"
  | "tools";

export interface ArenaCategory {
  id: ArenaCategoryId;
  label: string;
  description: string;
  icon: LucideIcon;
  tabs: string[];
  gradient: string;
}

interface ArenaCategoryHubProps {
  categories: ArenaCategory[];
  activeCategory: ArenaCategoryId;
  onSelect: (id: ArenaCategoryId) => void;
  tabCounts?: Record<string, number>;
}

/**
 * Hub de entrada da Arena Competitiva.
 * Substitui a explosão de 24 tabs por 5 categorias visuais.
 * Cada card filtra a barra de tabs abaixo.
 */
export const ArenaCategoryHub = memo(function ArenaCategoryHub({
  categories,
  activeCategory,
  onSelect,
}: ArenaCategoryHubProps) {
  return (
    <nav
      aria-label="Categorias da Arena Competitiva"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      {categories.map((cat, idx) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <motion.button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-pressed={isActive}
            aria-label={`Filtrar por ${cat.label}: ${cat.description}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.35 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
          >
            <Card
              className={cn(
                "relative overflow-hidden p-4 h-full border transition-all duration-300 group",
                isActive
                  ? "border-primary/60 bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none",
                  cat.gradient,
                  isActive ? "opacity-100" : "group-hover:opacity-60"
                )}
              />
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-white/5 text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest tabular-nums",
                      isActive ? "text-primary" : "text-muted-foreground/60"
                    )}
                  >
                    {cat.tabs.length}
                  </span>
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-black uppercase tracking-wider leading-tight",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {cat.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 mt-1 leading-snug line-clamp-2">
                    {cat.description}
                  </p>
                </div>
              </div>
            </Card>
          </motion.button>
        );
      })}
    </nav>
  );
});
