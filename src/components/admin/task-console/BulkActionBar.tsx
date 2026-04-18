import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, MinusCircle } from 'lucide-react';

interface Props {
  count: number;
  onApprove: () => void;
  onReject: () => void;
  onClear: () => void;
  loading?: boolean;
}

export function BulkActionBar({ count, onApprove, onReject, onClear, loading }: Props) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 bg-background border border-border shadow-lg rounded-full px-4 py-2">
            <span className="text-sm font-medium px-2">{count} selecionado{count > 1 ? 's' : ''}</span>
            <div className="h-5 w-px bg-border" />
            <Button size="sm" onClick={onApprove} disabled={loading}>
              <Check className="mr-1 h-4 w-4" />Aprovar todas
            </Button>
            <Button size="sm" variant="outline" onClick={onReject} disabled={loading}>
              <X className="mr-1 h-4 w-4" />Rejeitar
            </Button>
            <Button size="icon" variant="ghost" onClick={onClear}>
              <MinusCircle className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
