# public.coaching_sessions

> Tabela public.coaching_sessions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, coach_id uuid NOT NULL, scheduled_at timestamp with time zone NOT NULL, duration_min integer NOT NULL DEFAULT 30, status text NOT NULL DEFAULT 'scheduled'::text, focus_skills text[] NOT NULL DEFAULT '{}'::text[], agenda jsonb NOT NULL DEFAULT '{}'::jsonb, notes text NULLABLE, action_items jsonb NOT NULL DEFAULT '[]'::jsonb, outcome_rating integer NULLABLE, completed_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.coaching_sessions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.coaching_sessions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `coach_id` | `uuid` | não |  |  | Coluna coach_id da tabela public.coaching_sessions. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `scheduled_at` | `timestamp with time zone` | não |  |  | Coluna scheduled_at da tabela public.coaching_sessions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. |
| 5 | `duration_min` | `integer` | não | `30` |  | Coluna duration_min da tabela public.coaching_sessions. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 30. Validação CHECK: CHECK (duration_min > 0 AND duration_min <= 240). |
| 6 | `status` | `text` | não | `'scheduled'::text` |  | Coluna status da tabela public.coaching_sessions. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'scheduled'::text. Validação CHECK: CHECK (status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'canceled'::text])). |
| 7 | `focus_skills` | `text[]` | não | `'{}'::text[]` |  | Coluna focus_skills da tabela public.coaching_sessions. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: '{}'::text[]. |
| 8 | `agenda` | `jsonb` | não | `'{}'::jsonb` |  | Coluna agenda da tabela public.coaching_sessions. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 9 | `notes` | `text` | sim |  |  | Coluna notes da tabela public.coaching_sessions. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `action_items` | `jsonb` | não | `'[]'::jsonb` |  | Coluna action_items da tabela public.coaching_sessions. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 11 | `outcome_rating` | `integer` | sim |  |  | Coluna outcome_rating da tabela public.coaching_sessions. Tipo PostgreSQL: integer. Aceita NULL. Validação CHECK: CHECK (outcome_rating >= 1 AND outcome_rating <= 5). |
| 12 | `completed_at` | `timestamp with time zone` | sim |  |  | Coluna completed_at da tabela public.coaching_sessions. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.coaching_sessions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.coaching_sessions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
