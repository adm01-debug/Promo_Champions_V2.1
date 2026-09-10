# Configuração de CI/CD do GitHub Actions

## Workflows

### `pr-checks.yml`
Pipeline canônico: lint, tipos, segredos, testes, cobertura, Deno, E2E, build,
Lighthouse e orçamento dos bundles. No `main`, mantém os gates essenciais.

### Regressões de Edge Functions

- `cron-monitoring.yml`: monitora o alarme de falhas dos crons.
- `edge-functions-bundle.yml`: valida o bundle das Edge Functions.
- `edge-functions-request-id.yml`: valida propagação e robustez de request IDs.
- `quote-to-sale-e2e.yml`: valida o fluxo orçamento → venda.
- `qa-exhaustive.yml`: executa a bateria exaustiva sob demanda.

### `codeql.yml`
Análise de segurança semanal com CodeQL.
