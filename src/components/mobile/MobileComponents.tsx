import { FC, ReactNode, useCallback } from 'react';
import { PreloadLink } from '@/components/navigation/PreloadLink';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface NavItem {
  icon: ReactNode;
  filledIcon?: ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
  badge?: number;
}

interface MobileBottomNavProps {
  items: NavItem[];
  className?: string;
}

const NavButton: FC<{ item: NavItem; index: number }> = ({ item }) => {
  const displayIcon = item.isActive && item.filledIcon ? item.filledIcon : item.icon;
  
  const handleInteraction = useCallback(() => {
    triggerHaptic('light');
    if (item.onClick) item.onClick();
  }, [item]);

  const content = (
    <>
      {/* Sliding pill background */}
      {item.isActive && (
        <motion.div
          layoutId="mobile-nav-pill"
          className="absolute inset-x-2 top-1.5 bottom-1.5 rounded-xl bg-primary/10"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <motion.div
        animate={item.isActive ? { 
          scale: [1, 1.25, 1.1], 
          y: [-2, -6, -2],
          rotate: [0, -5, 5, 0]
        } : { scale: 1, y: 0, rotate: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 400, 
          damping: 15,
          duration: 0.4
        }}
        className="relative"
      >
        {displayIcon}
        {/* Notification badge with ping animation */}
        {item.badge && item.badge > 0 && (
          <span className="absolute -top-1.5 -right-2 flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-destructive opacity-75"></span>
            <span className="relative min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold leading-none shadow-sm">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          </span>
        )}
      </motion.div>
      <span className={cn(
        "mt-0.5 truncate text-[10px] font-medium transition-colors relative z-10",
        item.isActive ? "text-primary font-semibold" : "text-muted-foreground"
      )}>
        {item.label}
      </span>
    </>
  );

  const baseClasses = cn(
    "relative flex flex-col items-center justify-center flex-1",
    "min-h-[48px] min-w-[48px] py-1.5 px-1",
    "text-xs transition-colors touch-manipulation",
    "active:scale-95 active:opacity-70",
    item.isActive
      ? "text-primary"
      : "text-muted-foreground"
  );

  if (item.onClick) {
    return (
      <button
        onClick={handleInteraction}
        type="button"
        className={baseClasses}
        aria-label={item.label}
      >
        {content}
      </button>
    );
  }

  return (
    <PreloadLink
      to={item.href}
      onClick={item.onClick}
      className={baseClasses}
      aria-label={item.label}
      aria-current={item.isActive ? 'page' : undefined}
    >
      {content}
    </PreloadLink>
  );
};

export const MobileBottomNav: FC<MobileBottomNavProps> = ({ items, className }) => {
  return (
    <motion.nav
      layout
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background/95 backdrop-blur-lg border-t border-border/50",
        "flex items-center justify-around",
        "px-1 pb-[env(safe-area-inset-bottom,0px)]",
        "h-[calc(68px+env(safe-area-inset-bottom,0px))]",
        "shadow-[0_-4px_20px_hsl(var(--foreground)/0.05)]",
        className
      )}
      aria-label="Navegação principal mobile"
    >
      {items.map((item, index) => (
        <NavButton key={item.href} item={item} index={index} />
      ))}
    </motion.nav>
  );
};
