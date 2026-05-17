import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface UpdatePromptProps {
  className?: string;
}

export function UpdatePrompt({ className }: UpdatePromptProps) {
  const { isUpdateAvailable, updateApp } = usePWA();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={cn(
          "fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80",
          "bg-card border rounded-2xl shadow-xl p-4",
          "z-50",
          className
        )}
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5 text-info" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Atualização disponível</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Uma nova versão do app está disponível. Atualize para obter as últimas melhorias.
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button 
                onClick={updateApp}
                size="sm"
                className="gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
