import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusVariants = {
  success: 'bg-green-100 text-green-800 hover:bg-green-100',
  error: 'bg-red-100 text-red-800 hover:bg-red-100',
  warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  info: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  default: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
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
