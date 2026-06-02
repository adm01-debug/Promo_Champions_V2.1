import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        glow: 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:bg-primary/90 hover:shadow-[0_0_30px_hsl(var(--primary)/0.7)]',
        'glow-pulse': 'bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:bg-primary/90 animate-pulse',
        'glow-pulse-success': 'bg-emerald-500 text-white shadow-[0_0_20px_hsl(142_76%_45%/0.5)] hover:bg-emerald-500/90 animate-pulse',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Trigger haptic feedback if available
        try {
          if (navigator?.vibrate) {
            navigator.vibrate(10);
          }
        } catch {
          // Silently ignore — haptic is non-critical
        }
        onClick?.(e);
      },
      [onClick]
    );

    // When asChild, Slot passes onClick to the child automatically.
    // However, the child receives the original onClick from props, not handleClick.
    // We need to merge: render a wrapper that intercepts the click.
    if (asChild) {
      return (
        <span
          onClick={handleClick as any}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref as any}
          {...(props as any)}
        >
          <Slot>{props.children}</Slot>
        </span>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
