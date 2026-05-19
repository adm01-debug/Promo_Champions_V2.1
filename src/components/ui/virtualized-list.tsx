import React, { memo, useMemo } from 'react';
// @ts-ignore
import { FixedSizeList as List } from 'react-window/dist/react-window.js';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onItemClick?: (item: T) => void;
}

/**
 * Optimized Virtualized List for high-performance dashboard lists.
 */
export function VirtualizedList<T>({ 
  items, 
  height, 
  itemHeight, 
  renderItem, 
  className,
  onItemClick 
}: VirtualizedListProps<T>) {
  
  const Row = useMemo(() => memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    if (!item) return null;

    return (
      <div 
        style={style} 
        className="px-1" 
        onClick={() => onItemClick?.(item)}
      >
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.25, 
            delay: (index % 8) * 0.03, // Tighter stagger for faster feel
            ease: "easeOut" 
          }}
          className="will-change-transform"
        >
          {renderItem(item, index)}
        </motion.div>
      </div>
    );
  }), [items, renderItem, onItemClick]);

  if (!items || items.length === 0) return null;

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm", className)}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        width="100%"
        className="scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
      >
        {Row}
      </List>
    </div>
  );
}