import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FollowUpEmptyStateProps {
  isFiltered: boolean;
}

export function FollowUpEmptyState({ isFiltered }: FollowUpEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-success" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold mb-1">
            {isFiltered ? 'Nenhum lead nesta categoria' : 'Tudo em dia! 🎉'}
          </h3>
          <p className="text-muted-foreground text-sm">
            {isFiltered
              ? 'Tente selecionar outra categoria de temperatura.'
              : 'Nenhum lead esfriando no momento. Continue com o bom trabalho!'}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
