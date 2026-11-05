# public.pipeline_coverage_snapshots

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `period_start` | `date` | não |  |  |  |
| 3 | `period_end` | `date` | não |  |  |  |
| 4 | `owner_id` | `uuid` | sim |  |  |  |
| 5 | `segment` | `text` | sim |  |  |  |
| 6 | `stage` | `text` | sim |  |  |  |
| 7 | `quota_amount` | `numeric` | não | `0` |  |  |
| 8 | `pipeline_amount` | `numeric` | não | `0` |  |  |
| 9 | `weighted_pipeline` | `numeric` | não | `0` |  |  |
| 10 | `coverage_ratio` | `numeric` | não | `0` |  |  |
| 11 | `target_ratio` | `numeric` | não | `3.0` |  |  |
| 12 | `health` | `text` | não | `'critical'::text` |  |  |
| 13 | `gap_to_target` | `numeric` | não | `0` |  |  |
| 14 | `deals_count` | `integer` | não | `0` |  |  |
| 15 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_
