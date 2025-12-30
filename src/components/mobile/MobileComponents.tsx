import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  rightAction?: ReactNode;
  className?: string;
}

export const MobileHeader: FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showMenu = false,
  onMenuClick,
  rightAction,
  className
}) => {
  const navigate = useNavigate();

  return (
    <header className={cn(
      "sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-b border-border px-4 py-3",
      "safe-area-inset-top",
      className
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {showMenu && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 md:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0">
            <h1 className="font-semibold text-lg truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {rightAction && (
          <div className="shrink-0">{rightAction}</div>
        )}
      </div>
    </header>
  );
};

interface MobileBottomNavProps {
  items: {
    icon: ReactNode;
    label: string;
    href: string;
    isActive?: boolean;
    badge?: number;
    onClick?: () => void;
  }[];
  className?: string;
}

export const MobileBottomNav: FC<MobileBottomNavProps> = ({
  items,
  className
}) => {
  const navigate = useNavigate();

  const handleClick = (item: MobileBottomNavProps['items'][0]) => {
    if (item.onClick) {
      item.onClick();
    } else {
      navigate(item.href);
    }
  };

  return (
    <nav 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "border-t border-border",
        "safe-area-inset-bottom",
        className
      )}
      role="navigation"
      aria-label="Navegação principal mobile"
    >
      <div className="flex items-center justify-around h-[72px] px-1">
        {items.map((item, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(item)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg",
              "min-w-[56px] min-h-[56px] w-[56px] h-[56px]",
              "transition-colors touch-manipulation",
              item.isActive 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-current={item.isActive ? 'page' : undefined}
            aria-label={item.label}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-medium leading-none",
              item.isActive && "font-semibold"
            )}>
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

interface MobileActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const MobileActionSheet: FC<MobileActionSheetProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60"
      />
      
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-background rounded-t-2xl",
          "max-h-[85vh] overflow-auto",
          "safe-area-inset-bottom"
        )}
      >
        {/* Handle */}
        <div className="sticky top-0 bg-background pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted mx-auto" />
        </div>
        
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b">
            <h2 className="font-semibold text-lg">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}
        
        <div className="p-4">
          {children}
        </div>
      </motion.div>
    </>
  );
};

interface TouchableCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const TouchableCard: FC<TouchableCardProps> = ({
  children,
  onClick,
  className,
  disabled = false
}) => {
  return (
    <motion.div
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "bg-card rounded-lg border border-border p-4",
        "transition-colors duration-200",
        onClick && !disabled && "cursor-pointer active:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface SwipeActionProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  threshold?: number;
}

export const SwipeAction: FC<SwipeActionProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100
}) => {
  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x < -threshold && onSwipeLeft) {
          onSwipeLeft();
        } else if (info.offset.x > threshold && onSwipeRight) {
          onSwipeRight();
        }
      }}
      className="relative"
    >
      {/* Left action (revealed on swipe right) */}
      {leftAction && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-green-500 text-white rounded-l-lg">
          {leftAction}
        </div>
      )}
      
      {/* Right action (revealed on swipe left) */}
      {rightAction && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-red-500 text-white rounded-r-lg">
          {rightAction}
        </div>
      )}
      
      <div className="relative bg-background">
        {children}
      </div>
    </motion.div>
  );
};

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export const PullToRefresh: FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className
}) => {
  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.5, bottom: 0 }}
      onDragEnd={async (_, info) => {
        if (info.offset.y > 80) {
          await onRefresh();
        }
      }}
      className={cn("touch-pan-y", className)}
    >
      {children}
    </motion.div>
  );
};
