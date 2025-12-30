import { FC, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-8"
    >
      <div className="rounded-full bg-primary/10 p-6 mb-6">
        <Icon className="h-12 w-12 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          {actionLabel}
        </Button>
      )}
      {children}
    </motion.div>
  );
};
