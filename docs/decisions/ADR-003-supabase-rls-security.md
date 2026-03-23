# ADR-003: Row Level Security como Camada Primária de Segurança

## Status
Aceito — Fevereiro 2025

## Contexto
Como aplicação SPA sem backend próprio, o SalesPro acessa o banco diretamente via Supabase client. Isso exige que a segurança seja enforçada no nível do banco de dados, não apenas no frontend.

## Decisão
Toda segurança de acesso a dados é implementada via RLS (Row Level Security) do PostgreSQL, complementada por RPCs `SECURITY DEFINER` para operações sensíveis.

### Padrões adotados:
- Tabelas sensíveis (MFA, sessões, SMS) acessíveis **apenas via RPCs**.
- Função `has_role()` como `SECURITY DEFINER` para evitar recursão em policies.
- View `salespeople_public` com `security_invoker` para expor apenas campos não-sensíveis.
- Políticas de INSERT em `user_roles` restritas a `admin`.

## Consequências

### Positivas
- Segurança enforçada no banco: impossível burlar via DevTools.
- Auditabilidade: todas as policies são versionadas em migrations.
- Performance: policies compiladas pelo PostgreSQL como condições de WHERE.

### Negativas
- Debugging de RLS é complexo (erros genéricos "violates row-level security").
- Alterações de schema requerem revisão cuidadosa de policies existentes.

## Referências
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- OWASP: Broken Access Control (A01:2021)
