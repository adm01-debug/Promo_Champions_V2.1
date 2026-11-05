# public.coaching_sessions

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
| usada por views | public.coaching_impact_metrics |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `coach_id` | `uuid` | não |  |  |  |
| 4 | `scheduled_at` | `timestamp with time zone` | não |  |  |  |
| 5 | `duration_min` | `integer` | não | `30` |  |  |
| 6 | `status` | `text` | não | `'scheduled'::text` |  |  |
| 7 | `focus_skills` | `text[]` | não | `'{}'::text[]` |  |  |
| 8 | `agenda` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 9 | `notes` | `text` | sim |  |  |  |
| 10 | `action_items` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 11 | `outcome_rating` | `integer` | sim |  |  |  |
| 12 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| coaching_sessions_duration_min_check | CHECK | `CHECK (duration_min > 0 AND duration_min <= 240)` |  |  | sim |
| coaching_sessions_outcome_rating_check | CHECK | `CHECK (outcome_rating >= 1 AND outcome_rating <= 5)` |  |  | sim |
| coaching_sessions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| coaching_sessions_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| coaching_sessions_status_check | CHECK | `CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'canceled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| coaching_sessions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX coaching_sessions_pkey ON public.coaching_sessions USING btree (id)` |
| idx_coaching_sessions_coach | btree | coach_id, scheduled_at | não | sim |  | `CREATE INDEX idx_coaching_sessions_coach ON public.coaching_sessions USING btree (coach_id, scheduled_at DESC)` |
| idx_coaching_sessions_completed_sp | btree | salesperson_id, completed_at | não | sim | `((status = 'completed'::text) AND (completed_at IS NOT NULL))` | `CREATE INDEX idx_coaching_sessions_completed_sp ON public.coaching_sessions USING btree (salesperson_id, completed_at) WHERE ((status = 'completed'::text) AND (completed_at IS NOT NULL))` |
| idx_coaching_sessions_salesperson | btree | salesperson_id, scheduled_at | não | sim |  | `CREATE INDEX idx_coaching_sessions_salesperson ON public.coaching_sessions USING btree (salesperson_id, scheduled_at DESC)` |
| idx_coaching_sessions_status | btree | status | não | sim | `(status = 'scheduled'::text)` | `CREATE INDEX idx_coaching_sessions_status ON public.coaching_sessions USING btree (status) WHERE (status = 'scheduled'::text)` |


## Policies (RLS)

### `Admins and managers manage all coaching sessions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Coaches manage their own sessions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(coach_id = auth.uid())` |
| WITH CHECK | `(coach_id = auth.uid())` |

### `Salespeople view their own sessions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_coaching_sessions_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
