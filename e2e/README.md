# E2E Tests - RLS Policy Verification

Este diretório contém testes E2E (End-to-End) usando Playwright para verificar que as políticas de Row Level Security (RLS) estão funcionando corretamente em ambiente de produção.

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.e2e` na raiz do projeto com as credenciais de teste:

```env
# Base URL do ambiente de teste
PLAYWRIGHT_BASE_URL=http://localhost:8080

# Credenciais de teste - Admin
E2E_ADMIN_EMAIL=admin@seudominio.com
E2E_ADMIN_PASSWORD=senha_admin_segura

# Credenciais de teste - Manager
E2E_MANAGER_EMAIL=manager@seudominio.com
E2E_MANAGER_PASSWORD=senha_manager_segura

# Credenciais de teste - Salesperson
E2E_SALESPERSON_EMAIL=vendedor@seudominio.com
E2E_SALESPERSON_PASSWORD=senha_vendedor_segura
```

### 2. Criar Usuários de Teste no Banco

Antes de executar os testes, crie os usuários de teste no Supabase com as respectivas roles:

```sql
-- Os usuários serão criados via signup normal
-- Depois, atribua as roles corretas:

-- Para admin
UPDATE user_roles SET role = 'admin' WHERE user_id = '<admin_user_id>';

-- Para manager  
UPDATE user_roles SET role = 'manager' WHERE user_id = '<manager_user_id>';

-- Salesperson já é a role padrão
```

### 3. Instalar Browsers do Playwright

```bash
npx playwright install chromium
```

## Executando os Testes

### Todos os testes
```bash
npx playwright test
```

### Testes específicos de RLS
```bash
npx playwright test rls-policies
```

### Com interface visual
```bash
npx playwright test --ui
```

### Gerar relatório HTML
```bash
npx playwright test --reporter=html
npx playwright show-report
```

## Estrutura dos Testes

### `auth.setup.ts`
Configura autenticação para diferentes roles (admin, manager, salesperson).

### `rls-policies.spec.ts`
Testes principais de RLS:

1. **Unauthenticated Access** - Verifica que usuários não autenticados são redirecionados
2. **Salesperson Restrictions** - Verifica que vendedores não podem criar/editar clientes, produtos, etc.
3. **Manager Access** - Verifica que managers têm acesso a relatórios e podem criar dados
4. **Admin Full Access** - Verifica que admins têm acesso total
5. **Data Visibility** - Verifica visibilidade intencional para rankings/gamificação
6. **Notification Isolation** - Verifica que usuários só veem suas próprias preferências

## Cenários de Teste

| Cenário | Salesperson | Manager | Admin |
|---------|-------------|---------|-------|
| Ver dashboard | ✅ | ✅ | ✅ |
| Ver ranking | ✅ | ✅ | ✅ |
| Ver analytics | ✅ | ✅ | ✅ |
| Criar cliente | ❌ | ✅ | ✅ |
| Criar produto | ❌ | ✅ | ✅ |
| Criar playbook | ❌ | ✅ | ✅ |
| Criar cadência | ❌ | ✅ | ✅ |
| Ver logs de acesso | ❌ | ✅ | ✅ |
| Gerenciar roles | ❌ | ❌ | ✅ |
| Config. segurança | ❌ | ✅ | ✅ |

## Troubleshooting

### Testes falhando por timeout
- Aumente o timeout no `playwright.config.ts`
- Verifique se o servidor está rodando

### Autenticação falhando
- Verifique se os usuários de teste existem no banco
- Confirme que as roles estão atribuídas corretamente
- Verifique se o email está confirmado (ou auto-confirm está ativo)

### Screenshots de falha
Os screenshots de testes que falharam são salvos em `test-results/`.
