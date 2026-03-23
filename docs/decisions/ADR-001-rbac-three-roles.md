# ADR-001: RBAC com 3 Roles

## Status
Aceito — Janeiro 2025

## Contexto
O SalesPro é uma plataforma de gestão de vendas com hierarquia organizacional clara: administradores, gestores e vendedores. Precisávamos de um sistema de controle de acesso que refletisse essa hierarquia sem adicionar complexidade desnecessária.

## Decisão
Implementamos RBAC com 3 roles fixas: `admin`, `manager` e `salesperson`.

- Roles armazenadas em tabela dedicada `user_roles` (não no perfil do usuário).
- Função `has_role()` como `SECURITY DEFINER` para evitar recursão em RLS.
- Novos usuários recebem automaticamente a role `salesperson` via trigger.
- Apenas `admin` pode modificar roles.

## Consequências

### Positivas
- Simplicidade de implementação e manutenção.
- Performance: queries de role são O(1) com índice em `user_id`.
- Segurança: impossível auto-escalação de privilégios.

### Negativas
- Flexibilidade limitada: não suporta roles customizadas sem migração.
- Granularidade: permissões são role-based, não feature-based (mitigado pelo sistema de `permissions`).

## Alternativas Consideradas
1. **Roles dinâmicas em JSON**: Rejeitada por falta de type-safety e impossibilidade de usar em RLS.
2. **ACL por recurso**: Rejeitada por complexidade excessiva para o tamanho da equipe.
