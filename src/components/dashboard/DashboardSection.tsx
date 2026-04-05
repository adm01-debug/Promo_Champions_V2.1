import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dashboard-sections-state";

/** Read persisted section states from localStorage */
function getPersistedStates(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Persist a single section's state */
function persistSectionState(sectionId: string, isOpen: boolean) {
  try {
    const current = getPersistedStates();
    current[sectionId] = isOpen;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Silent fail — localStorage might be full or disabled
  }
}

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
  /** Unique ID for state persistence. Defaults to slugified title. */
  persistId?: string;
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
  persistId,
}: DashboardSectionProps) {
  const sectionId = persistId || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  
  const [isOpen, setIsOpen] = useState(() => {
    const persisted = getPersistedStates();
    return sectionId in persisted ? persisted[sectionId] : defaultOpen;
  });

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      persistSectionState(sectionId, next);
      return next;
    });
  }, [sectionId]);

  if (alwaysOpen) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        onClick={toggle}
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
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        ) : teaser ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setIsOpen(true);
              persistSectionState(sectionId, true);
            }}
            className="w-full text-left px-4 py-3 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group/teaser"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="h-1.5 w-6 rounded-full bg-primary/30" />
                <div className="h-1.5 w-4 rounded-full bg-primary/20" />
                <div className="h-1.5 w-5 rounded-full bg-primary/15" />
              </div>
              <p className="text-xs text-muted-foreground group-hover/teaser:text-foreground transition-colors flex-1">
                {teaser}
              </p>
              <span className="text-primary font-medium text-xs shrink-0 group-hover/teaser:translate-x-0.5 transition-transform">
                → Expandir
              </span>
            </div>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
