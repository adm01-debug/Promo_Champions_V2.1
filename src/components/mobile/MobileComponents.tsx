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
      "flex items-center justify-around h-16 px-2",
      className
    )}>
      {items.map((item, index) => {
        if (item.onClick) {
          return (
            <button
              key={index}
              onClick={item.onClick}
              type="button"
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-1",
                "text-xs transition-colors",
                item.isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              <span className="mt-1 truncate">{item.label}</span>
            </button>
          );
        }
        
        return (
          <Link
            key={index}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-2 px-1",
              "text-xs transition-colors",
              item.isActive 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon}
            <span className="mt-1 truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
