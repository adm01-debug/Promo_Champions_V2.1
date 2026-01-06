import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, Save, Trash2, Star, ChevronDown } from 'lucide-react';
import { useSavedFilters, SavedFilter } from '@/hooks/useSavedFilters';
import { toast } from 'sonner';

interface SavedFiltersDropdownProps<T> {
  tableName: string;
  currentFilters: T;
  onApplyFilter: (filters: T) => void;
}

export function SavedFiltersDropdown<T extends Record<string, unknown>>({ tableName, currentFilters, onApplyFilter }: SavedFiltersDropdownProps<T>) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const { filters, isLoading, saveFilter, deleteFilter, setDefaultFilter } = useSavedFilters<T>(tableName);

  const handleSave = async () => {
    if (!filterName.trim()) { toast.error('Digite um nome para o filtro'); return; }
    try {
      await saveFilter({ name: filterName, filters: currentFilters });
      setFilterName('');
      setSaveDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar filtro');
    }
  };

  const handleApply = (filter: SavedFilter<T>) => {
    onApplyFilter(filter.filters);
    toast.success(`Filtro "${filter.name}" aplicado`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteFilter(id);
  };

  const handleSetDefault = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await setDefaultFilter(id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros Salvos
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {isLoading ? (
            <DropdownMenuItem disabled>Carregando...</DropdownMenuItem>
          ) : filters.length === 0 ? (
            <DropdownMenuItem disabled>Nenhum filtro salvo</DropdownMenuItem>
          ) : (
            filters.map((filter) => (
              <DropdownMenuItem key={filter.id} onClick={() => handleApply(filter)} className="flex justify-between group">
                <span className="flex items-center gap-2">
                  {filter.is_default && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                  {filter.name}
                </span>
                <span className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button onClick={(e) => handleSetDefault(e, filter.id)} className="p-1 hover:bg-accent rounded" title="Definir como padrão">
                    <Star className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => handleDelete(e, filter.id)} className="p-1 hover:bg-destructive/20 rounded" title="Excluir">
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </span>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
            <Save className="h-4 w-4 mr-2" />
            Salvar filtro atual
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Filtro</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="filter-name">Nome do filtro</Label>
            <Input id="filter-name" value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="Ex: Meus favoritos" className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SavedFiltersDropdown;
