# GitHub Actions CI/CD Configuration

Este diretório contém as configurações de CI/CD usando GitHub Actions.

## Workflows

### `e2e-tests.yml`
Executa testes E2E e unitários em cada PR e push para main/master.

**Jobs:**
- **e2e-tests**: Executa testes Playwright contra ambiente de staging
- **unit-tests**: Executa testes unitários com Vitest

### `pr-checks.yml`
Validações rápidas em cada PR.

**Jobs:**
- **lint-and-typecheck**: ESLint e TypeScript
- **build**: Verifica se o build compila
- **security-scan**: npm audit para vulnerabilidades

## Secrets Necessários

Configure estes secrets no repositório GitHub (Settings → Secrets and variables → Actions):

### Supabase
| Secret | Descrição |
|--------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon/pública do Supabase |

### E2E Testing
| Secret | Descrição |
|--------|-----------|
| `PLAYWRIGHT_BASE_URL` | URL do ambiente de staging/teste |
| `E2E_ADMIN_EMAIL` | Email do usuário admin de teste |
| `E2E_ADMIN_PASSWORD` | Senha do usuário admin de teste |
| `E2E_MANAGER_EMAIL` | Email do usuário manager de teste |
| `E2E_MANAGER_PASSWORD` | Senha do usuário manager de teste |
| `E2E_SALESPERSON_EMAIL` | Email do usuário salesperson de teste |
| `E2E_SALESPERSON_PASSWORD` | Senha do usuário salesperson de teste |

## Configuração

1. **Conecte o repositório ao GitHub** via Lovable
2. **Adicione os secrets** no GitHub:
   - Vá para Settings → Secrets and variables → Actions
   - Clique em "New repository secret"
   - Adicione cada secret listado acima

3. **Crie usuários de teste** no Supabase:
   ```sql
   -- Após criar via signup normal, atribua roles:
   UPDATE user_roles SET role = 'admin' WHERE user_id = '<admin_id>';
   UPDATE user_roles SET role = 'manager' WHERE user_id = '<manager_id>';
   -- salesperson é default
   ```

4. **Habilite auto-confirm de email** no Supabase Auth para testes

## Artefatos

Quando testes falham, os seguintes artefatos são salvos:

- **playwright-report/**: Relatório HTML dos testes E2E
- **test-screenshots/**: Screenshots de testes que falharam
- **coverage-report/**: Relatório de cobertura de código

## Status Badge

Adicione ao README.md:
```markdown
![E2E Tests](https://github.com/SEU_USUARIO/SEU_REPO/actions/workflows/e2e-tests.yml/badge.svg)
![PR Checks](https://github.com/SEU_USUARIO/SEU_REPO/actions/workflows/pr-checks.yml/badge.svg)
```

## Troubleshooting

### Testes E2E falhando por timeout
- Verifique se `PLAYWRIGHT_BASE_URL` está correto
- Aumente o timeout no `playwright.config.ts`
- Verifique se o ambiente de staging está acessível

### Build falhando
- Verifique se os secrets Supabase estão configurados
- Confirme que todas as dependências estão no package.json

### Autenticação falhando
- Verifique se os usuários de teste existem
- Confirme que as roles estão atribuídas corretamente
- Verifique se auto-confirm de email está ativo
