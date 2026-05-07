import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "dashboard-sections-state";

function getPersistedStates(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistSectionState(sectionId: string, isOpen: boolean) {
  try {
    const current = getPersistedStates();
    current[sectionId] = isOpen;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
  }
}

interface DashboardSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  badge?: string;
  teaser?: string;
  previewStats?: Array<{ label: string; value: string }>;
  alwaysOpen?: boolean;
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
    <div className={cn(
      "group rounded-[2.5rem] border border-white/[0.03] bg-[#0d1117]/30 backdrop-blur-xl transition-all duration-700 overflow-hidden",
      isOpen ? "p-4 sm:p-8 border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.4)]" : "p-4 sm:p-6 hover:border-white/[0.1]",
      className
    )}>
      <div 
        className="flex items-center justify-between cursor-pointer select-none relative z-10"
        onClick={toggle}
      >
        <div className="flex items-center gap-6 min-w-0">
          <div className={cn(
            "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-700",
            isOpen ? "bg-primary/10 text-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)] scale-110" : "bg-white/[0.03] text-white/20"
          )}>
            {icon}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className={cn(
                "text-2xl font-black tracking-tightest uppercase transition-colors duration-500",
                isOpen ? "text-white" : "text-white/40"
              )}>
                {title}
              </h2>
              {badge && (
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3">
                  {badge}
                </Badge>
              )}
            </div>
            {!isOpen && teaser && (
              <p className="text-xs font-bold text-white/20 uppercase tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">
                {teaser}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-8">
          {!isOpen && previewStats && (
            <div className="hidden lg:flex items-center gap-8">
              {previewStats.map((stat, i) => (
                <div key={i} className="text-right">
                  <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-sm font-black text-white/40">{stat.value}</p>
                </div>
              ))}
            </div>
          )}
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-700",
              isOpen ? "bg-white/[0.05] text-white" : "bg-transparent text-white/20"
            )}
          >
            <ChevronDown className="h-6 w-6" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 40 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-8 border-t border-white/[0.05] relative z-10">
              {children}
            </div>
            {/* Ambient inner glow */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
