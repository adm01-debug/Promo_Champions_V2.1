import React, { FC, memo, useCallback, useState, useRef, useEffect } from 'react';
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

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  showLabel?: boolean;
}

// Simple history tracker for the session
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

  // Load history from session storage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored).slice(0, 10));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  // Update history when location changes
  useEffect(() => {
    if (isHomePage) return;
    
    setHistory(prev => {
      // Don't add if same as current top
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
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  }, [navigate, fallbackPath]);

  if (isHomePage) return null;

  const historyItems = history.filter(item => item.path !== location.pathname);

  return (
    <div className="flex items-center">
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center -space-x-px">
              <Button
                variant={variant}
                size={showLabel ? "sm" : "icon-sm"}
                onClick={handleBack}
                className={cn(
                  "gap-1.5 transition-all duration-200 active:scale-95 z-10",
                  showLabel ? "rounded-r-none pr-2" : "rounded-r-none",
                  variant === "ghost" && "text-muted-foreground hover:text-foreground hover:bg-accent/10",
                  className
                )}
                aria-label={label}
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
                        "h-8 w-5 px-0 rounded-l-none border-l border-border/20 transition-all duration-200 opacity-60 hover:opacity-100",
                        variant === "ghost" && "hover:bg-accent/10"
                      )}
                    >
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border/50 mb-1">
                      <History className="h-3 w-3" />
                      Histórico Recente
                    </div>
                    {historyItems.map((item, i) => (
                      <DropdownMenuItem 
                        key={`${item.path}-${i}`}
                        onClick={() => navigate(item.path)}
                        className="text-xs flex flex-col items-start gap-0.5"
                      >
                        <span className="font-medium truncate w-full">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground truncate w-full">{item.path}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {label} (Voltar)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
});

BackButton.displayName = "BackButton";
