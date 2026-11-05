# public.sla_policies

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
| 2 | `stage` | `text` | não |  |  |  |
| 3 | `max_hours` | `integer` | não | `72` |  |  |
| 4 | `warning_hours` | `integer` | não | `48` |  |  |
| 5 | `is_active` | `boolean` | não | `true` |  |  |
| 6 | `description` | `text` | sim |  |  |  |
| 7 | `created_by` | `uuid` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sla_policies_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sla_policies_stage_key | UNIQUE | `UNIQUE (stage)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.sla_violations | sla_violations_policy_id_fkey | policy_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| sla_policies_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sla_policies_pkey ON public.sla_policies USING btree (id)` |
| sla_policies_stage_key | btree | stage | sim | sim |  | `CREATE UNIQUE INDEX sla_policies_stage_key ON public.sla_policies USING btree (stage)` |


## Policies (RLS)

### `Admin/manager can manage SLA policies`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated can view SLA policies`

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
| trg_sla_policies_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
