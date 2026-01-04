import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateSize?: number;
  overscan?: number;
  height?: string | number;
}

/**
 * Virtual scrolling list for large datasets
 * Renders only visible items for optimal performance
 */
export const VirtualList = <T,>({
  items,
  renderItem,
  estimateSize = 70,
  overscan = 5,
  height = '600px',
}: VirtualListProps<T>) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Virtual table for large datasets
 */
export const VirtualTable = <T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 50,
}: {
  data: T[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
  }>;
  rowHeight?: number;
}) => {
  return (
    <div className="border rounded">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((col) => (
          <div key={col.key} className="p-3 font-semibold border-b bg-gray-50">
            {col.label}
          </div>
        ))}
      </div>
      <VirtualList
        items={data}
        estimateSize={rowHeight}
        height={600}
        renderItem={(row) => (
          <div
            className="grid hover:bg-gray-50"
            style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
          >
            {columns.map((col) => (
              <div key={col.key} className="p-3 border-b">
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </div>
            ))}
          </div>
        )}
      />
    </div>
  );
};
