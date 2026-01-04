import { Loader2 } from 'lucide-react';

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Carregando...',
}: {
  isLoading: boolean;
  children: React.ReactNode;
  message?: string;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
