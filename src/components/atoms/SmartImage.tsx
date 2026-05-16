import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: string;
  placeholderColor?: string;
  containerClassName?: string;
  lowResSrc?: string;
}

export const SmartImage = React.memo(({
  src,
  alt,
  aspectRatio = "aspect-video",
  placeholderColor = "bg-muted/20",
  className,
  containerClassName,
  lowResSrc,
  ...props
}: SmartImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setError(true);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", aspectRatio, containerClassName)}>
      <AnimatePresence mode="wait">
        {!isLoaded && !error && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("absolute inset-0 z-10", placeholderColor, "animate-pulse")}
          />
        )}
      </AnimatePresence>

      {lowResSrc && !isLoaded && (
        <img
          src={lowResSrc}
          alt={alt}
          className={cn("absolute inset-0 w-full h-full object-cover blur-lg scale-110", className)}
          aria-hidden="true"
        />
      )}

      {src && (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0, 
            scale: isLoaded ? 1 : 1.05 
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn(
            "w-full h-full object-cover transition-all",
            !isLoaded && "invisible",
            className
          )}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/10 text-muted-foreground text-xs font-medium uppercase tracking-widest">
          Load Error
        </div>
      )}
    </div>
  );
});

SmartImage.displayName = "SmartImage";
