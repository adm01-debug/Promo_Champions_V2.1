import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { Save, Star, Trash2, BookmarkPlus, Filter } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface SavedFiltersBarProps {
  entityType: string;
  currentFilters: Record<string, unknown>;
  onApplyFilter: (filters: Record<string, unknown>) => void;
}

export function SavedFiltersBar({ entityType, currentFilters, onApplyFilter }: SavedFiltersBarProps) {
  const { filters, saveFilter, deleteFilter } = useSavedFilters(entityType);
  const [newName, setNewName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    if (!newName.trim()) return;
    saveFilter.mutate(
      { name: newName.trim(), filterValues: currentFilters, isDefault },
      {
        onSuccess: () => {
          setNewName('');
          setIsDefault(false);
          setOpen(false);
        },
      }
    );
  };

  const hasActiveFilters = Object.values(currentFilters).some(v => v !== '' && v !== null && v !== undefined);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Saved filter chips */}
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant={filter.is_default ? 'default' : 'outline'}
          className="cursor-pointer gap-1 py-1.5 px-3 hover:bg-primary/10 transition-colors"
          onClick={() => onApplyFilter(filter.filters)}
        >
          {filter.is_default && <Star className="h-3 w-3 fill-current" />}
          <Filter className="h-3 w-3" />
          {filter.name}
          <button
            className="ml-1 hover:text-destructive transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              deleteFilter.mutate(filter.id);
            }}
            aria-label={`Excluir filtro ${filter.name}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Save current filter */}
      {hasActiveFilters && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-7">
              <BookmarkPlus className="h-3.5 w-3.5" />
              Salvar filtro
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Salvar filtro atual</h4>
              <Input
                placeholder="Nome do filtro..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="h-8"
              />
              <div className="flex items-center gap-2">
                <Switch
                  id="default-filter"
                  checked={isDefault}
                  onCheckedChange={setIsDefault}
                />
                <Label htmlFor="default-filter" className="text-xs">
                  Filtro padrão
                </Label>
              </div>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!newName.trim() || saveFilter.isPending}
                className="w-full gap-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                Salvar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
