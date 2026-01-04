// Code Splitting Utilities
export const lazyLoad = (componentPath: string) => {
  return React.lazy(() => import(componentPath));
};

export const preloadComponent = (componentPath: string) => {
  import(componentPath);
};

// Preload on hover
export function usePrefetch(componentPath: string) {
  const handleMouseEnter = () => {
    preloadComponent(componentPath);
  };
  
  return { onMouseEnter: handleMouseEnter };
}
