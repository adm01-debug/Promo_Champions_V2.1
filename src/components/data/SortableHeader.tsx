import { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort: string | null;
  currentDirection: SortDirection;
  onSort: (field: string, direction: SortDirection) => void;
  className?: string;
}

export const SortableHeader: FC<SortableHeaderProps> = ({
  label,
  field,
  currentSort,
  currentDirection,
  onSort,
  className
}) => {
  const isActive = currentSort === field;

  const handleSort = () => {
    if (!isActive) {
      onSort(field, 'asc');
    } else if (currentDirection === 'asc') {
      onSort(field, 'desc');
    } else {
      onSort(field, null);
    }
  };

  const getIcon = () => {
    if (!isActive) return <ArrowUpDown className="w-4 h-4" />;
    if (currentDirection === 'asc') return <ArrowUp className="w-4 h-4" />;
    return <ArrowDown className="w-4 h-4" />;
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSort}
      className={cn(
        'h-8 px-2 -ml-2 font-medium hover:bg-muted/50',
        isActive && 'text-primary',
        className
      )}
    >
      {label}
      <motion.span
        initial={false}
        animate={{ 
          rotate: isActive && currentDirection === 'desc' ? 180 : 0,
          scale: isActive ? 1.1 : 1
        }}
        className="ml-2"
      >
        {getIcon()}
      </motion.span>
    </Button>
  );
};
