import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Config isolada para testes puros (Node) do módulo quote-to-sale:
 * evita o setup global (que carrega @testing-library/react e trava por
 * incompat react-dom 19). Usada por CI para rodar unit tests logic-only.
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    include: [
      'src/test/quote-error-messages.test.ts',
      'src/test/quote-conversion-errors.test.ts',
    ],
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
});
