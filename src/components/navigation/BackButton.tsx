import React, { FC, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  label?: string;
  fallbackPath?: string;
  className?: string;
}

export const BackButton: FC<BackButtonProps> = memo(({ 
  label = 'Voltar', 
  fallbackPath = '/',
  className 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  if (isHomePage) return null;

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className={cn(
        "gap-1.5 text-muted-foreground hover:text-foreground transition-colors -ml-2",
        className
      )}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </Button>
  );
});

BackButton.displayName = "BackButton";
