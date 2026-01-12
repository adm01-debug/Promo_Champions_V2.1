import { createContext, useContext, FC, ReactNode, useEffect, useState } from 'react';

interface ReducedMotionContextValue {
  prefersReducedMotion: boolean;
  respectMotionPreference: boolean;
  setRespectMotionPreference: (value: boolean) => void;
}

const ReducedMotionContext = createContext<ReducedMotionContextValue>({
  prefersReducedMotion: false,
  respectMotionPreference: true,
  setRespectMotionPreference: () => {},
});

interface ReducedMotionProviderProps {
  children: ReactNode;
  forceReducedMotion?: boolean;
}

/**
 * ReducedMotionProvider - Detects and manages reduced motion preference
 * Wraps the app to provide motion preference context
 */
export const ReducedMotionProvider: FC<ReducedMotionProviderProps> = ({
  children,
  forceReducedMotion = false,
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [respectMotionPreference, setRespectMotionPreference] = useState(true);

  useEffect(() => {
    // Check for prefers-reduced-motion media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const value = {
    prefersReducedMotion: forceReducedMotion || (respectMotionPreference && prefersReducedMotion),
    respectMotionPreference,
    setRespectMotionPreference,
  };

  return (
    <ReducedMotionContext.Provider value={value}>
      {children}
    </ReducedMotionContext.Provider>
  );
};

/**
 * Hook to check reduced motion preference
 */
export const useReducedMotion = () => {
  const context = useContext(ReducedMotionContext);
  return context;
};

/**
 * Hook to get animation variants based on motion preference
 */
export const useMotionVariants = <T extends Record<string, unknown>>(
  fullMotion: T,
  reducedMotion: T
): T => {
  const { prefersReducedMotion } = useReducedMotion();
  return prefersReducedMotion ? reducedMotion : fullMotion;
};

/**
 * Component that conditionally renders based on motion preference
 */
export const MotionSafe: FC<{
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ children, fallback = null }) => {
  const { prefersReducedMotion } = useReducedMotion();
  return <>{prefersReducedMotion ? fallback : children}</>;
};
