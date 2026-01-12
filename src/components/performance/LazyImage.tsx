import { useState, useEffect, useRef, FC, ImgHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  placeholder?: string;
  blurDataURL?: string;
  fallback?: string;
  aspectRatio?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  threshold?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * LazyImage - Lazy loading image with blur placeholder and fade-in animation
 */
export const LazyImage: FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = '/placeholder.svg',
  blurDataURL,
  fallback = '/placeholder.svg',
  aspectRatio,
  objectFit = 'cover',
  threshold = 0.1,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const imageSrc = hasError ? fallback : (isInView ? src : placeholder);

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <div
          className="absolute inset-0 scale-110 blur-lg"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Actual image */}
      <motion.img
        src={imageSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "w-full h-full transition-opacity",
          `object-${objectFit}`
        )}
        {...props}
      />

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};

interface ProgressiveImageProps extends LazyImageProps {
  lowResSrc?: string;
}

/**
 * ProgressiveImage - Loads low-res first, then high-res
 */
export const ProgressiveImage: FC<ProgressiveImageProps> = ({
  src,
  lowResSrc,
  alt,
  className,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(lowResSrc || src);
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);

  useEffect(() => {
    if (!lowResSrc) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsHighResLoaded(true);
    };
  }, [src, lowResSrc]);

  return (
    <LazyImage
      src={currentSrc}
      alt={alt}
      className={cn(
        !isHighResLoaded && lowResSrc && "blur-sm transition-all duration-500",
        className
      )}
      {...props}
    />
  );
};
