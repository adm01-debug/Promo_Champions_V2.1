import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface LeadsToolbarProps {
  onSearch?: (term: string) => void;
  onFiltersChange?: (filters: unknown[]) => void;
  onRefresh: () => void;
  onNewClick: () => void;
  selectedCount?: number;
  onClearSelection?: () => void;
  onBulkQualificar?: () => void;
  onBulkConverter?: () => void;
  currentFilters?: Record<string, unknown>;
  data?: unknown[];
}

export const LeadsToolbar = memo(function LeadsToolbar({ 
  onRefresh, 
  onNewClick, 
}: LeadsToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search and filters placeholder */}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={onNewClick}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default LeadsToolbar;
