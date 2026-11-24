# public.forecast_confidence_scores

> Tabela public.forecast_confidence_scores. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NULLABLE, source text NOT NULL, period_count integer NOT NULL DEFAULT 0, avg_mape numeric NOT NULL DEFAULT 0, bias_trend text NOT NULL DEFAULT 'accurate'::text, confidence_score numeric NOT NULL DEFAULT 0, computed_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.forecast_confidence_scores. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.forecast_confidence_scores. Tipo PostgreSQL: uuid. Aceita NULL. |
| 3 | `source` | `text` | não |  |  | Coluna source da tabela public.forecast_confidence_scores. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `period_count` | `integer` | não | `0` |  | Coluna period_count da tabela public.forecast_confidence_scores. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `avg_mape` | `numeric` | não | `0` |  | Coluna avg_mape da tabela public.forecast_confidence_scores. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `bias_trend` | `text` | não | `'accurate'::text` |  | Coluna bias_trend da tabela public.forecast_confidence_scores. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'accurate'::text. |
| 7 | `confidence_score` | `numeric` | não | `0` |  | Coluna confidence_score da tabela public.forecast_confidence_scores. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `computed_at` | `timestamp with time zone` | não | `now()` |  | Coluna computed_at da tabela public.forecast_confidence_scores. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| forecast_confidence_scores_owner_id_source_key | UNIQUE | `UNIQUE (owner_id, source)` |  |  | sim |
| forecast_confidence_scores_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| forecast_confidence_scores_owner_id_source_key | btree | owner_id, source | sim | sim |  | `CREATE UNIQUE INDEX forecast_confidence_scores_owner_id_source_key ON public.forecast_confidence_scores USING btree (owner_id, source)` |
| forecast_confidence_scores_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX forecast_confidence_scores_pkey ON public.forecast_confidence_scores USING btree (id)` |
| idx_fcs_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_fcs_owner ON public.forecast_confidence_scores USING btree (owner_id)` |
| idx_fcs_source | btree | source | não | sim |  | `CREATE INDEX idx_fcs_source ON public.forecast_confidence_scores USING btree (source)` |


## Policies (RLS)

### `fcs_read_auth`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `fcs_write_admin_manager`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
