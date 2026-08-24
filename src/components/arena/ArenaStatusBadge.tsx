import React from 'react';
import { cn } from "@/lib/utils";
import { Zap, Activity, ShieldCheck, Trophy } from 'lucide-react';

interface ArenaStatusBadgeProps {
  status: 'online' | 'offline' | 'busy' | 'victory' | 'hyperdrive';
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
      text: 'text-status-success',
      icon: Activity
    },
    victory: {
      color: 'bg-rank-gold',
      shadow: 'shadow-glow-gold',
      ripple: 'bg-rank-gold/20',
      text: 'text-rank-gold',
      icon: Trophy
    },
    busy: {
      color: 'bg-status-warning',
      shadow: 'shadow-glow-warning',
      ripple: 'bg-status-warning/20',
      text: 'text-status-warning',
      icon: Zap
    },
    hyperdrive: {
      color: 'bg-primary',
      shadow: 'shadow-glow-primary',
      ripple: 'bg-primary/20',
      text: 'text-primary',
      icon: ShieldCheck
    },
    offline: {
      color: 'bg-muted-foreground',
      shadow: '',
      ripple: 'bg-muted-foreground/10',
      text: 'text-muted-foreground',
      icon: Activity
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/60 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-500 hover:scale-105 group relative overflow-hidden",
      className
    )}>
      {/* Dynamic scan effect inside the badge */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
      
      <div className="relative flex items-center justify-center">
        {showRipple && status !== 'offline' && (
          <>
            <div className={cn("absolute inset-0 rounded-full animate-ping-slow scale-150", config.ripple)} />
            <div className={cn("absolute inset-0 rounded-full animate-pulse scale-125 opacity-30", config.ripple)} />
          </>
        )}
        <div className={cn("w-2.5 h-2.5 rounded-full relative z-10 transition-all duration-500 group-hover:scale-125", config.color, config.shadow)} />
      </div>
      
      {label && (
        <div className="flex items-center gap-2">
          <span className={cn("text-[9px] font-black uppercase tracking-[0.25em] transition-colors", config.text)}>
            {label}
          </span>
          <Icon className={cn("h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity", config.text)} />
        </div>
      )}
    </div>
  );
};