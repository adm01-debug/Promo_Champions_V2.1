import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const rippleButtonVariants = cva(
  'relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface RippleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rippleButtonVariants> {
  asChild?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ className, variant, size, asChild = false, onClick, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([]);
    const nextId = React.useRef(0);

    const createRipple = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = nextId.current++;
      setRipples(prev => [...prev, { id, x, y, size }]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== id));
      }, 600);
    }, []);

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Trigger haptic feedback if available
        try {
          if (navigator?.vibrate) {
            navigator.vibrate(10);
          }
        } catch {
          // Silently ignore
        }
        createRipple(e);
        onClick?.(e);
      },
      [onClick, createRipple]
    );

    if (asChild) {
      return (
        <span
          onClick={handleClick as any}
          className={cn(rippleButtonVariants({ variant, size }), 'relative overflow-hidden', className)}
          ref={ref as any}
          {...(props as any)}
        >
          {ripples.map(r => (
            <span
              key={r.id}
              className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
              style={{
                left: r.x,
                top: r.y,
                width: r.size,
                height: r.size,
              }}
            />
          ))}
          <Slot>{children}</Slot>
        </span>
      );
    }

    return (
      <button
        className={cn(rippleButtonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {ripples.map(r => (
          <span
            key={r.id}
            className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
            style={{
              left: r.x,
              top: r.y,
              width: r.size,
              height: r.size,
            }}
          />
        ))}
        {children}
      </button>
    );
  }
);
RippleButton.displayName = 'RippleButton';

export { RippleButton, rippleButtonVariants };
