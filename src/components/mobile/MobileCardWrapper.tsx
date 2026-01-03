import { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface MobileCardWrapperProps {
  children: ReactNode;
  className?: string;
  /** Adjust padding for mobile */
  reducePadding?: boolean;
  /** Full width on mobile (no horizontal margin) */
  fullWidth?: boolean;
}

/**
 * Wrapper component that adjusts card layouts for mobile devices
 * Provides consistent spacing and proportions across the app
 */
export const MobileCardWrapper: FC<MobileCardWrapperProps> = ({
  children,
  className,
  reducePadding = true,
  fullWidth = false
}) => {
  const isMobile = useIsMobile();

  return (
    <div 
      className={cn(
        "transition-all duration-200",
        isMobile && reducePadding && "[&_.card]:p-3 [&_.card]:sm:p-4",
        isMobile && fullWidth && "-mx-4 sm:-mx-6",
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileGridProps {
  children: ReactNode;
  className?: string;
  /** Number of columns on mobile (1-2) */
  mobileColumns?: 1 | 2;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive grid component optimized for mobile
 */
export const MobileGrid: FC<MobileGridProps> = ({
  children,
  className,
  mobileColumns = 1,
  gap = 'md'
}) => {
  const gapClass = {
    sm: 'gap-2',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6'
  }[gap];

  const mobileColClass = mobileColumns === 2 
    ? 'grid-cols-2' 
    : 'grid-cols-1';

  return (
    <div 
      className={cn(
        "grid",
        mobileColClass,
        "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        gapClass,
        className
      )}
    >
      {children}
    </div>
  );
};

interface MobileStackProps {
  children: ReactNode;
  className?: string;
  /** Gap between items */
  gap?: 'xs' | 'sm' | 'md' | 'lg';
}

/**
 * Vertical stack layout for mobile, good for lists
 */
export const MobileStack: FC<MobileStackProps> = ({
  children,
  className,
  gap = 'md'
}) => {
  const gapClass = {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-3',
    lg: 'space-y-4'
  }[gap];

  return (
    <div className={cn(gapClass, className)}>
      {children}
    </div>
  );
};

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  /** Reduce side padding on mobile */
  compact?: boolean;
}

/**
 * Container with mobile-optimized padding
 */
export const MobileContainer: FC<MobileContainerProps> = ({
  children,
  className,
  compact = false
}) => {
  return (
    <div 
      className={cn(
        compact ? "px-3 sm:px-4 lg:px-6" : "px-4 sm:px-6 lg:px-8",
        "py-4 sm:py-6",
        className
      )}
    >
      {children}
    </div>
  );
};
