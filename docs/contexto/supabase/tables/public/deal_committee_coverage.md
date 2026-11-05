# public.deal_committee_coverage

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `owner_id` | `uuid` | não |  |  |  |
| 4 | `coverage_score` | `integer` | não | `0` |  |  |
| 5 | `tier` | `text` | não | `'weak'::text` |  |  |
| 6 | `gaps` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 7 | `risks` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 8 | `stakeholder_count` | `integer` | não | `0` |  |  |
| 9 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_committee_coverage_coverage_score_check | CHECK | `CHECK (coverage_score >= 0 AND coverage_score <= 100)` |  |  | sim |
| deal_committee_coverage_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_committee_coverage_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_committee_coverage_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |
| deal_committee_coverage_tier_check | CHECK | `CHECK (tier = ANY (ARRAY['weak'::text, 'partial'::text, 'strong'::text, 'complete'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_committee_coverage_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_committee_coverage_pkey ON public.deal_committee_coverage USING btree (id)` |
| deal_committee_coverage_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX deal_committee_coverage_sale_id_key ON public.deal_committee_coverage USING btree (sale_id)` |
| idx_committee_coverage_owner_tier | btree | owner_id, tier | não | sim |  | `CREATE INDEX idx_committee_coverage_owner_tier ON public.deal_committee_coverage USING btree (owner_id, tier)` |


## Policies (RLS)

### `Owners view own coverage`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Service can upsert coverage`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_snapshot_committee_coverage | AFTER | INSERT OR UPDATE | ROW | enabled | public.snapshot_committee_coverage |
| update_committee_coverage_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
