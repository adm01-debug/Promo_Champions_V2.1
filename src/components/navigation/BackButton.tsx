import React, { FC, memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  showLabel?: boolean;
}

export const BackButton: FC<BackButtonProps> = memo(({ 
  label = 'Voltar', 
  fallbackPath = '/',
  className,
  variant = "ghost",
  showLabel = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/' || location.pathname === '/dashboard';
  
  const handleBack = useCallback(() => {
    // If we have history, go back
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Otherwise use the fallback
      navigate(fallbackPath);
    }
  }, [navigate, fallbackPath]);

  if (isHomePage) return null;

  const content = (
    <Button
      variant={variant}
      size={showLabel ? "sm" : "icon-sm"}
      onClick={handleBack}
      className={cn(
        "gap-1.5 transition-all duration-200 active:scale-95",
        variant === "ghost" && "text-muted-foreground hover:text-foreground hover:bg-accent/10 -ml-2",
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className={cn("h-4 w-4", showLabel && "mr-0.5")} />
      {showLabel && <span className="text-xs font-medium">{label}</span>}
    </Button>
  );

  if (!showLabel) {
    return (
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
});

BackButton.displayName = "BackButton";
