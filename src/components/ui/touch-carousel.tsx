import { FC, ReactNode, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  id: string;
  content: ReactNode;
}

interface TouchCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showArrows?: boolean;
  loop?: boolean;
  className?: string;
  itemClassName?: string;
  onSlideChange?: (index: number) => void;
}

/**
 * TouchCarousel - Swipeable carousel with touch gestures
 */
export const TouchCarousel: FC<TouchCarouselProps> = ({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
  showArrows = true,
  loop = true,
  className,
  itemClassName,
  onSlideChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      const threshold = 100;
      const velocity = info.velocity.x;
      const offset = info.offset.x;

      if (offset < -threshold || velocity < -500) {
        // Swipe left - next
        goToSlide(loop ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1));
      } else if (offset > threshold || velocity > 500) {
        // Swipe right - previous
        goToSlide(loop ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0));
      }
    },
    [currentIndex, items.length, loop]
  );

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      onSlideChange?.(index);
    },
    [onSlideChange]
  );

  const goToPrevious = useCallback(() => {
    const newIndex = loop
      ? (currentIndex - 1 + items.length) % items.length
      : Math.max(currentIndex - 1, 0);
    goToSlide(newIndex);
  }, [currentIndex, items.length, loop, goToSlide]);

  const goToNext = useCallback(() => {
    const newIndex = loop
      ? (currentIndex + 1) % items.length
      : Math.min(currentIndex + 1, items.length - 1);
    goToSlide(newIndex);
  }, [currentIndex, items.length, loop, goToSlide]);

  // Auto play
  React.useEffect(() => {
    if (!autoPlay || isDragging) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, isDragging]);

  return (
    <div className={cn("relative overflow-hidden", className)} ref={containerRef}>
      {/* Slides container */}
      <motion.div
        className="flex touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={cn("w-full flex-shrink-0", itemClassName)}
          >
            {items[currentIndex]?.content}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Navigation arrows */}
      {showArrows && items.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            disabled={!loop && currentIndex === 0}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm",
              "flex items-center justify-center",
              "border border-border shadow-md",
              "transition-all hover:bg-background hover:scale-110",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            disabled={!loop && currentIndex === items.length - 1}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10",
              "w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm",
              "flex items-center justify-center",
              "border border-border shadow-md",
              "transition-all hover:bg-background hover:scale-110",
              "disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-6 bg-primary"
                  : "bg-foreground/30 hover:bg-foreground/50"
              )}
              aria-label={`Ir para slide ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Add React import for useEffect
import React from 'react';
