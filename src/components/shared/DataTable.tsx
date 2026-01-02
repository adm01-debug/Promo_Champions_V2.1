import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onSort,
  selectable = false,
  onSelectionChange,
}: {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string) => void;
  selectable?: boolean;
  onSelectionChange?: (selected: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    const newSelected = selected.includes(id)
      ? selected.filter(s => s !== id)
      : [...selected, id];
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const toggleAll = () => {
    const newSelected = selected.length === data.length ? [] : data.map(d => d.id);
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {selectable && (
            <TableHead className="w-12">
              <Checkbox checked={selected.length === data.length} onCheckedChange={toggleAll} />
            </TableHead>
          )}
          {columns.map(col => (
            <TableHead key={col.key}>
              {col.sortable && onSort ? (
                <Button variant="ghost" size="sm" onClick={() => onSort(col.key)}>
                  {col.header}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                col.header
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.id}>
            {selectable && (
              <TableCell>
                <Checkbox 
                  checked={selected.includes(row.id)} 
                  onCheckedChange={() => toggleRow(row.id)} 
                />
              </TableCell>
            )}
            {columns.map(col => (
              <TableCell key={col.key}>
                {col.render ? col.render(row) : (row as any)[col.key]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
