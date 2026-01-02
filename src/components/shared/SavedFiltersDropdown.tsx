import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Filter, Star, Trash2 } from 'lucide-react';
import { useSavedFilters } from '@/hooks/useSavedFilters';

export function SavedFiltersDropdown({ entityType, onApply }: { entityType: string; onApply: (f: any) => void }) {
  const { filters, del } = useSavedFilters(entityType);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros ({filters.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {filters.map(f => (
          <DropdownMenuItem key={f.id} className="flex justify-between">
            <span onClick={() => onApply(f.filters)} className="flex-1 cursor-pointer">{f.name}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); del(f.id); }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
