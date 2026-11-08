# Banco oficial e conectores MCP — Promo_Champions_V2.1

Referência para quando um conector Supabase falhar ou o rótulo confundir. Movido do antigo `CLAUDE.md` (seção 1) na limpeza das instruções para agentes.

## Identidade do banco

| O que            | Valor                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| Projeto Supabase | `usyxfpqlsspldubptrdl` (Cloud)                                                         |
| URL              | `https://usyxfpqlsspldubptrdl.supabase.co`                                             |
| Dashboard        | https://supabase.com/dashboard/project/usyxfpqlsspldubptrdl                            |
| MCP para SQL     | gateway `supabase-promo-champions-v2-mcp.adm01.workers.dev` (rótulo "…LOVABLE CLOUD…") |
| Migrations       | timestamp `YYYYMMDDHHmmss`, estritamente crescente                                     |

> Corrigido em 2026-09-02 (ref antigo `rapjswienfhkobhlamxb`) e **reprovado em 2026-09-13**: a "prova" anterior citava `_internal_secrets.functions_base_url`, chave que **não existe** no banco. A prova reproduzível está em `docs/estado/IDENTIDADE_BANCO_2026-09-13.md` (health endpoint do gateway MCP + laço escrita-pela-API/leitura-pelo-MCP). Conclusão igual, evidência real.
>
> **Atenção ao rótulo do conector:** o MCP que funciona aparece no Claude como "MCP - SUPABASE LOVABLE CLOUD - PROMO CHAMPIONS V2" — apesar do nome, aponta para `usyxfpqlsspldubptrdl`. O conector `SUPABASE_PROMO_CHAMPIONS_-_V2_MCP` responde 401 e está inutilizável. (Observação de 2026-10-18; os rótulos dos conectores mudam com o tempo — confira pelo health endpoint do gateway antes de concluir qual funciona.)

## Bancos que NÃO são deste projeto

- Supabase self-hosted VPS AtomicaBR
- Qualquer outro projeto Supabase da lista do usuário

## Regras de migration (cópia integral)

1. Usar `db_query` no MCP com DDL direto — NÃO usar `supabase_apply_migration`.
2. `migrate-helper` edge function foi removida (security: expunha service_role).
3. Versão = timestamp estritamente crescente. Conferir `SELECT max(version)` antes.
4. Toda DDL = arquivo em `supabase/migrations/` + comentário descritivo no topo.
5. `CREATE INDEX CONCURRENTLY` falha (gateway transacional) — usar `CREATE INDEX` simples.
6. Convenções de schema (nomes, `TIMESTAMPTZ`, `NUMERIC(15,2)` para dinheiro, RLS + `updated_at` obrigatórios): **docs/SCHEMA_CONVENTIONS.md**.
7. Padrão de hardening: functions com `SECURITY INVOKER`, grants mínimos por role.
