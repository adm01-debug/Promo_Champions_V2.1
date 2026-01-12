import { FC, ReactNode } from 'react';
import {
  Tooltip as ShadcnTooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
  contentClassName?: string;
}

export const Tooltip: FC<TooltipProps> = ({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className,
  contentClassName,
}) => {
  return (
    <ShadcnTooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild className={className}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} align={align} className={contentClassName}>
        {content}
      </TooltipContent>
    </ShadcnTooltip>
  );
};

// Enhanced tooltip with keyboard shortcut display
interface KeyboardTooltipProps extends TooltipProps {
  shortcut?: string;
}

export const KeyboardTooltip: FC<KeyboardTooltipProps> = ({
  children,
  content,
  shortcut,
  ...props
}) => {
  return (
    <Tooltip
      {...props}
      content={
        <div className="flex items-center gap-2">
          <span>{content}</span>
          {shortcut && (
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border font-mono">
              {shortcut}
            </kbd>
          )}
        </div>
      }
    >
      {children}
    </Tooltip>
  );
};

// Rich tooltip with title and description
interface RichTooltipProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  maxWidth?: number;
}

export const RichTooltip: FC<RichTooltipProps> = ({
  children,
  title,
  description,
  icon,
  side = 'top',
  maxWidth = 250,
}) => {
  return (
    <ShadcnTooltip delayDuration={300}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent 
        side={side} 
        className="p-0"
        style={{ maxWidth }}
      >
        <div className="p-3">
          <div className="flex items-start gap-2">
            {icon && (
              <div className="shrink-0 mt-0.5">
                {icon}
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </TooltipContent>
    </ShadcnTooltip>
  );
};
