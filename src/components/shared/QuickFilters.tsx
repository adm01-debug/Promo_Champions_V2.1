import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export function QuickFilters({
  filters,
  onRemove,
  onClear,
}: {
  filters: { key: string; label: string; value: string }[];
  onRemove: (key: string) => void;
  onClear: () => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-sm text-muted-foreground">Filtros ativos:</span>
      {filters.map(f => (
        <Badge key={f.key} variant="secondary" className="gap-1">
          {f.label}: {f.value}
          <X 
            className="h-3 w-3 cursor-pointer" 
            onClick={() => onRemove(f.key)}
          />
        </Badge>
      ))}
      <button 
        className="text-xs text-muted-foreground hover:text-foreground"
        onClick={onClear}
      >
        Limpar todos
      </button>
    </div>
  );
}
