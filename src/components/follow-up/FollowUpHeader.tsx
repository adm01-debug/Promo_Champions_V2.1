import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Zap, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface FollowUpHeaderProps {
  selectedCount: number;
  onBulkCreate: () => void;
  isBulkCreating: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  minDaysInactive: number;
  onMinDaysChange: (days: number) => void;
}

export function FollowUpHeader({ 
  selectedCount, 
  onBulkCreate, 
  isBulkCreating, 
  searchQuery, 
  onSearchChange,
  minDaysInactive,
  onMinDaysChange
}: FollowUpHeaderProps) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl gradient-primary">
            <RefreshCw className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Follow-up Inteligente</h1>
            <p className="text-muted-foreground">
              Detecção automática de leads esfriando + ações sugeridas
            </p>
          </div>
        </div>

        {selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button onClick={onBulkCreate} disabled={isBulkCreating} className="gap-2">
              {isBulkCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Criar {selectedCount} tarefas
            </Button>
          </motion.div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome do cliente ou produto..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </motion.div>
  );
}
