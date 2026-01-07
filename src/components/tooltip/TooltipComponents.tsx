import { FC, ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleTooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
}

export const SimpleTooltip: FC<SimpleTooltipProps> = ({
  content,
  children,
  side = 'top',
  delayDuration = 200
}) => (
  <TooltipProvider delayDuration={delayDuration}>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side}>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export const InfoTooltip: FC<InfoTooltipProps> = ({ content, className }) => (
  <SimpleTooltip content={content}>
    <Info className={cn("h-4 w-4 text-muted-foreground cursor-help", className)} />
  </SimpleTooltip>
);

export const HelpTooltip: FC<InfoTooltipProps> = ({ content, className }) => (
  <SimpleTooltip content={content}>
    <HelpCircle className={cn("h-4 w-4 text-muted-foreground cursor-help", className)} />
  </SimpleTooltip>
);

export const WarningTooltip: FC<InfoTooltipProps> = ({ content, className }) => (
  <SimpleTooltip content={content}>
    <AlertCircle className={cn("h-4 w-4 text-yellow-500 cursor-help", className)} />
  </SimpleTooltip>
);

interface RichTooltipProps {
  title: string;
  description?: string;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const RichTooltip: FC<RichTooltipProps> = ({
  title,
  description,
  children,
  side = 'top'
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
  required?: boolean;
  className?: string;
}

export const LabelWithTooltip: FC<LabelWithTooltipProps> = ({
  label,
  tooltip,
  required,
  className
}) => (
  <div className={cn("flex items-center gap-1", className)}>
    <span className="text-sm font-medium">
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </span>
    <InfoTooltip content={tooltip} />
  </div>
);
