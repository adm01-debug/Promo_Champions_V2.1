# GitHub Environments — Modelo de Segurança

## `pr-preview`

**REGRA CRÍTICA: este environment NUNCA deve conter secrets reais.**

O environment `pr-preview` é declarado nos jobs `e2e`, `e2e-quote-to-sale` e
`invariants` **exclusivamente** para restringir quais PRs recebem permissão de
deployment — não para injetar credenciais.

### Por que está vazio?

O modelo de segurança em camadas do projeto:

1. **Camada plataforma (GitHub):** o trigger `pull_request` **bloqueia**
   automaticamente o acesso a secrets para PRs de forks. Secrets nunca
   chegam ao runner de um fork, independente do que o YAML declare.

2. **Camada workflow (explícita):** os jobs com `environment: pr-preview`
   têm `if:` com fork guard:

   ```
   github.event.pull_request.head.repo.full_name == github.repository
   ```

   Isso adiciona rejeição explícita em nível de job, antes mesmo que o
   runner seja alocado.

3. **Camada aplicação (graceful skip):** cada job valida presença de todos
   os secrets antes de executar. Se ausentes: skip com `::warning::`. Se
   parciais: falha ruidosa com lista dos ausentes. Nunca passa silenciosamente.

O resultado é: **secrets configurados no environment `pr-preview` seriam
expostos desnecessariamente** a toda PR interna, ampliando a superfície de
ataque sem benefício. Os secrets vivem apenas nos jobs que realmente precisam
deles (ex: jobs de deploy de produção em outros workflows).

### Onde ficam os secrets de CI?

Secrets de CI como `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
`E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`, `SUPABASE_DB_URL`, etc., são
configurados no **nível do repositório** (Settings → Secrets and variables →
Actions) ou em environments separados de produção — nunca em `pr-preview`.

### Comportamento por tipo de PR

| Origem da PR                 | Secrets disponíveis       | E2E/Invariantes       |
| ---------------------------- | ------------------------- | --------------------- |
| Interna (mesmo repo, humano) | Sim (repo-level)          | Executa normalmente   |
| Dependabot                   | Não (`actor` guard)       | Skip (job não inicia) |
| Fork externo                 | Não (plataforma bloqueia) | Skip (job não inicia) |
| `workflow_dispatch`          | Sim (repo-level)          | Executa normalmente   |

## `deno-tests` e `sql-tests` — Comportamento intencional com forks

Os jobs `deno-tests` e `sql-tests` em `pr-checks.yml` **não têm** fork guard
no `if:` — isso é **intencional**. O comentário no job documenta:

> Forks não recebem secrets — o tier live pularia sempre; unit segue útil.

Para forks, secrets chegam como string vazia (GitHub os bloqueia na plataforma).
A suíte Deno tem dois tiers:

- `unit` — self-contained, não precisa de secrets, roda normalmente
- `live` — secrets-dependent, detecta ausência e emite `::warning::`, não reprova

Isso preserva feedback de CI útil para contribuidores externos sem expor
infrastrutura de produção.

## Histórico de mudanças

| Data       | Mudança                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-15 | Fix crítico: `deployment_branch_policy: null` (era `custom_branch_policies: true` com lista vazia, bloqueava TODO deploy ao environment) |
| 2026-10-15 | Criação deste documento (auditoria adversarial de 10 agentes)                                                                            |
