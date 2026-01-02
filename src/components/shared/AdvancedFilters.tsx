import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface Filter {
  field: string;
  operator: string;
  value: string;
}

export function AdvancedFilters({ 
  fields, 
  onApply 
}: { 
  fields: { value: string; label: string }[];
  onApply: (filters: Filter[]) => void;
}) {
  const [filters, setFilters] = useState<Filter[]>([{ field: '', operator: 'contains', value: '' }]);

  const addFilter = () => setFilters([...filters, { field: '', operator: 'contains', value: '' }]);
  const removeFilter = (idx: number) => setFilters(filters.filter((_, i) => i !== idx));
  const updateFilter = (idx: number, key: keyof Filter, val: string) => {
    const updated = [...filters];
    updated[idx][key] = val;
    setFilters(updated);
  };

  return (
    <div className="space-y-2">
      {filters.map((f, i) => (
        <div key={i} className="flex gap-2">
          <Select value={f.field} onValueChange={(v) => updateFilter(i, 'field', v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Campo" />
            </SelectTrigger>
            <SelectContent>
              {fields.map(field => (
                <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={f.operator} onValueChange={(v) => updateFilter(i, 'operator', v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contains">Contém</SelectItem>
              <SelectItem value="equals">Igual</SelectItem>
              <SelectItem value="gt">Maior que</SelectItem>
              <SelectItem value="lt">Menor que</SelectItem>
            </SelectContent>
          </Select>

          <Input 
            placeholder="Valor" 
            value={f.value}
            onChange={(e) => updateFilter(i, 'value', e.target.value)}
            className="flex-1"
          />

          <Button variant="ghost" size="icon" onClick={() => removeFilter(i)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={addFilter}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Filtro
        </Button>
        <Button size="sm" onClick={() => onApply(filters)}>
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
}
