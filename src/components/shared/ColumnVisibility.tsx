import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Columns } from 'lucide-react';

export function ColumnVisibility({
  columns,
  visibleColumns,
  onToggle,
}: {
  columns: { key: string; label: string }[];
  visibleColumns: string[];
  onToggle: (key: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns className="h-4 w-4 mr-2" />
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map(col => (
          <DropdownMenuCheckboxItem
            key={col.key}
            checked={visibleColumns.includes(col.key)}
            onCheckedChange={() => onToggle(col.key)}
          >
            {col.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
