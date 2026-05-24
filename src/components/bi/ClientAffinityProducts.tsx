import { Target, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BIProductCard } from "@/components/dashboard/modules/BIProductCard";

interface ClientAffinityProductsProps {
  data: {
    topCategories: string[];
    suggestedProducts: { name: string; confidence: number }[];
  };
}

export function ClientAffinityProducts({ data }: ClientAffinityProductsProps) {
  return (
    <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl rounded-3xl h-full">
      <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8">
        <Target className="size-5 text-primary" /> Perfil de <span className="text-primary">Afinidade</span>
      </h3>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {data.topCategories.map((cat) => (
            <Badge key={cat} className="bg-primary/20 text-primary border-primary/30 px-3 py-1 font-black uppercase tracking-widest text-[9px]">
              {cat}
            </Badge>
          ))}
        </div>
        <div className="space-y-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="size-3 text-emerald-500" /> Sugestões Estratégicas
          </p>
          {data.suggestedProducts.map((prod) => (
            <BIProductCard key={prod.name} name={prod.name} confidence={prod.confidence} />
          ))}
        </div>
      </div>
    </Card>
  );
}
