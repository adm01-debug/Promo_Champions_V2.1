import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

/**
 * VirtualizedList - Renders only visible items for performance with large lists
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
  onEndReached,
  endReachedThreshold = 0.8,
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastEndReachedCall = useRef(0);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    
    return {
      startIndex: start,
      endIndex: end,
      visibleItems: items.slice(start, end),
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setScrollTop(target.scrollTop);

    // Check if we should trigger onEndReached
    if (onEndReached) {
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;
      const now = Date.now();
      
      if (scrollPercentage >= endReachedThreshold && now - lastEndReachedCall.current > 1000) {
        lastEndReachedCall.current = now;
        onEndReached();
      }
    }
  }, [onEndReached, endReachedThreshold]);

  // Total height for scroll
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface VirtualizedGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  overscan?: number;
  className?: string;
}

/**
 * VirtualizedGrid - Grid version of virtualized list
 */
export function VirtualizedGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  gap = 16,
  overscan = 2,
  className,
}: VirtualizedGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  // Calculate columns and rows
  const columnsCount = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const rowsCount = Math.ceil(items.length / columnsCount);
  const totalHeight = rowsCount * (itemHeight + gap);

  // Calculate visible rows
  const { startRow, endRow } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const visibleRows = Math.ceil(containerHeight / (itemHeight + gap));
    const end = Math.min(rowsCount, start + visibleRows + overscan * 2);
    
    return { startRow: start, endRow: end };
  }, [scrollTop, itemHeight, gap, containerHeight, rowsCount, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const result: { item: T; index: number; row: number; col: number }[] = [];
    
    for (let row = startRow; row < endRow; row++) {
      for (let col = 0; col < columnsCount; col++) {
        const index = row * columnsCount + col;
        if (index < items.length) {
          result.push({ item: items[index], index, row, col });
        }
      }
    }
    
    return result;
  }, [items, startRow, endRow, columnsCount]);

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: row * (itemHeight + gap),
              left: col * (itemWidth + gap),
              width: itemWidth,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
