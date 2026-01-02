import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const [width, setWidth] = useState(0);
  const percentage = (value / max) * 100;

  useEffect(() => {
    setTimeout(() => setWidth(percentage), 100);
  }, [percentage]);

  return (
    <div className={cn('w-full bg-secondary rounded-full h-2', className)}>
      <div
        className="bg-primary h-full rounded-full transition-all duration-500"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
