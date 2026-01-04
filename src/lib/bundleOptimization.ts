// Bundle Optimization
export const shouldUseCDN = (library: string) => {
  // Lista de libs que devem vir do CDN
  const cdnLibs = ['react', 'react-dom', 'lodash'];
  return cdnLibs.includes(library);
};

// Tree shaking helpers
export { Button } from '@/components/ui/button';
// Ao invés de: export * from '@/components/ui/button';
