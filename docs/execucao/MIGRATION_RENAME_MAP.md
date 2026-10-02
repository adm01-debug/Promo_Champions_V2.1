# MIGRATION_RENAME_MAP — reconciliação de `supabase_migrations.schema_migrations`

**Data:** 2026-10-01
**Contexto:** pacote de higiene da auditoria de banco de dados. 15 arquivos de
migration foram renomeados (versão não-numérica, versão de 8 dígitos ou versão
duplicada) e 3 arquivos vazios foram removidos. Nenhum conteúdo SQL foi alterado.

Produção pode ter registrado em `supabase_migrations.schema_migrations` as
**versões antigas**. Sem reconciliação, `supabase migration list`/`db push`
enxerga as migrations renomeadas como "novas" e tenta reaplicá-las (erros de
objeto já existente) — e as versões antigas ficam como "remotas sem arquivo
local". Aplique os passos abaixo **antes** do próximo `db push`.

## 1. Renomeações (nome_antigo → nome_novo)

| Arquivo antigo | Arquivo novo | Motivo |
|---|---|---|
| `20250102_audit_log.sql` | `20250102000001_audit_log.sql` | versão de 8 dígitos + versão duplicada (3 arquivos) |
| `20250102_saved_filters.sql` | `20250102000002_saved_filters.sql` | idem |
| `20250102_versioning.sql` | `20250102000003_versioning.sql` | idem |
| `20251228_add_soft_delete.sql` | `20251228000001_add_soft_delete.sql` | idem |
| `20251228_advanced_permissions.sql` | `20251228000002_advanced_permissions.sql` | idem |
| `20251228_move_extensions_to_schema.sql` | `20251228000003_move_extensions_to_schema.sql` | idem |
| `20260530_add_missing_fk_indexes.sql` | `20260530000001_add_missing_fk_indexes.sql` | idem |
| `20260530_enable_rls_and_remove_env_risk.sql` | `20260530000002_enable_rls_and_remove_env_risk.sql` | idem |
| `20260530_idempotent_tables_if_not_exists.sql` | `20260530000003_idempotent_tables_if_not_exists.sql` | idem |
| `20260105ab_new_ab_tests.sql` | `20260105000006_new_ab_tests.sql` | versão com letras |
| `20260105fe_new_feature_flags.sql` | `20260105000007_new_feature_flags.sql` | versão com letras |
| `20260105we_new_webhooks.sql` | `20260105000008_new_webhooks.sql` | versão com letras |
| `20260104143930_webhooks_system.sql` | `20260104143931_webhooks_system.sql` | versão duplicada com `_audit_trail` |
| `20260104170152_stored_procedures.sql` | `20260104170153_stored_procedures.sql` | versão duplicada com `_additional_indexes` |
| `20260104181000_stored_procedures_additional.sql` | `20260104181001_stored_procedures_additional.sql` | versão duplicada com `_materialized_views_enhanced` |

## 2. Remoções (arquivos só com comentários — nada executável)

- `202601050000ad_additional_indexes.sql`
- `202601050000ma_materialized_views.sql`
- `202601050000so_soft_delete_integration.sql`

## 3. Movidos (não são migrations — eram testes Deno no diretório errado)

- `supabase/migrations/canonical_hardening_contract_test.ts` → `tests/migrations/canonical_hardening_contract_test.ts`
- `supabase/migrations/race_leaderboard_status_contract_test.ts` → `tests/migrations/race_leaderboard_status_contract_test.ts`

Rodam com `deno task test:migrations` (ou `deno test --allow-read tests/migrations/`).

## 4. Passo 1 — conferir o que produção registrou

```sql
SELECT version, name
  FROM supabase_migrations.schema_migrations
 WHERE version IN (
   '20250102', '20251228', '20260530',
   '20260105ab', '20260105fe', '20260105we',
   '202601050000ad', '202601050000ma', '202601050000so',
   '20260104143930', '20260104170152', '20260104181000'
 )
 ORDER BY version;
```

Aplique os passos 5–8 **somente para as versões que aparecerem** no resultado.

## 5. Passo 2 — versões de 8 dígitos (1 linha antiga → 3 arquivos)

Cada versão antiga cobria 3 arquivos. Atualize a linha existente para a primeira
versão nova e insira as outras duas como já aplicadas:

