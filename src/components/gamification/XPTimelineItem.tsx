import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface XPTimelineItemProps {
  id: string;
  xp_amount: number;
  source_type: string;
  description: string | null;
  created_at: string;
  icon: React.ElementType;
  iconColor: string;
  label: string;
  timeAgo: string;
  groupIndex: number;
  itemIndex: number;
}

export const XPTimelineItem = React.memo(function XPTimelineItem({
  xp_amount, description, icon: Icon, iconColor, label, timeAgo, groupIndex, itemIndex,
}: XPTimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (groupIndex * 0.05) + (itemIndex * 0.02) }}
      className="relative flex items-start gap-3 group"
    >
      <div className={cn(
        "absolute -left-6 mt-1.5 h-[18px] w-[18px] rounded-full",
        "flex items-center justify-center",
        "bg-card border-2 border-border/50",
        "group-hover:border-primary/50 transition-colors"
      )}>
        <Icon className={cn("h-2.5 w-2.5", iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted/50">{label}</span>
            {description && <span className="text-xs text-muted-foreground truncate">{description}</span>}
          </div>
          <Badge variant="outline" className="shrink-0 font-mono text-xs bg-xp/5 text-xp border-xp/20">+{xp_amount}</Badge>
        </div>
        <span className="text-[10px] text-muted-foreground/70">{timeAgo}</span>
      </div>
    </motion.div>
  );
});
