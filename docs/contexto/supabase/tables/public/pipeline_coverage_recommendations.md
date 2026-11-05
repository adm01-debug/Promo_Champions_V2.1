# public.pipeline_coverage_recommendations

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `snapshot_id` | `uuid` | não |  |  |  |
| 3 | `priority` | `text` | não | `'medium'::text` |  |  |
| 4 | `title` | `text` | não |  |  |  |
| 5 | `action` | `text` | não |  |  |  |
| 6 | `expected_impact_amount` | `numeric` | não | `0` |  |  |
| 7 | `ai_generated` | `boolean` | não | `true` |  |  |
| 8 | `acted_on` | `boolean` | não | `false` |  |  |
| 9 | `acted_on_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `acted_on_by` | `uuid` | sim |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| pipeline_coverage_recommendations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| pipeline_coverage_recommendations_priority_check | CHECK | `CHECK (priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text]))` |  |  | sim |
| pipeline_coverage_recommendations_snapshot_id_fkey | FOREIGN KEY | `FOREIGN KEY (snapshot_id) REFERENCES pipeline_coverage_snapshots(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pcr_priority | btree | priority, acted_on | não | sim |  | `CREATE INDEX idx_pcr_priority ON public.pipeline_coverage_recommendations USING btree (priority, acted_on)` |
| idx_pcr_snapshot | btree | snapshot_id | não | sim |  | `CREATE INDEX idx_pcr_snapshot ON public.pipeline_coverage_recommendations USING btree (snapshot_id)` |
| pipeline_coverage_recommendations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX pipeline_coverage_recommendations_pkey ON public.pipeline_coverage_recommendations USING btree (id)` |


## Policies (RLS)

### `Admins can delete coverage recommendations`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admins/managers can insert coverage recommendations`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated users can view coverage recommendations`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Managers can update coverage recommendations`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_
