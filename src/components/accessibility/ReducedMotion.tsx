import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface ReducedMotionContextValue {
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (value: boolean) => void;
}

const ReducedMotionContext = createContext<ReducedMotionContextValue>({
  prefersReducedMotion: false,
  setPrefersReducedMotion: () => {}
});

export const useReducedMotion = () => useContext(ReducedMotionContext);

interface ReducedMotionProviderProps {
  children: ReactNode;
}

export const ReducedMotionProvider: FC<ReducedMotionProviderProps> = ({ children }) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <ReducedMotionContext.Provider value={{ prefersReducedMotion, setPrefersReducedMotion }}>
      {children}
    </ReducedMotionContext.Provider>
  );
};

// Utility component that renders different content based on motion preference
export const MotionSafe: FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { prefersReducedMotion } = useReducedMotion();
  
  if (prefersReducedMotion) {
    return <>{fallback || children}</>;
  }
  
  return <>{children}</>;
};

// Hook for getting animation variants based on motion preference
export const useMotionVariants = <T extends Record<string, unknown>>(
  normalVariants: T,
  reducedVariants?: Partial<T>
): T => {
  const { prefersReducedMotion } = useReducedMotion();
  
  if (prefersReducedMotion && reducedVariants) {
    return { ...normalVariants, ...reducedVariants };
  }
  
  return normalVariants;
};
