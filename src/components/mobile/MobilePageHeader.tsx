import React, { FC, ReactNode, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

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
  
  // Don't show on homepage or if not mobile
  if (!isMobile) return null;
  
  const isHomePage = location.pathname === '/';
  const canGoBack = !isHomePage && window.history.length > 1;

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50",
        "safe-area-inset-top",
        className
      )}
    >
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left Section */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && !isHomePage && (
            <Button
              variant="ghost"
              size="icon" aria-label="Voltar"
              onClick={handleBack}
              className="h-10 w-10 shrink-0 -ml-2"
             
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 shrink-0">
          {rightAction}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon" aria-label="Mais opções"
              onClick={onMenuClick}
              className="h-10 w-10"
             
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
});

MobilePageHeader.displayName = "MobilePageHeader";
