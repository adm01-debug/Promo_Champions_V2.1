// @ts-nocheck
import { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

export const MobileBottomNav: FC<MobileBottomNavProps> = ({ items, className }) => {
  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border",
      "flex items-center justify-around h-16 px-1",
      className
    )}>
      {items.map((item, index) => {
        const Component = item.onClick ? 'button' : Link;
        const props = item.onClick 
          ? { onClick: item.onClick, type: 'button' as const }
          : { to: item.href };
        
        return (
          <Component
            key={index}
            {...props}
            className={cn(
              "flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1.5 px-2",
              "text-xs transition-colors touch-manipulation",
              item.isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground active:text-foreground"
            )}
          >
            {item.icon}
            <span className="mt-0.5 text-[10px] font-medium leading-tight">{item.label}</span>
          </Component>
        );
      })}
    </nav>
  );
};
