import '@testing-library/jest-dom/vitest';
import { vi, afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import {
  installConsoleGuard,
  resetConsoleGuard,
  unexpectedConsoleOutput,
} from './consoleGuard';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
    })),
  })),
}));

// Mocks abaixo dependem de `window` — só aplicam no environment jsdom.
// Testes com `// @vitest-environment node` pulam este bloco.
if (typeof window !== 'undefined') {
  global.ResizeObserver = class ResizeObserverMock {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

installConsoleGuard();

beforeEach(() => {
  resetConsoleGuard();
});

afterEach(() => {
  cleanup();

  // Etapa 149: saída de console não declarada reprova o teste. Se o erro é o
  // objeto do teste, declare-o com allowConsoleError/allowConsoleWarn.
  const unexpected = unexpectedConsoleOutput();
  if (unexpected.length > 0) {
    resetConsoleGuard();
    throw new Error(
      `Saída inesperada no console durante o teste:\n${unexpected.join('\n')}\n` +
        'Declare a exceção com allowConsoleError()/allowConsoleWarn() se for intencional.'
    );
  }
});
