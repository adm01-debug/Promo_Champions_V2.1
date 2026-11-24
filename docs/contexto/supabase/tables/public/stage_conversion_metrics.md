# public.stage_conversion_metrics

> Tabela public.stage_conversion_metrics. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), from_stage text NOT NULL, to_stage text NOT NULL, owner_id uuid NULLABLE, entered_count integer NOT NULL DEFAULT 0, converted_count integer NOT NULL DEFAULT 0, lost_count integer NOT NULL DEFAULT 0, conversion_rate numeric(5,2) NOT NULL DEFAULT 0, avg_transition_days numeric(8,2) NOT NULL DEFAULT 0, period_start date NOT NULL, period_end date NOT NULL, calculated_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.stage_conversion_metrics. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `from_stage` | `text` | não |  |  | Coluna from_stage da tabela public.stage_conversion_metrics. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `to_stage` | `text` | não |  |  | Coluna to_stage da tabela public.stage_conversion_metrics. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.stage_conversion_metrics. Tipo PostgreSQL: uuid. Aceita NULL. |
| 5 | `entered_count` | `integer` | não | `0` |  | Coluna entered_count da tabela public.stage_conversion_metrics. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `converted_count` | `integer` | não | `0` |  | Coluna converted_count da tabela public.stage_conversion_metrics. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `lost_count` | `integer` | não | `0` |  | Coluna lost_count da tabela public.stage_conversion_metrics. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `conversion_rate` | `numeric(5,2)` | não | `0` |  | Coluna conversion_rate da tabela public.stage_conversion_metrics. Tipo PostgreSQL: numeric(5,2). Não aceita NULL. Valor padrão: 0. |
| 9 | `avg_transition_days` | `numeric(8,2)` | não | `0` |  | Coluna avg_transition_days da tabela public.stage_conversion_metrics. Tipo PostgreSQL: numeric(8,2). Não aceita NULL. Valor padrão: 0. |
| 10 | `period_start` | `date` | não |  |  | Coluna period_start da tabela public.stage_conversion_metrics. Tipo PostgreSQL: date. Não aceita NULL. |
| 11 | `period_end` | `date` | não |  |  | Coluna period_end da tabela public.stage_conversion_metrics. Tipo PostgreSQL: date. Não aceita NULL. |
| 12 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.stage_conversion_metrics. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.stage_conversion_metrics. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.stage_conversion_metrics. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| stage_conversion_metrics_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_stage_conversion_from | btree | from_stage | não | sim |  | `CREATE INDEX idx_stage_conversion_from ON public.stage_conversion_metrics USING btree (from_stage)` |
| idx_stage_conversion_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_stage_conversion_owner ON public.stage_conversion_metrics USING btree (owner_id)` |
| stage_conversion_metrics_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX stage_conversion_metrics_pkey ON public.stage_conversion_metrics USING btree (id)` |
| stage_conversion_metrics_unique | btree | from_stage, to_stage, period_start | sim | sim |  | `CREATE UNIQUE INDEX stage_conversion_metrics_unique ON public.stage_conversion_metrics USING btree (from_stage, to_stage, COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid), period_start)` |


## Policies (RLS)

### `Service role manages conversion metrics insert`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Service role manages conversion metrics update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Users view own and global conversion metrics`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id IS NULL) OR (owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_stage_conversion_metrics_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
