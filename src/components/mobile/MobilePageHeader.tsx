import React, { FC, ReactNode, memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { motion, PanInfo } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface MobilePageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  className?: string;
  onMenuClick?: () => void;
}

export const MobilePageHeader: FC<MobilePageHeaderProps> = memo(({
  title,
  subtitle,
  showBack = true,
  rightAction,
  className,
  onMenuClick
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';
  const canGoBack = !isHomePage && window.history.length > 1;

  const triggerHaptic = useCallback(() => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, []);

  const handleBack = useCallback(() => {
    triggerHaptic();
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  }, [canGoBack, navigate, triggerHaptic]);

  // Swipe to back logic
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100 && Math.abs(info.offset.y) < 50) {
      handleBack();
    }
  };

  if (!isMobile) return null;

  return (
    <motion.header 
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ right: 0.1, left: 0 }}
      onDragEnd={handleDragEnd}
      className={cn(
        "sticky top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50",
        "safe-area-inset-top",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left Section */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {showBack && !isHomePage && (
            <Button
              variant="ghost"
              size="icon" 
              aria-label="Voltar"
              onClick={handleBack}
              className="h-11 w-11 shrink-0 -ml-2 hover:bg-accent/10 active:scale-90 transition-transform touch-none"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="min-w-0 flex-1 ml-1">
            <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-widest truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 shrink-0">
          {rightAction}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon" 
              aria-label="Mais opções"
              onClick={onMenuClick}
              className="h-11 w-11"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
});

MobilePageHeader.displayName = "MobilePageHeader";
