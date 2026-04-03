import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface NavItem {
  icon: ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

interface MobileBottomNavProps {
  items: NavItem[];
  className?: string;
}

const NavButton: FC<{ item: NavItem; index: number }> = ({ item, index }) => {
  const content = (
    <>
      <motion.div
        animate={item.isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {item.icon}
      </motion.div>
      <span className={cn(
        "mt-1 truncate text-[10px] font-medium transition-colors",
        item.isActive && "text-primary"
      )}>
        {item.label}
      </span>
      {item.isActive && (
        <motion.div
          layoutId="mobile-nav-indicator"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        />
      )}
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
        key={index}
        onClick={item.onClick}
        type="button"
        className={baseClasses}
        aria-label={item.label}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      key={index}
      to={item.href}
      className={baseClasses}
      aria-label={item.label}
      aria-current={item.isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
};

export const MobileBottomNav: FC<MobileBottomNavProps> = ({ items, className }) => {
  return (
    <nav
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
        <NavButton key={index} item={item} index={index} />
      ))}
    </nav>
  );
};
