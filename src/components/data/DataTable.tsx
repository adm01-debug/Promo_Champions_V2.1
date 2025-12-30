import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { SortableHeader } from './SortableHeader';
import { Pagination } from './Pagination';
import { TableSkeleton } from '@/components/skeletons/ComponentSkeletons';
import { cn } from '@/lib/utils';

type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  id: string;
  header: string | ReactNode;
  accessorKey?: keyof T;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  sortField?: string | null;
  sortDirection?: SortDirection;
  onSort?: (field: string, direction: SortDirection) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  emptyState?: ReactNode;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading,
  selectable,
  selectedRows = [],
  onSelectionChange,
  getRowId,
  onRowClick,
  sortField,
  sortDirection,
  onSort,
  pagination,
  emptyState,
  className
}: DataTableProps<T>) {
  const selectedIds = new Set(selectedRows.map(getRowId));
  const allSelected = data.length > 0 && data.every(row => selectedIds.has(getRowId(row)));
  const someSelected = data.some(row => selectedIds.has(getRowId(row))) && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedRows, ...data.filter(row => !selectedIds.has(getRowId(row)))]);
    } else {
      onSelectionChange(selectedRows.filter(row => !data.some(d => getRowId(d) === getRowId(row))));
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedRows, row]);
    } else {
      onSelectionChange(selectedRows.filter(r => getRowId(r) !== getRowId(row)));
    }
  };

  if (loading) {
    return <TableSkeleton rows={5} columns={columns.length} />;
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={allSelected || (someSelected ? 'indeterminate' : false)}
                    onCheckedChange={handleSelectAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.id} className={column.className}>
                  {column.sortable && onSort ? (
                    <SortableHeader
                      label={column.header as string}
                      field={column.id}
                      currentSort={sortField || null}
                      currentDirection={sortDirection || null}
                      onSort={onSort}
                    />
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.has(rowId);

              return (
                <motion.tr
                  key={rowId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/50',
                    isSelected && 'bg-muted/30',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectRow(row, !!checked)}
                        aria-label={`Selecionar linha ${index + 1}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.className}>
                      {column.cell 
                        ? column.cell(row) 
                        : column.accessorKey 
                          ? String(row[column.accessorKey] ?? '')
                          : null
                      }
                    </TableCell>
                  ))}
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <Pagination {...pagination} />
      )}
    </div>
  );
}
