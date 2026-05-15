import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig((configEnv) => {
  const baseConfig = typeof viteConfig === 'function' ? viteConfig(configEnv) : viteConfig;
  
  return mergeConfig(
    baseConfig,
    {
      test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html', 'lcov'],
          thresholds: {
            statements: 80,
            branches: 75,
            functions: 80,
            lines: 80,
          },
          exclude: [
            'node_modules/',
            'src/test/setup.ts',
            '**/*.d.ts',
            '**/*.test.ts',
            '**/*.test.tsx',
            'dist/**',
            'tests/**',
          ],
        },
        include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
      },
    }
  );
});
