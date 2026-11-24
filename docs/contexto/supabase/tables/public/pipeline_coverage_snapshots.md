# public.pipeline_coverage_snapshots

> Tabela public.pipeline_coverage_snapshots. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), period_start date NOT NULL, period_end date NOT NULL, owner_id uuid NULLABLE, segment text NULLABLE, stage text NULLABLE, quota_amount numeric NOT NULL DEFAULT 0, pipeline_amount numeric NOT NULL DEFAULT 0, weighted_pipeline numeric NOT NULL DEFAULT 0, coverage_ratio numeric NOT NULL DEFAULT 0, target_ratio numeric NOT NULL DEFAULT 3.0, health text NOT NULL DEFAULT 'critical'::text, gap_to_target numeric NOT NULL DEFAULT 0, deals_count integer NOT NULL DEFAULT 0, calculated_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.v_pipeline_coverage_summary |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `period_start` | `date` | não |  |  | Coluna period_start da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: date. Não aceita NULL. |
| 3 | `period_end` | `date` | não |  |  | Coluna period_end da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: date. Não aceita NULL. |
| 4 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: uuid. Aceita NULL. |
| 5 | `segment` | `text` | sim |  |  | Coluna segment da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `stage` | `text` | sim |  |  | Coluna stage da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `quota_amount` | `numeric` | não | `0` |  | Coluna quota_amount da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `pipeline_amount` | `numeric` | não | `0` |  | Coluna pipeline_amount da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `weighted_pipeline` | `numeric` | não | `0` |  | Coluna weighted_pipeline da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 10 | `coverage_ratio` | `numeric` | não | `0` |  | Coluna coverage_ratio da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 11 | `target_ratio` | `numeric` | não | `3.0` |  | Coluna target_ratio da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 3.0. |
| 12 | `health` | `text` | não | `'critical'::text` |  | Coluna health da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'critical'::text. Validação CHECK: CHECK (health = ANY (ARRAY['critical'::text, 'weak'::text, 'healthy'::text, 'strong'::text])). |
| 13 | `gap_to_target` | `numeric` | não | `0` |  | Coluna gap_to_target da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 14 | `deals_count` | `integer` | não | `0` |  | Coluna deals_count da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 15 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 16 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.pipeline_coverage_snapshots. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| pipeline_coverage_snapshots_health_check | CHECK | `CHECK (health = ANY (ARRAY['critical'::text, 'weak'::text, 'healthy'::text, 'strong'::text]))` |  |  | sim |
| pipeline_coverage_snapshots_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.pipeline_coverage_recommendations | pipeline_coverage_recommendations_snapshot_id_fkey | snapshot_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pcs_calculated_at | btree | calculated_at | não | sim |  | `CREATE INDEX idx_pcs_calculated_at ON public.pipeline_coverage_snapshots USING btree (calculated_at DESC)` |
| idx_pcs_health | btree | health | não | sim |  | `CREATE INDEX idx_pcs_health ON public.pipeline_coverage_snapshots USING btree (health)` |
| idx_pcs_period_owner_stage | btree | period_start, owner_id, stage | não | sim |  | `CREATE INDEX idx_pcs_period_owner_stage ON public.pipeline_coverage_snapshots USING btree (period_start, owner_id, stage)` |
| pipeline_coverage_snapshots_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX pipeline_coverage_snapshots_pkey ON public.pipeline_coverage_snapshots USING btree (id)` |


## Policies (RLS)

### `Admins can delete coverage snapshots`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admins/managers can insert coverage snapshots`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Admins/managers can update coverage snapshots`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Authenticated users can view coverage snapshots`

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
