# public.stage_inactivity_rules

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
| 3 | `label` | `text` | não |  |  |  |
| 4 | `mild_days` | `integer` | não |  |  |  |
| 5 | `moderate_days` | `integer` | não |  |  |  |
| 6 | `critical_days` | `integer` | não |  |  |  |
| 7 | `enabled` | `boolean` | não | `true` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| stage_inactivity_rules_check | CHECK | `CHECK (moderate_days > mild_days)` |  |  | sim |
| stage_inactivity_rules_check1 | CHECK | `CHECK (critical_days > moderate_days)` |  |  | sim |
| stage_inactivity_rules_mild_days_check | CHECK | `CHECK (mild_days > 0)` |  |  | sim |
| stage_inactivity_rules_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| stage_inactivity_rules_stage_key | UNIQUE | `UNIQUE (stage)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| stage_inactivity_rules_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX stage_inactivity_rules_pkey ON public.stage_inactivity_rules USING btree (id)` |
| stage_inactivity_rules_stage_key | btree | stage | sim | sim |  | `CREATE UNIQUE INDEX stage_inactivity_rules_stage_key ON public.stage_inactivity_rules USING btree (stage)` |


## Policies (RLS)

### `Authenticated can read stage inactivity rules`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Only admins can manage stage inactivity rules`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_stage_inactivity_rules_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
