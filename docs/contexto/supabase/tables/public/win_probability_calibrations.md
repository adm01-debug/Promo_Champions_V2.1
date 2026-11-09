# public.win_probability_calibrations

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `scope` | `text` | não |  |  |  |
| 3 | `scope_value` | `text` | sim |  |  |  |
| 4 | `stage` | `text` | não |  |  |  |
| 5 | `historical_win_rate` | `numeric` | não | `0` |  |  |
| 6 | `sample_size` | `integer` | não | `0` |  |  |
| 7 | `confidence` | `numeric` | não | `0` |  |  |
| 8 | `calibrated_probability` | `numeric` | não | `0` |  |  |
| 9 | `baseline_probability` | `numeric` | não | `0` |  |  |
| 10 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| win_probability_calibrations_confidence_check | CHECK | `CHECK (confidence >= 0::numeric AND confidence <= 1::numeric)` |  |  | sim |
| win_probability_calibrations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| win_probability_calibrations_scope_check | CHECK | `CHECK (scope = ANY (ARRAY['global'::text, 'owner'::text, 'segment'::text, 'source'::text]))` |  |  | sim |
| win_probability_calibrations_scope_scope_value_stage_key | UNIQUE | `UNIQUE (scope, scope_value, stage)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wpc_calculated_at | btree | calculated_at | não | sim |  | `CREATE INDEX idx_wpc_calculated_at ON public.win_probability_calibrations USING btree (calculated_at DESC)` |
| idx_wpc_scope_stage | btree | scope, scope_value, stage | não | sim |  | `CREATE INDEX idx_wpc_scope_stage ON public.win_probability_calibrations USING btree (scope, scope_value, stage)` |
| win_probability_calibrations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX win_probability_calibrations_pkey ON public.win_probability_calibrations USING btree (id)` |
| win_probability_calibrations_scope_scope_value_stage_key | btree | scope, scope_value, stage | sim | sim |  | `CREATE UNIQUE INDEX win_probability_calibrations_scope_scope_value_stage_key ON public.win_probability_calibrations USING btree (scope, scope_value, stage)` |


## Policies (RLS)

### `Admin/manager write calibrations`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read calibrations`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
