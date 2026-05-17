import { useState, useEffect, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Zap, Wifi } from 'lucide-react';
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
}, _ref) => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Check if user has dismissed before
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Show again after 7 days
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

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  const features = [
    { icon: Zap, text: 'Acesso rápido' },
    { icon: Wifi, text: 'Funciona offline' },
    { icon: Smartphone, text: 'Como um app nativo' },
  ];

  if (variant === 'minimal') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={cn(
            "fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto",
            "z-50",
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
      </AnimatePresence>
    );
  }

  if (variant === 'card') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cn(
            "fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80",
            "bg-card border rounded-2xl shadow-xl p-4",
            "z-50",
            className
          )}
        >
          <button
            onClick={handleDismiss}
            aria-label="Dispensar sugestão de instalação"
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Instalar PROMO CHAMPIONS</h3>
              <p className="text-sm text-muted-foreground">Acesso rápido ao app</p>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                <feature.icon className="h-3 w-3" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          <Button 
            onClick={handleInstall}
            disabled={isInstalling}
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            {isInstalling ? 'Instalando...' : 'Instalar Agora'}
          </Button>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Banner variant (default)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50",
          "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
          "px-4 py-3",
          className
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">
              Instale o PROMO CHAMPIONS para uma experiência completa
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="secondary"
              size="sm"
              onClick={handleInstall}
              disabled={isInstalling}
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              {isInstalling ? 'Instalando...' : 'Instalar'}
            </Button>
            <button
              onClick={handleDismiss}
              aria-label="Dispensar sugestão de instalação"
              className="p-1 rounded-full hover:bg-primary-foreground/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

InstallPrompt.displayName = 'InstallPrompt';
