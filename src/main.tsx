import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import {
  installStaleAssetRecovery,
  isRecoverableAssetError,
  recoverFromStaleAssetError,
} from '@/lib/staleAssetRecovery';
import { installSwAutoUpdate } from '@/lib/swUpdater';

installStaleAssetRecovery();
installSwAutoUpdate();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const bootstrapApp = async (): Promise<void> => {
  const [{ default: App }, { reportWebVitals }] = await Promise.all([
    import('./App'),
    import('@/lib/webVitals'),
  ]);

  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  // Report Core Web Vitals (CLS, INP, LCP, FCP, TTFB)
  reportWebVitals();
};

void bootstrapApp().catch(error => {
  if (isRecoverableAssetError(error)) {
    void recoverFromStaleAssetError(error);
    return;
  }

  console.error('Falha ao inicializar a aplicação:', error);
  createRoot(rootElement).render(
    <main role="alert" className="min-h-screen p-8 bg-background text-foreground">
      <h1 className="text-xl font-semibold">Não foi possível iniciar a aplicação</h1>
      <p className="mt-2 text-muted-foreground">
        Atualize a página. Se o problema persistir, contate o suporte.
      </p>
    </main>
  );
});
