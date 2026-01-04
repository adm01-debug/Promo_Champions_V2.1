import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ErrorBoundaryFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Algo deu errado
        </h1>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        <details className="text-left mb-6">
          <summary className="cursor-pointer text-sm text-gray-500 mb-2">
            Detalhes do erro
          </summary>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
        <Button onClick={resetError} className="w-full">
          Tentar Novamente
        </Button>
      </div>
    </div>
  );
}
