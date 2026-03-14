import { useState, useEffect, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

interface InstallPromptProps {
  className?: string;
  variant?: 'banner' | 'card' | 'minimal';
  onDismiss?: () => void;
}

export const InstallPrompt = forwardRef<HTMLDivElement, InstallPromptProps>(({ 
  className, 
  variant = 'banner',
  onDismiss 
}, ref) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', String(Date.now()));
    onDismiss?.();
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installApp();
    setIsInstalling(false);
    if (success) {
      handleDismiss();
    }
  };

  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto",
          "z-40",
          className
        )}
      >
        <Button 
          onClick={handleInstall}
          disabled={isInstalling}
          className="w-full md:w-auto gap-2 shadow-lg"
        >
          <Download className="h-4 w-4" />
          {isInstalling ? 'Instalando...' : 'Instalar App'}
        </Button>
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "fixed bottom-20 md:bottom-4 right-4 w-72",
          "bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-xl p-3.5",
          "z-40",
          className
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Download className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Instalar SalesPro</h3>
            <p className="text-[11px] text-muted-foreground">Acesso rápido ao app</p>
          </div>
        </div>

        <Button 
          onClick={handleInstall}
          disabled={isInstalling}
          size="sm"
          className="w-full gap-2 h-8 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          {isInstalling ? 'Instalando...' : 'Instalar Agora'}
        </Button>
      </motion.div>
    );
  }

  // Banner variant - top bar, less intrusive
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40",
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
          "px-4 py-2.5",
          className
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Download className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">
              Instale o SalesPro para acesso rápido
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleInstall}
              disabled={isInstalling}
              className="gap-1 h-7 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {isInstalling ? 'Instalando...' : 'Instalar'}
            </Button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

InstallPrompt.displayName = 'InstallPrompt';
