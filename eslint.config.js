import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Deno edge functions use `npm:`/`https:` imports + Deno globals that
    // conflict with the Node/TS parser. They are linted independently via `deno lint`.
    ignores: [
      'dist',
      'node_modules',
      '.lovable',
      'bun.lock',
      'package-lock.json',
      'supabase/functions/**',
      '**/*.config.{ts,js,cjs,mjs}',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
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
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
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
