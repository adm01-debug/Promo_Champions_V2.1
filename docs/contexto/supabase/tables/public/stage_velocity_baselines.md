# public.stage_velocity_baselines

> Tabela public.stage_velocity_baselines. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), stage text NOT NULL, owner_id uuid NULLABLE, avg_days numeric NOT NULL DEFAULT 0, median_days numeric NOT NULL DEFAULT 0, p75_days numeric NOT NULL DEFAULT 0, sample_size integer NOT NULL DEFAULT 0, calculated_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), segment text NOT NULL DEFAULT 'all'::text, p50_hours numeric NOT NULL DEFAULT 0, p75_hours numeric NOT NULL DEFAULT 0, p90_hours numeric NOT NULL DEFAULT 0, computed_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.stage_velocity_baselines. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `stage` | `text` | não |  |  | Coluna stage da tabela public.stage_velocity_baselines. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.stage_velocity_baselines. Tipo PostgreSQL: uuid. Aceita NULL. |
| 4 | `avg_days` | `numeric` | não | `0` |  | Coluna avg_days da tabela public.stage_velocity_baselines. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 5 | `median_days` | `numeric` | não | `0` |  | Coluna median_days da tabela public.stage_velocity_baselines. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `p75_days` | `numeric` | não | `0` |  | Coluna p75_days da tabela public.stage_velocity_baselines. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `sample_size` | `integer` | não | `0` |  | Coluna sample_size da tabela public.stage_velocity_baselines. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.stage_velocity_baselines. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.stage_velocity_baselines. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.stage_velocity_baselines. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `segment` | `text` | não | `'all'::text` |  | Coluna segment da tabela public.stage_velocity_baselines. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'all'::text. |
| 12 | `p50_hours` | `numeric` | não | `0` |  | Coluna p50_hours da tabela public.stage_velocity_baselines. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 13 | `p75_hours` | `numeric` | não | `0` |  | Coluna p75_hours da tabela public.stage_velocity_baselines. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 14 | `p90_hours` | `numeric` | não | `0` |  | Coluna p90_hours da tabela public.stage_velocity_baselines. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 15 | `computed_at` | `timestamp with time zone` | não | `now()` |  | Coluna computed_at da tabela public.stage_velocity_baselines. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| stage_velocity_baselines_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| stage_velocity_baselines_stage_segment_key | UNIQUE | `UNIQUE (stage, segment)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_svb_stage | btree | stage | não | sim |  | `CREATE INDEX idx_svb_stage ON public.stage_velocity_baselines USING btree (stage)` |
| stage_velocity_baselines_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX stage_velocity_baselines_pkey ON public.stage_velocity_baselines USING btree (id)` |
| stage_velocity_baselines_stage_segment_key | btree | stage, segment | sim | sim |  | `CREATE UNIQUE INDEX stage_velocity_baselines_stage_segment_key ON public.stage_velocity_baselines USING btree (stage, segment)` |
| uniq_svb_stage_owner | btree | stage | sim | sim |  | `CREATE UNIQUE INDEX uniq_svb_stage_owner ON public.stage_velocity_baselines USING btree (stage, COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid))` |


## Policies (RLS)

### `admin manager write baselines`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `auth read baselines`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `svb_admin_write`

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
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_svb_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
