import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: string;
  /** Teaser text shown when section is collapsed */
  teaser?: string;
  /** If true, no collapsible wrapper — just render children directly */
  alwaysOpen?: boolean;
}

export function DashboardSection({
  title,
  icon,
  children,
  defaultOpen = true,
  className,
  badge,
  teaser,
  alwaysOpen = false,
}: DashboardSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (alwaysOpen) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 group w-full text-left py-1 px-1 rounded-lg hover:bg-muted/30 transition-colors -mx-1"
        aria-expanded={isOpen}
      >
        {icon && (
          <span className="text-primary/70 group-hover:text-primary transition-colors">
            {icon}
          </span>
        )}
        <h2 className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">
          {title}
        </h2>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
        )}
        <div className="flex-1 h-px bg-border/40 mx-2" />
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
