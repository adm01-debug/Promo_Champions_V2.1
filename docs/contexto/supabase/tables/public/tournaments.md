# public.tournaments

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `status` | `text` | não | `'upcoming'::text` |  |  |
| 5 | `bracket_type` | `text` | não | `'single_elimination'::text` |  |  |
| 6 | `metric_type` | `text` | não | `'revenue'::text` |  |  |
| 7 | `round_duration_days` | `integer` | não | `7` |  |  |
| 8 | `current_round` | `integer` | não | `0` |  |  |
| 9 | `total_rounds` | `integer` | não | `3` |  |  |
| 10 | `xp_reward` | `integer` | não | `500` |  |  |
| 11 | `starts_at` | `timestamp with time zone` | não |  |  |  |
| 12 | `ends_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `created_by` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| tournaments_bracket_type_check | CHECK | `CHECK (bracket_type = ANY (ARRAY['single_elimination'::text, 'double_elimination'::text]))` |  |  | sim |
| tournaments_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| tournaments_metric_type_check | CHECK | `CHECK (metric_type = ANY (ARRAY['revenue'::text, 'deals'::text, 'activities'::text, 'conversion'::text]))` |  |  | sim |
| tournaments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| tournaments_status_check | CHECK | `CHECK (status = ANY (ARRAY['upcoming'::text, 'active'::text, 'completed'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.tournament_matches | tournament_matches_tournament_id_fkey | tournament_id | CASCADE |
| public.tournament_participants | tournament_participants_tournament_id_fkey | tournament_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_tournaments_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_tournaments_created_by ON public.tournaments USING btree (created_by)` |
| tournaments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX tournaments_pkey ON public.tournaments USING btree (id)` |


## Policies (RLS)

### `Admins can insert tournaments`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins can update tournaments`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Auth users can read tournaments`

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
