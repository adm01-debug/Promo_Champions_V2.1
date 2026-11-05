# public.lead_routing_rules

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `strategy` | `text` | não | `'round_robin'::text` |  |  |
| 4 | `priority` | `integer` | não | `0` |  |  |
| 5 | `is_active` | `boolean` | não | `true` |  |  |
| 6 | `filter_state` | `text` | sim |  |  |  |
| 7 | `filter_min_value` | `numeric` | sim |  |  |  |
| 8 | `filter_source` | `text` | sim |  |  |  |
| 9 | `filter_role` | `text` | sim |  |  |  |
| 10 | `description` | `text` | sim |  |  |  |
| 11 | `created_by` | `uuid` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `filter_job_titles` | `text[]` | sim |  |  |  |
| 15 | `filter_products` | `text[]` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_routing_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.lead_assignments | lead_assignments_rule_id_fkey | rule_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| lead_routing_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_routing_rules_pkey ON public.lead_routing_rules USING btree (id)` |


## Policies (RLS)

### `Admin/manager manage routing rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated view routing rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_lead_routing_rules_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
