import React, { FC, memo, useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  showLabel?: boolean;
}

const SESSION_HISTORY_KEY = 'app_nav_history';

export const BackButton: FC<BackButtonProps> = memo(({ 
  label = 'Voltar', 
  fallbackPath = '/',
  className,
  variant = "ghost",
  showLabel = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [history, setHistory] = useState<{path: string, title: string}[]>([]);
  const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';

  // Load and update history
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_HISTORY_KEY);
      const parsedHistory = stored ? JSON.parse(stored) : [];
      setHistory(parsedHistory.slice(0, 10));
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  useEffect(() => {
    if (isHomePage) return;
    
    setHistory(prev => {
      if (prev.length > 0 && prev[0].path === location.pathname) return prev;
      
      const newHistory = [{
        path: location.pathname,
        title: document.title.split('|')[0].trim() || location.pathname
      }, ...prev].slice(0, 10);
      
      sessionStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  }, [location.pathname, isHomePage]);

  const handleBack = useCallback(() => {
    triggerHaptic('light');
    
    // Check if there are modals open before going back
    const modals = document.querySelectorAll('[role="dialog"]');
    if (modals.length > 0) {
      // In a real scenario, we might want to close the top modal
      // but here we follow the standard behavior of many apps
      return;
    }

    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  }, [navigate, fallbackPath]);

  // Keyboard shortcut listener (Alt + Left and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is in an input
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInput) return;

      if ((e.altKey && e.key === 'ArrowLeft') || e.key === 'Escape') {
        if (e.key === 'Escape') {
          // If at home, don't do anything
          if (isHomePage) return;
          // If there's a modal, let the modal handle it (it usually does by default)
          if (document.querySelectorAll('[role="dialog"]').length > 0) return;
        }
        
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBack, isHomePage]);

  if (isHomePage) return null;

  const historyItems = history.filter(item => item.path !== location.pathname);

  return (
    <div className="flex items-center group">
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center -space-x-px bg-background/50 backdrop-blur-md rounded-xl border border-border/30 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 group-hover:scale-[1.02]"
            >
              <Button
                variant={variant}
                size={showLabel ? "sm" : "icon-sm"}
                onClick={handleBack}
                className={cn(
                  "gap-1.5 transition-all duration-200 active:scale-95 z-10 h-10 w-10 md:h-9 md:w-auto",
                  showLabel ? "rounded-r-none pr-3" : "rounded-r-none",
                  variant === "ghost" && "text-muted-foreground hover:text-foreground hover:bg-accent/10",
                  className
                )}
                aria-label={`${label} (Alt + Seta Esquerda)`}
              >
                <ArrowLeft className={cn("h-4 w-4", showLabel && "mr-0.5")} />
                {showLabel && <span className="text-xs font-medium">{label}</span>}
              </Button>

              {historyItems.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={variant}
                      size="icon-sm"
                      className={cn(
                        "h-10 w-6 md:h-9 md:w-5 px-0 rounded-l-none border-l border-border/20 transition-all duration-200 opacity-60 hover:opacity-100",
                        variant === "ghost" && "hover:bg-accent/10"
                      )}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="start" 
                    className="w-72 max-h-[85vh] overflow-y-auto backdrop-blur-2xl bg-background/80 border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                  >
                    <div className="flex items-center justify-between px-4 py-3 text-[11px] font-bold text-primary border-b border-primary/10 mb-2 sticky top-0 bg-background/80 backdrop-blur-xl z-20">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1 rounded-md bg-primary/10">
                          <History className="h-3.5 w-3.5" />
                        </div>
                        LINHA DO TEMPO
                      </div>
                      <span className="text-[9px] opacity-40 font-mono tracking-tighter uppercase">Histórico Recente</span>
                    </div>
                    <AnimatePresence>
                      {historyItems.map((item, i) => (
                        <DropdownMenuItem 
                          key={`${item.path}-${i}`}
                          onClick={() => {
                            triggerHaptic('light');
                            navigate(item.path);
                          }}
                          className="text-xs flex flex-col items-start gap-0.5 p-2.5 focus:bg-primary/5 cursor-pointer"
                        >
                          <span className="font-medium truncate w-full flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                            {item.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate w-full pl-3.5">{item.path}</span>
                        </DropdownMenuItem>
                      ))}
                    </AnimatePresence>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[10px] font-medium">
            {label} (Alt + ←)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

BackButton.displayName = "BackButton";
