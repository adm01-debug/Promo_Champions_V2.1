import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  className?: string;
  position?: 'top' | 'bottom';
  color?: 'primary' | 'gradient';
  height?: number;
  showPercentage?: boolean;
}

export function ScrollProgress({
  className,
  position = 'top',
  color = 'primary',
  height = 3,
  showPercentage = false,
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (latest) => {
      setPercentage(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  const colorStyles = {
    primary: 'bg-primary',
    gradient: 'bg-gradient-to-r from-primary via-primary/80 to-primary',
  };

  return (
    <>
      <motion.div
        className={cn(
          'fixed left-0 right-0 z-50 origin-left',
          position === 'top' ? 'top-0' : 'bottom-0',
          colorStyles[color],
          className
        )}
        style={{
          scaleX,
          height,
        }}
      />
      {showPercentage && (
        <motion.div
          className={cn(
            'fixed right-4 z-50 px-2 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium border shadow-sm',
            position === 'top' ? 'top-4' : 'bottom-4'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: percentage > 5 ? 1 : 0 }}
        >
          {percentage}%
        </motion.div>
      )}
    </>
  );
}

interface SectionScrollProps {
  sections: { id: string; label: string }[];
  className?: string;
}

export function SectionScroll({ sections, className }: SectionScrollProps) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={cn('fixed right-4 top-1/2 -translate-y-1/2 z-40', className)}>
      <div className="flex flex-col gap-2">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="group relative flex items-center"
          >
            <span
              className={cn(
                'absolute right-6 px-2 py-1 rounded bg-background border text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity',
                activeSection === id && 'font-medium'
              )}
            >
              {label}
            </span>
            <motion.span
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                activeSection === id
                  ? 'bg-primary'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              animate={{
                scale: activeSection === id ? 1.2 : 1,
              }}
            />
          </button>
        ))}
      </div>
    </nav>
  );
}
