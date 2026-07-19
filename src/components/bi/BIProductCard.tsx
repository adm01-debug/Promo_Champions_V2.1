import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BIProductCardProps {
  name: string;
  sales?: number;
  growth?: string;
  confidence?: number;
  imageUrl?: string;
  productId?: string;
  className?: string;
}

export const BIProductCard = ({ 
  name, 
  sales, 
  growth, 
  confidence, 
  imageUrl, 
  productId,
  className 
}: BIProductCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="size-12 rounded-lg object-cover bg-black/20" />
        ) : (
          <div className="size-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <ShoppingBag className="size-6" />
          </div>
        )}
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-tighter">{name}</p>
          <div className="flex items-center gap-2">
            {sales !== undefined && (
              <p className="text-[10px] text-muted-foreground font-medium">
                {sales.toLocaleString()} vendidos / 90d
              </p>
            )}
            {confidence !== undefined && (
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                {confidence}% Confiança
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {growth && (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[10px]">
            {growth}
          </Badge>
        )}
        {productId && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Ver produto"
            className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20 text-primary hover:bg-primary hover:text-white"
          >
            <ArrowUpRight className="size-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
