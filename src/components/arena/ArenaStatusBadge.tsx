import React from 'react';
import { cn } from "@/lib/utils";

interface ArenaStatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'victory';
  label?: string;
  className?: string;
  showRipple?: boolean;
}

export const ArenaStatusBadge: React.FC<ArenaStatusBadgeProps> = ({ 
  status, 
  label, 
  className,
  showRipple = true 
}) => {
  const statusConfig = {
    online: {
      color: 'bg-status-success',
      shadow: 'shadow-glow-success',
      ripple: 'bg-status-success/20',
      text: 'text-status-success'
    },
    victory: {
      color: 'bg-rank-gold',
      shadow: 'shadow-glow-gold',
      ripple: 'bg-rank-gold/20',
      text: 'text-rank-gold'
    },
    busy: {
      color: 'bg-status-warning',
      shadow: 'shadow-glow-warning',
      ripple: 'bg-status-warning/20',
      text: 'text-status-warning'
    },
    offline: {
      color: 'bg-muted-foreground',
      shadow: '',
      ripple: 'bg-muted-foreground/10',
      text: 'text-muted-foreground'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/40 backdrop-blur-md border border-white/10 shadow-lg group", className)}>
      <div className="relative flex items-center justify-center">
        {showRipple && status !== 'offline' && (
          <div className={cn("absolute inset-0 rounded-full animate-ping-slow", config.ripple)} />
        )}
        <div className={cn("w-2 h-2 rounded-full relative z-10", config.color, config.shadow)} />
      </div>
      {label && (
        <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", config.text)}>
          {label}
        </span>
      )}
    </div>
  );
};
