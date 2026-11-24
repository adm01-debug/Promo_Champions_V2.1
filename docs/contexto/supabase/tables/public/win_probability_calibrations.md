# public.win_probability_calibrations

> Tabela public.win_probability_calibrations. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), scope text NOT NULL, scope_value text NULLABLE, stage text NOT NULL, historical_win_rate numeric NOT NULL DEFAULT 0, sample_size integer NOT NULL DEFAULT 0, confidence numeric NOT NULL DEFAULT 0, calibrated_probability numeric NOT NULL DEFAULT 0, baseline_probability numeric NOT NULL DEFAULT 0, calculated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.win_probability_calibrations. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `scope` | `text` | não |  |  | Coluna scope da tabela public.win_probability_calibrations. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (scope = ANY (ARRAY['global'::text, 'owner'::text, 'segment'::text, 'source'::text])). |
| 3 | `scope_value` | `text` | sim |  |  | Coluna scope_value da tabela public.win_probability_calibrations. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `stage` | `text` | não |  |  | Coluna stage da tabela public.win_probability_calibrations. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `historical_win_rate` | `numeric` | não | `0` |  | Coluna historical_win_rate da tabela public.win_probability_calibrations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `sample_size` | `integer` | não | `0` |  | Coluna sample_size da tabela public.win_probability_calibrations. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `confidence` | `numeric` | não | `0` |  | Coluna confidence da tabela public.win_probability_calibrations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (confidence >= 0::numeric AND confidence <= 1::numeric). |
| 8 | `calibrated_probability` | `numeric` | não | `0` |  | Coluna calibrated_probability da tabela public.win_probability_calibrations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `baseline_probability` | `numeric` | não | `0` |  | Coluna baseline_probability da tabela public.win_probability_calibrations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 10 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.win_probability_calibrations. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
