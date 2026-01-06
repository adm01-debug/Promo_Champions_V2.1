import React from 'react';

// Image Optimization Utilities
export function optimizeImage(url: string, width?: number, quality = 80) {
  // Se for Cloudinary, Imgix ou similar
  if (url.includes('cloudinary') || url.includes('imgix')) {
    const params = [];
    if (width) params.push(`w_${width}`);
    params.push(`q_${quality}`);
    return `${url}?${params.join(',')}`;
  }
  
  return url;
}

// Lazy load images
export function LazyImage({
  src,
  alt,
  width,
  height,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  return React.createElement('img', {
    src: optimizeImage(src, width),
    alt,
    width,
    height,
    className,
    loading: 'lazy',
    decoding: 'async',
  });
}
