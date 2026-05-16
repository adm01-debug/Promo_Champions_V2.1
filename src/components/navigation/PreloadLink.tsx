import React, { FC, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { triggerHaptic } from '@/lib/haptics';

interface PreloadLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  replace?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-current'?: string;
}

/**
 * PreloadLink - An optimized Link component that preloads the target route
 * on hover or touch to achieve near-instant navigation.
 */
export const PreloadLink: FC<PreloadLinkProps> = ({ to, children, className, replace }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const preloadRoute = useCallback(() => {
    // Basic route preloading logic
    // In a more advanced setup, this could trigger a query prefetch or a dynamic import
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = to;
    document.head.appendChild(link);
  }, [to]);

  const handleClick = (e: React.MouseEvent) => {
    if (location.pathname === to) return;
    
    e.preventDefault();
    triggerHaptic('light');
    navigate(to, { replace });
  };

  return (
    <motion.a
      href={to}
      onClick={handleClick}
      onMouseEnter={preloadRoute}
      onTouchStart={preloadRoute}
      className={className}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.a>
  );
};
