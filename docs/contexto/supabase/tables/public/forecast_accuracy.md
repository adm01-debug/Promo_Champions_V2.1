# public.forecast_accuracy

> Tabela public.forecast_accuracy. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), snapshot_id uuid NOT NULL, actual_amount numeric NOT NULL DEFAULT 0, actual_deals integer NOT NULL DEFAULT 0, variance_amount numeric NULLABLE DEFAULT (actual_amount - (0)::numeric), variance_pct numeric NOT NULL DEFAULT 0, mape numeric NOT NULL DEFAULT 0, bias text NOT NULL DEFAULT 'accurate'::text, computed_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: snapshot_id → public.forecast_snapshots(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.forecast_accuracy. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `snapshot_id` | `uuid` | não |  |  | Coluna snapshot_id da tabela public.forecast_accuracy. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.forecast_snapshots(id). |
| 3 | `actual_amount` | `numeric` | não | `0` |  | Coluna actual_amount da tabela public.forecast_accuracy. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 4 | `actual_deals` | `integer` | não | `0` |  | Coluna actual_deals da tabela public.forecast_accuracy. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `variance_amount` | `numeric` | sim | `(actual_amount - (0)::numeric)` | s | Coluna variance_amount da tabela public.forecast_accuracy. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão: (actual_amount - (0)::numeric). |
| 6 | `variance_pct` | `numeric` | não | `0` |  | Coluna variance_pct da tabela public.forecast_accuracy. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `mape` | `numeric` | não | `0` |  | Coluna mape da tabela public.forecast_accuracy. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `bias` | `text` | não | `'accurate'::text` |  | Coluna bias da tabela public.forecast_accuracy. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'accurate'::text. Validação CHECK: CHECK (bias = ANY (ARRAY['optimistic'::text, 'pessimistic'::text, 'accurate'::text])). |
| 9 | `computed_at` | `timestamp with time zone` | não | `now()` |  | Coluna computed_at da tabela public.forecast_accuracy. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| forecast_accuracy_bias_check | CHECK | `CHECK (bias = ANY (ARRAY['optimistic'::text, 'pessimistic'::text, 'accurate'::text]))` |  |  | sim |
| forecast_accuracy_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| forecast_accuracy_snapshot_id_fkey | FOREIGN KEY | `FOREIGN KEY (snapshot_id) REFERENCES forecast_snapshots(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| forecast_accuracy_snapshot_id_key | UNIQUE | `UNIQUE (snapshot_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| forecast_accuracy_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX forecast_accuracy_pkey ON public.forecast_accuracy USING btree (id)` |
| forecast_accuracy_snapshot_id_key | btree | snapshot_id | sim | sim |  | `CREATE UNIQUE INDEX forecast_accuracy_snapshot_id_key ON public.forecast_accuracy USING btree (snapshot_id)` |
| idx_forecast_accuracy_bias | btree | bias | não | sim |  | `CREATE INDEX idx_forecast_accuracy_bias ON public.forecast_accuracy USING btree (bias)` |


## Policies (RLS)

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |

### `fa_read_auth`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `fa_write_admin_manager`

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
