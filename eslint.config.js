import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
// typescript-eslint 8.x não suporta a API nativa do TypeScript 7.0.
// TypeScript 7.0 fornece compatibilidade retroativa via 'typescript/ts6'.
// Ref: https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0
import ts from 'typescript/ts6';

export default tseslint.config(
  {
    // Deno edge functions use `npm:`/`https:` imports + Deno globals that
    // conflict with the Node/TS parser. They are linted independently via `deno lint`.
    ignores: [
      'dist',
      'coverage',
      'node_modules',
      'playwright-report',
      'test-results',
      '.lovable',
      'bun.lock',
      'package-lock.json',
      'supabase/functions/**',
      '**/*.config.{ts,js,cjs,mjs}',
      // Gerador de contexto e teste do publicador portados sem alteração do Zapp_Web_V2 (cobertos por
      // contexto-testes.yml); ficam fora do ratchet de complexidade, que mede o código do app.
      'scripts/ai-context/**',
      'scripts/ci/contexto-publicacao.unit.mjs',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        typescriptModule: ts,
      },
    },
    extends: [
      ...tseslint.configs.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Fast Refresh DX hint only (no runtime/correctness impact); many modules
      // intentionally co-export components with hooks, types and constants.
      'react-refresh/only-export-components': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Delegated to unused-imports plugin (auto-fixes dead imports)
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      // CONSOLE-ENVELOPE: bloqueia console.* novo — usar @/lib/log/logger.
      // allowlist temporária de warn/error até a baseline restante migrar.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      // Discourage double-cast `as unknown as T` — it bypasses TypeScript safety.
      'no-restricted-syntax': [
        'warn',
        {
          selector: 'TSAsExpression > TSAsExpression[typeAnnotation.type="TSUnknownKeyword"]',
          message: 'Avoid `as unknown as T`; prefer a narrower type assertion or proper typing.',
        },
      ],
    },
  },
  // Logging is legitimate in build scripts and test suites
  {
    files: [
      'scripts/**',
      'tests/**',
      'src/test/**',
      '**/*.test.{ts,tsx}',
    ],
    rules: {
      'no-console': 'off',
      // Playwright fixtures shadow the `use` identifier — this is not a React hook.
      'react-hooks/rules-of-hooks': 'off',
    },
  }
);
