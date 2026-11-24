# public.win_probability_deal_calibrations

> Tabela public.win_probability_deal_calibrations. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, stage text NOT NULL, segment text NOT NULL DEFAULT 'all'::text, owner_id uuid NULLABLE, declared_probability numeric NOT NULL DEFAULT 0, historical_win_rate numeric NOT NULL DEFAULT 0, calibrated_probability numeric NOT NULL DEFAULT 0, calibration_delta numeric NULLABLE DEFAULT (calibrated_probability - declared_probability), confidence text NOT NULL DEFAULT 'low'::text, flag text NOT NULL DEFAULT 'aligned'::text, sample_size integer NOT NULL DEFAULT 0, computed_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `stage` | `text` | não |  |  | Coluna stage da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `segment` | `text` | não | `'all'::text` |  | Coluna segment da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'all'::text. |
| 5 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: uuid. Aceita NULL. |
| 6 | `declared_probability` | `numeric` | não | `0` |  | Coluna declared_probability da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `historical_win_rate` | `numeric` | não | `0` |  | Coluna historical_win_rate da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `calibrated_probability` | `numeric` | não | `0` |  | Coluna calibrated_probability da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `calibration_delta` | `numeric` | sim | `(calibrated_probability - declared_probability)` | s | Coluna calibration_delta da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão: (calibrated_probability - declared_probability). |
| 10 | `confidence` | `text` | não | `'low'::text` |  | Coluna confidence da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'low'::text. Validação CHECK: CHECK (confidence = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])). |
| 11 | `flag` | `text` | não | `'aligned'::text` |  | Coluna flag da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'aligned'::text. Validação CHECK: CHECK (flag = ANY (ARRAY['overconfident'::text, 'underconfident'::text, 'aligned'::text])). |
| 12 | `sample_size` | `integer` | não | `0` |  | Coluna sample_size da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 13 | `computed_at` | `timestamp with time zone` | não | `now()` |  | Coluna computed_at da tabela public.win_probability_deal_calibrations. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| win_probability_deal_calibrations_confidence_check | CHECK | `CHECK (confidence = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))` |  |  | sim |
| win_probability_deal_calibrations_flag_check | CHECK | `CHECK (flag = ANY (ARRAY['overconfident'::text, 'underconfident'::text, 'aligned'::text]))` |  |  | sim |
| win_probability_deal_calibrations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| win_probability_deal_calibrations_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| win_probability_deal_calibrations_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wpdc_flag | btree | flag | não | sim |  | `CREATE INDEX idx_wpdc_flag ON public.win_probability_deal_calibrations USING btree (flag)` |
| idx_wpdc_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_wpdc_sale ON public.win_probability_deal_calibrations USING btree (sale_id)` |
| idx_wpdc_stage_segment | btree | stage, segment | não | sim |  | `CREATE INDEX idx_wpdc_stage_segment ON public.win_probability_deal_calibrations USING btree (stage, segment)` |
| win_probability_deal_calibrations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX win_probability_deal_calibrations_pkey ON public.win_probability_deal_calibrations USING btree (id)` |
| win_probability_deal_calibrations_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX win_probability_deal_calibrations_sale_id_key ON public.win_probability_deal_calibrations USING btree (sale_id)` |


## Policies (RLS)

### `Admin/manager manage wpdc`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read wpdc`

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
