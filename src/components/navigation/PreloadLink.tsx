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
  'aria-current'?: "date" | "false" | "location" | "page" | "step" | "time" | "true" | boolean;
}

/**
 * PreloadLink - An optimized Link component that preloads the target route
 * on hover or touch to achieve near-instant navigation.
 */
export const PreloadLink: FC<PreloadLinkProps> = ({ to, children, className, replace, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const preloadRoute = useCallback(() => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = to;
    document.head.appendChild(link);
  }, [to]);

  const handleClick = (e: React.MouseEvent) => {
    // If it's an external link or a hash, let the browser handle it
    if (to.startsWith('http') || to.startsWith('#')) {
      if (props.onClick) props.onClick();
      return;
    }

    if (location.pathname === to) {
      e.preventDefault();
      return;
    }
    
    e.preventDefault();
    triggerHaptic('light');
    if (props.onClick) props.onClick();
    navigate(to, { replace });
  };

  const { onClick: _onClick, ...rest } = props;

  return (
    <motion.a
      href={to}
      onClick={handleClick}
      onMouseEnter={preloadRoute}
      onTouchStart={preloadRoute}
      className={className}
      whileTap={{ scale: 0.98 }}
      {...rest}
    >
      {children}
    </motion.a>
  );
};
