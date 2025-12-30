import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HorizontalScrollProps {
  children: React.ReactNode[];
  itemWidth?: number;
  gap?: number;
  showArrows?: boolean;
  showDots?: boolean;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  className?: string;
}

export const HorizontalScroll: FC<HorizontalScrollProps> = ({
  children,
  itemWidth = 300,
  gap = 16,
  showArrows = true,
  showDots = false,
  autoScroll = false,
  autoScrollInterval = 5000,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateScrollState = () => {
    const container = containerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );

    // Calculate current index
    const index = Math.round(container.scrollLeft / (itemWidth + gap));
    setCurrentIndex(index);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateScrollState();
    container.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);

    return () => {
      container.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [itemWidth, gap]);

  // Auto scroll
  useEffect(() => {
    if (!autoScroll) return;

    const interval = setInterval(() => {
      if (canScrollRight) {
        scroll('right');
      } else {
        containerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, autoScrollInterval);

    return () => clearInterval(interval);
  }, [autoScroll, autoScrollInterval, canScrollRight]);

  const scroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = itemWidth + gap;
    const newScrollLeft = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  const scrollToIndex = (index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const scrollLeft = index * (itemWidth + gap);
    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ gap: `${gap}px`, scrollPaddingLeft: '1rem' }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="flex-shrink-0 snap-start"
            style={{ width: itemWidth }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {showArrows && (
        <>
          <AnimatePresence>
            {canScrollLeft && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
                  onClick={() => scroll('left')}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {canScrollRight && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
                  onClick={() => scroll('right')}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Dots indicator */}
      {showDots && children.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                currentIndex === index
                  ? 'bg-primary w-6'
                  : 'bg-muted hover:bg-muted-foreground/30'
              )}
              aria-label={`Ir para item ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Gradient overlays */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none transition-opacity',
          canScrollLeft ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none transition-opacity',
          canScrollRight ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};
