import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CompactStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "default";
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case "primary":
      return {
        iconBg: "bg-primary",
        iconColor: "text-primary-foreground",
        textColor: "text-primary",
      };
    case "success":
      return {
        iconBg: "bg-success",
        iconColor: "text-success-foreground",
        textColor: "text-success",
      };
    case "warning":
      return {
        iconBg: "bg-warning",
        iconColor: "text-warning-foreground",
        textColor: "text-warning",
      };
    case "danger":
      return {
        iconBg: "bg-destructive",
        iconColor: "text-destructive-foreground",
        textColor: "text-destructive",
      };
    case "info":
      return {
        iconBg: "bg-info",
        iconColor: "text-info-foreground",
        textColor: "text-info",
      };
    default:
      return {
        iconBg: "bg-muted",
        iconColor: "text-muted-foreground",
        textColor: "text-foreground",
      };
  }
};

export function CompactStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
}: CompactStatCardProps) {
  const styles = getVariantStyles(variant);

  return (
    <motion.div
      className="glass rounded-xl p-4 border border-border/40 group cursor-pointer"
      whileHover={{
        scale: 1.03,
        y: -2,
        boxShadow: "0 10px 30px -10px hsl(var(--foreground) / 0.1)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3">
        {/* Circular Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium truncate">
            {title}
          </p>
          <p className={cn("text-lg font-bold font-display", styles.textColor)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
