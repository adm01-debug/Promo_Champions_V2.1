import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BIProductCard } from "./BIProductCard";

interface IndustryTrendingProductsProps {
  data: { name: string; growth: string; sales: number }[];
}

export function IndustryTrendingProducts({ data }: IndustryTrendingProductsProps) {
  return (
    <Card className="p-8 border-border/40 bg-card/30 backdrop-blur-xl relative overflow-hidden rounded-3xl h-full">
      <h3 className="text-lg font-black uppercase italic tracking-tighter flex items-center gap-2 mb-8 relative z-10">
        <TrendingUp className="size-5 text-primary" /> Tendência <span className="text-primary">Setor</span>
      </h3>
      <div className="grid grid-cols-1 gap-4 relative z-10">
        {data.map((trend) => (
          <BIProductCard key={trend.name} name={trend.name} sales={trend.sales} growth={trend.growth} />
        ))}
      </div>
    </Card>
  );
}
