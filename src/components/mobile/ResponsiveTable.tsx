import { FC, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  className?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  mobileCardRender?: (item: T) => ReactNode;
  className?: string;
}

export function ResponsiveTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = "Nenhum item encontrado",
  mobileCardRender,
  className
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Mobile: Card layout
  if (isMobile) {
    if (mobileCardRender) {
      return (
        <div className={cn("space-y-3", className)}>
          {data.map((item) => (
            <div
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "glass rounded-xl p-4",
                onRowClick && "cursor-pointer active:scale-98 transition-transform"
              )}
            >
              {mobileCardRender(item)}
            </div>
          ))}
        </div>
      );
    }

    // Default mobile card
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            onClick={() => onRowClick?.(item)}
            className={cn(
              "glass rounded-xl p-4 space-y-2",
              onRowClick && "cursor-pointer active:scale-98 transition-transform"
            )}
          >
            {columns
              .filter((col) => !col.hideOnMobile)
              .map((col) => (
                <div key={String(col.key)} className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{col.header}</span>
                  <span className="text-sm font-medium">
                    {col.render 
                      ? col.render(item) 
                      : String(item[col.key as keyof T] ?? '-')
                    }
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: Table layout
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border/50">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={cn(
                  "text-left p-4 text-sm font-medium text-muted-foreground",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "border-b border-border/30 transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/30"
              )}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className={cn("p-4 text-sm", col.className)}
                >
                  {col.render 
                    ? col.render(item) 
                    : String(item[col.key as keyof T] ?? '-')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
