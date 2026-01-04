import { useEffect, useState } from 'react';

export function AnimatedCounter({
  value,
  duration = 1000,
  format = (n: number) => n.toString(),
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    const increment = (end - start) / (duration / 16);

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{format(count)}</span>;
}