```sql
-- 20250102 → audit_log / saved_filters / versioning
UPDATE supabase_migrations.schema_migrations
   SET version = '20250102000001', name = 'audit_log'
 WHERE version = '20250102';
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20250102000002', 'saved_filters'),
       ('20250102000003', 'versioning')
ON CONFLICT (version) DO NOTHING;

-- 20251228 → add_soft_delete / advanced_permissions / move_extensions_to_schema
UPDATE supabase_migrations.schema_migrations
   SET version = '20251228000001', name = 'add_soft_delete'
 WHERE version = '20251228';
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20251228000002', 'advanced_permissions'),
       ('20251228000003', 'move_extensions_to_schema')
ON CONFLICT (version) DO NOTHING;

-- 20260530 → add_missing_fk_indexes / enable_rls_and_remove_env_risk / idempotent_tables_if_not_exists
UPDATE supabase_migrations.schema_migrations
   SET version = '20260530000001', name = 'add_missing_fk_indexes'
 WHERE version = '20260530';
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260530000002', 'enable_rls_and_remove_env_risk'),
       ('20260530000003', 'idempotent_tables_if_not_exists')
ON CONFLICT (version) DO NOTHING;
```

## 6. Passo 3 — versões com letras (1:1)

```sql
UPDATE supabase_migrations.schema_migrations
   SET version = '20260105000006', name = 'new_ab_tests'
 WHERE version = '20260105ab';
UPDATE supabase_migrations.schema_migrations
   SET version = '20260105000007', name = 'new_feature_flags'
 WHERE version = '20260105fe';
UPDATE supabase_migrations.schema_migrations
   SET version = '20260105000008', name = 'new_webhooks'
 WHERE version = '20260105we';
```

## 7. Passo 4 — versões dos arquivos removidos

Os 3 arquivos não tinham nada executável — se houver linha, é resíduo:

```sql
DELETE FROM supabase_migrations.schema_migrations
 WHERE version IN ('202601050000ad', '202601050000ma', '202601050000so');
```

## 8. Passo 5 — versões duplicadas de 14 dígitos (caso a caso)

Cada par compartilhava **uma única versão** — produção só pode ter registrado
uma linha por versão, referente ao arquivo que de fato rodou.

- `20260104143930`: mantida por `20260104143930_audit_trail.sql`;
  `webhooks_system` virou `20260104143931`.
- `20260104170152`: mantida por `20260104170152_additional_indexes.sql`;
  `stored_procedures` virou `20260104170153`.
- `20260104181000`: mantida por `20260104181000_materialized_views_enhanced.sql`;
  `stored_procedures_additional` virou `20260104181001`.

**Se a linha antiga existe e corresponde ao arquivo que ficou com a versão**
(o esperado): o arquivo renomeado será aplicado como migration nova no próximo
`db push`. Antes, confira se os objetos dele já existem (ex.:
`\d+ <tabela>` no psql ou `SELECT to_regclass('public.<tabela>')`). Se já
existirem, marque como aplicada sem rodar:

```sql
INSERT INTO supabase_migrations.schema_migrations (version, name)
VALUES ('20260104143931', 'webhooks_system')
ON CONFLICT (version) DO NOTHING;
-- idem para '20260104170153'/'stored_procedures' e '20260104181001'/'stored_procedures_additional' conforme o caso
```

**Se a linha antiga corresponder ao arquivo renomeado** (o outro do par nunca
rodou): troque o mapeamento —

```sql
UPDATE supabase_migrations.schema_migrations
   SET version = '20260104143931', name = 'webhooks_system'
 WHERE version = '20260104143930';
-- aí 20260104143930_audit_trail.sql vira pendente e será aplicada normalmente
```

Equivalente via CLI (alternativa ao SQL acima, por versão):

```bash
supabase migration repair --status applied 20260104143931   # marca aplicada
supabase migration repair --status reverted 202601050000ad  # remove linha sem arquivo local
```

## 9. Verificação pós-reconciliação

```sql
-- não pode sobrar versão antiga nem versão nova duplicada:
SELECT version, count(*) FROM supabase_migrations.schema_migrations
 GROUP BY version HAVING count(*) > 1;

SELECT version FROM supabase_migrations.schema_migrations
 WHERE version ~ '[^0-9]' OR length(version) < 14
 ORDER BY version;
```

E localmente:

```bash
supabase migration list   # local e remoto devem bater, sem 'not found'
node scripts/check-migrations.mjs --base origin/main
```
