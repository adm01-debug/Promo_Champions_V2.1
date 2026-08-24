# GitHub Actions CI/CD Configuration

## Workflows

### `lint.yml`
Executa ESLint em push/PR para main.

### `pr-checks.yml`
Validações em cada PR: Lint, TypeScript check e Build.

### `codeql.yml`
Análise de segurança semanal com CodeQL.
