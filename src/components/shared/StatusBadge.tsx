import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusVariants = {
  success: 'bg-success/20 text-success hover:bg-success/20',
  error: 'bg-destructive/20 text-destructive hover:bg-destructive/20',
  warning: 'bg-warning/20 text-warning hover:bg-warning/20',
  info: 'bg-info/20 text-info hover:bg-info/20',
  default: 'bg-muted text-muted-foreground hover:bg-muted',
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: keyof typeof statusVariants;
  label: string;
  className?: string;
}) {
  return (
    <Badge className={cn(statusVariants[status], className)}>
      {label}
    </Badge>
  );
}
