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
  /** Mini stats/preview shown inline when collapsed */
  previewStats?: Array<{ label: string; value: string }>;
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
  previewStats,
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
        className="flex items-center gap-3 group w-full text-left py-2 px-2 rounded-xl hover:bg-muted/40 transition-all duration-200 -mx-2"
        aria-expanded={isOpen}
      >
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors shrink-0">
            {icon}
          </span>
        )}
        <h2 className="text-sm font-semibold text-foreground/85 group-hover:text-foreground transition-colors">
          {title}
        </h2>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
        )}
        <div className="flex-1 h-px bg-gradient-to-r from-border/40 via-border/20 to-transparent mx-2" />
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
            className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-muted/30 to-muted/10 border border-border/30 hover:bg-muted/50 hover:border-primary/20 hover:shadow-sm transition-all duration-300 group/teaser"
          >
            <div className="flex items-center gap-3">
              {previewStats && previewStats.length > 0 ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {previewStats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground/90">{stat.value}</span>
                      <span className="text-[10px] text-muted-foreground">{stat.label}</span>
                      {i < previewStats.length - 1 && <span className="text-muted-foreground/30 mx-0.5">·</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex gap-1">
                    <motion.div className="h-1.5 w-6 rounded-full bg-primary/30" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
                    <motion.div className="h-1.5 w-4 rounded-full bg-primary/20" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, delay: 0.3, repeat: Infinity }} />
                    <motion.div className="h-1.5 w-5 rounded-full bg-primary/15" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, delay: 0.6, repeat: Infinity }} />
                  </div>
                  <p className="text-xs text-muted-foreground group-hover/teaser:text-foreground transition-colors flex-1">
                    {teaser}
                  </p>
                </>
              )}
              <span className="text-primary font-medium text-xs shrink-0 group-hover/teaser:translate-x-1 transition-transform duration-200">
                → Expandir
              </span>
            </div>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
