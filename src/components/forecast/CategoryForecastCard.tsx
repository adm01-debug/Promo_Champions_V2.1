import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, CheckCircle2, Star, Timer } from "lucide-react";
import { formatCompactBRL } from "./forecastHelpers";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Props {
  categories: {
    commit: number;
    best_case: number;
    pipeline: number;
  };
  goal: number;
}

export const CategoryForecastCard: FC<Props> = ({ categories, goal }) => {
  const total = categories.commit + categories.best_case + categories.pipeline;
  
  return (
    <Card className="glass relative overflow-hidden border-2 border-white/5 bg-background/20 hover:shadow-xl transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      <CardContent className="p-7 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-background/60 border border-white/10 shadow-lg flex items-center justify-center text-muted-foreground">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] opacity-60">
                Segmentação
              </span>
              <span className="text-sm font-black uppercase tracking-tight">
                Categorias
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {/* Commit */}
          <CategoryItem 
            label="Commit" 
            value={categories.commit} 
            total={total} 
            color="bg-emerald-500" 
            icon={CheckCircle2} 
            iconColor="text-emerald-500"
          />
          
          {/* Best Case */}
          <CategoryItem 
            label="Best Case" 
            value={categories.best_case} 
            total={total} 
            color="bg-primary" 
            icon={Star} 
            iconColor="text-primary"
          />
          
          {/* Pipeline */}
          <CategoryItem 
            label="Pipeline" 
            value={categories.pipeline} 
            total={total} 
            color="bg-blue-500" 
            icon={Timer} 
            iconColor="text-blue-500"
          />
        </div>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Pipeline Total</span>
          <span className="text-xs font-black">{formatCompactBRL(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

function CategoryItem({ label, value, total, color, icon: Icon, iconColor }: any) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3 w-3", iconColor)} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
        <span className="text-[10px] font-mono opacity-60">{formatCompactBRL(value)}</span>
      </div>
      <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
