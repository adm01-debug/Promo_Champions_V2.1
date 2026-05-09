import { memo } from "react";
import { LucideIcon, TrendingUp, TrendingDown, Sparkles, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CloserStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  subtitle?: string;
  highlight?: boolean;
  hero?: boolean;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case "primary":
      return {
        border: "border-primary/30",
        glow: "rgba(14, 165, 233, 0.2)",
        text: "text-primary",
        bg: "bg-primary/10",
      };
    case "success":
      return {
        border: "border-success/30",
        glow: "rgba(34, 197, 94, 0.2)",
        text: "text-success",
        bg: "bg-success/10",
      };
    case "warning":
      return {
        border: "border-warning/30",
        glow: "rgba(234, 179, 8, 0.2)",
        text: "text-warning",
        bg: "bg-warning/10",
      };
    case "danger":
      return {
        border: "border-destructive/30",
        glow: "rgba(239, 68, 68, 0.2)",
        text: "text-destructive",
        bg: "bg-destructive/10",
      };
    default:
      return {
        border: "border-white/10",
        glow: "rgba(255, 255, 255, 0.05)",
        text: "text-foreground",
        bg: "bg-white/5",
      };
  }
};

const CloserStatCardInner = function CloserStatCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  variant = "default",
  subtitle,
  highlight = false,
  hero = false,
}: CloserStatCardProps) {
  const isPositive = (change ?? 0) >= 0;
  const styles = getVariantStyles(variant);

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 bg-black/40 backdrop-blur-md border border-white/5 group h-full",
        styles.border,
        hero && "md:col-span-2 border-primary/20 bg-primary/[0.02] shadow-[0_0_30px_rgba(14,165,233,0.05)]",
        highlight && "ring-1 ring-primary/30"
      )}>
        {/* Decorative elements for Hero */}
        {hero && (
          <>
            <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-20">
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary" />
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-20">
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary" />
            </div>
            <motion.div 
              className="absolute left-0 w-full h-[1px] bg-primary/20 z-0 pointer-events-none"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}

        {/* Cyber bits */}
        <div className="absolute top-2 right-2 flex gap-1 pointer-events-none opacity-20">
          <div className="w-1 h-1 bg-current rounded-full" />
          <div className="w-1 h-1 bg-current rounded-full opacity-50" />
          <div className="w-1 h-1 bg-current rounded-full opacity-25" />
        </div>

        <CardContent className={cn("p-5 relative z-10", hero && "sm:p-8")}>
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  {title}
                </p>
                {highlight && <Zap className="h-3 w-3 text-primary animate-pulse" />}
              </div>
              
              <div className="flex flex-col gap-1">
                <span className={cn(
                  "font-mono font-black tracking-tighter tabular-nums leading-none",
                  hero ? "text-4xl sm:text-6xl md:text-7xl lg:text-8xl" : "text-2xl sm:text-3xl",
                  styles.text,
                  hero && "bg-clip-text text-transparent bg-gradient-to-br from-primary via-primary-glow to-primary"
                )} style={{ 
                  textShadow: `0 0 20px ${styles.glow}`
                }}>
                  {value}
                </span>
                
                {change !== undefined && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "flex items-center text-[10px] font-mono font-black px-1.5 py-0.5 rounded border",
                      isPositive 
                        ? "text-success bg-success/10 border-success/30" 
                        : "text-destructive bg-destructive/10 border-destructive/30"
                    )}>
                      {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {Math.abs(change).toFixed(1)}%
                    </span>
                    {subtitle && (
                      <span className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                        {subtitle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className={cn(
              "p-3 rounded-xl border transition-all duration-300 group-hover:scale-110",
              styles.bg,
              styles.border,
              hero && "p-4 rounded-2xl"
            )}>
              <Icon className={cn(
                "h-5 w-5",
                styles.text,
                hero && "h-8 w-8"
              )} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
export const CloserStatCard = memo(CloserStatCardInner);