# public.forecast_snapshots

> Tabela public.forecast_snapshots. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), period_start date NOT NULL, period_end date NOT NULL, owner_id uuid NULLABLE, segment text NULLABLE, forecast_amount numeric NOT NULL DEFAULT 0, forecast_deals integer NOT NULL DEFAULT 0, weighted_amount numeric NOT NULL DEFAULT 0, commit_amount numeric NOT NULL DEFAULT 0, best_case_amount numeric NOT NULL DEFAULT 0, source text NOT NULL DEFAULT 'weighted'::text, snapshot_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.forecast_snapshots. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `period_start` | `date` | não |  |  | Coluna period_start da tabela public.forecast_snapshots. Tipo PostgreSQL: date. Não aceita NULL. |
| 3 | `period_end` | `date` | não |  |  | Coluna period_end da tabela public.forecast_snapshots. Tipo PostgreSQL: date. Não aceita NULL. |
| 4 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.forecast_snapshots. Tipo PostgreSQL: uuid. Aceita NULL. |
| 5 | `segment` | `text` | sim |  |  | Coluna segment da tabela public.forecast_snapshots. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `forecast_amount` | `numeric` | não | `0` |  | Coluna forecast_amount da tabela public.forecast_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `forecast_deals` | `integer` | não | `0` |  | Coluna forecast_deals da tabela public.forecast_snapshots. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `weighted_amount` | `numeric` | não | `0` |  | Coluna weighted_amount da tabela public.forecast_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `commit_amount` | `numeric` | não | `0` |  | Coluna commit_amount da tabela public.forecast_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 10 | `best_case_amount` | `numeric` | não | `0` |  | Coluna best_case_amount da tabela public.forecast_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 11 | `source` | `text` | não | `'weighted'::text` |  | Coluna source da tabela public.forecast_snapshots. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'weighted'::text. Validação CHECK: CHECK (source = ANY (ARRAY['manual'::text, 'weighted'::text, 'ai'::text])). |
| 12 | `snapshot_at` | `timestamp with time zone` | não | `now()` |  | Coluna snapshot_at da tabela public.forecast_snapshots. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.forecast_snapshots. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| forecast_snapshots_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| forecast_snapshots_source_check | CHECK | `CHECK (source = ANY (ARRAY['manual'::text, 'weighted'::text, 'ai'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.forecast_accuracy | forecast_accuracy_snapshot_id_fkey | snapshot_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| forecast_snapshots_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX forecast_snapshots_pkey ON public.forecast_snapshots USING btree (id)` |
| idx_forecast_snapshots_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_forecast_snapshots_owner ON public.forecast_snapshots USING btree (owner_id)` |
| idx_forecast_snapshots_period | btree | period_start, period_end | não | sim |  | `CREATE INDEX idx_forecast_snapshots_period ON public.forecast_snapshots USING btree (period_start, period_end)` |
| idx_forecast_snapshots_source | btree | source | não | sim |  | `CREATE INDEX idx_forecast_snapshots_source ON public.forecast_snapshots USING btree (source)` |


## Policies (RLS)

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |

### `fs_read_auth`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `fs_write_admin_manager`

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
