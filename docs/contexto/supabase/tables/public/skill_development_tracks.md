# public.skill_development_tracks

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `skill` | `text` | não |  |  |  |
| 4 | `priority` | `integer` | não | `1` |  |  |
| 5 | `current_level` | `text` | não | `'beginner'::text` |  |  |
| 6 | `target_level` | `text` | não | `'intermediate'::text` |  |  |
| 7 | `milestones` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 8 | `estimated_weeks` | `integer` | não | `4` |  |  |
| 9 | `ai_plan` | `text` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| skill_development_tracks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| skill_development_tracks_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| skill_development_tracks_salesperson_id_skill_key | UNIQUE | `UNIQUE (salesperson_id, skill)` |  |  | sim |
| skill_development_tracks_skill_check | CHECK | `CHECK (skill = ANY (ARRAY['discovery'::text, 'qualification'::text, 'objection_handling'::text, 'closing'::text, 'prospecting'::text, 'negotiation'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_skill_tracks_created | btree | created_at | não | sim |  | `CREATE INDEX idx_skill_tracks_created ON public.skill_development_tracks USING btree (created_at DESC)` |
| idx_skill_tracks_priority | btree | priority | não | sim |  | `CREATE INDEX idx_skill_tracks_priority ON public.skill_development_tracks USING btree (priority)` |
| idx_skill_tracks_sp | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_skill_tracks_sp ON public.skill_development_tracks USING btree (salesperson_id)` |
| skill_development_tracks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX skill_development_tracks_pkey ON public.skill_development_tracks USING btree (id)` |
| skill_development_tracks_salesperson_id_skill_key | btree | salesperson_id, skill | sim | sim |  | `CREATE UNIQUE INDEX skill_development_tracks_salesperson_id_skill_key ON public.skill_development_tracks USING btree (salesperson_id, skill)` |


## Policies (RLS)

### `Admin/manager delete skill_tracks`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Admin/manager insert skill_tracks`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Admin/manager update skill_tracks`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Authenticated read skill_tracks`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_skill_tracks_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
