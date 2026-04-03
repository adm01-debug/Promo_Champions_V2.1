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
        className="flex items-center gap-2 group w-full text-left"
        aria-expanded={isOpen}
      >
        {icon && (
          <span className="text-muted-foreground group-hover:text-primary transition-colors">
            {icon}
          </span>
        )}
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
          {title}
        </h2>
        {badge && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
            {badge}
          </span>
        )}
        <motion.span
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
