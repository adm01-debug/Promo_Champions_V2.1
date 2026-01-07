import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface EducationalTooltipsContextType {
  showTip: (tipId: string) => boolean;
  dismissTip: (tipId: string) => void;
  resetTips: () => void;
  dismissedTips: string[];
}

const EducationalTooltipsContext = createContext<EducationalTooltipsContextType | null>(null);

const STORAGE_KEY = 'salesarena-dismissed-tips';

export function EducationalTooltipsProvider({ children }: { children: ReactNode }) {
  const [dismissedTips, setDismissedTips] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissedTips));
  }, [dismissedTips]);

  const showTip = (tipId: string) => !dismissedTips.includes(tipId);
  
  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => [...prev, tipId]);
  };

  const resetTips = () => {
    setDismissedTips([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <EducationalTooltipsContext.Provider value={{ showTip, dismissTip, resetTips, dismissedTips }}>
      {children}
    </EducationalTooltipsContext.Provider>
  );
}

export function useEducationalTooltips() {
  const context = useContext(EducationalTooltipsContext);
  if (!context) {
    throw new Error('useEducationalTooltips must be used within EducationalTooltipsProvider');
  }
  return context;
}

interface EducationalTooltipProps {
  id: string;
  title: string;
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  delay?: number;
  icon?: ReactNode;
}

export function EducationalTooltip({
  id,
  title,
  content,
  children,
  side = 'top',
  showOnce = true,
  delay = 1000,
  icon,
}: EducationalTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { showTip, dismissTip } = useEducationalTooltips();

  useEffect(() => {
    if (showOnce && !showTip(id)) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [id, showOnce, showTip, delay]);

  const handleDismiss = () => {
    setIsOpen(false);
    if (showOnce) {
      dismissTip(id);
    }
  };

  if (showOnce && !showTip(id)) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <AnimatePresence>
          {isOpen && (
            <TooltipContent
              side={side}
              className="p-0 max-w-xs"
              asChild
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: side === 'top' ? 10 : -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-primary text-primary-foreground rounded-lg shadow-lg overflow-hidden"
              >
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-0.5">
                      {icon || <Lightbulb className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{title}</p>
                      <p className="text-xs opacity-90 mt-1">{content}</p>
                    </div>
                    <button
                      onClick={handleDismiss}
                      className="flex-shrink-0 hover:opacity-70 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="w-full px-3 py-2 text-xs font-medium bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors flex items-center justify-center gap-1"
                >
                  Entendi <ChevronRight className="h-3 w-3" />
                </button>
              </motion.div>
            </TooltipContent>
          )}
        </AnimatePresence>
      </Tooltip>
    </TooltipProvider>
  );
}

// Predefined educational tips
export const educationalTips: TooltipStep[] = [
  {
    id: 'kanban-drag',
    target: '[data-tour="pipeline"]',
    title: 'Arraste para mover',
    content: 'Arraste os cards entre as colunas para atualizar o status do negócio.',
    position: 'bottom',
  },
  {
    id: 'quick-actions',
    target: '[data-tour="quick-actions"]',
    title: 'Ações Rápidas',
    content: 'Use Cmd+K para abrir a paleta de comandos e navegar rapidamente.',
    position: 'bottom',
  },
  {
    id: 'filters',
    target: '[data-tour="filters"]',
    title: 'Filtros Avançados',
    content: 'Combine múltiplos filtros para encontrar exatamente o que procura.',
    position: 'bottom',
  },
  {
    id: 'notifications',
    target: '[data-tour="notifications"]',
    title: 'Notificações',
    content: 'Fique atualizado sobre negócios, metas e atividades importantes.',
    position: 'bottom',
  },
];
