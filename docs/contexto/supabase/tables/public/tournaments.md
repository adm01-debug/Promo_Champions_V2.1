# public.tournaments

> Tabela public.tournaments. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, description text NULLABLE, status text NOT NULL DEFAULT 'upcoming'::text, bracket_type text NOT NULL DEFAULT 'single_elimination'::text, metric_type text NOT NULL DEFAULT 'revenue'::text, round_duration_days integer NOT NULL DEFAULT 7, current_round integer NOT NULL DEFAULT 0, total_rounds integer NOT NULL DEFAULT 3, xp_reward integer NOT NULL DEFAULT 500, starts_at timestamp with time zone NOT NULL, ends_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), created_by uuid NULLABLE. Relacionamentos FK: created_by → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.tournaments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.tournaments. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `description` | `text` | sim |  |  | Coluna description da tabela public.tournaments. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `status` | `text` | não | `'upcoming'::text` |  | Coluna status da tabela public.tournaments. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'upcoming'::text. Validação CHECK: CHECK (status = ANY (ARRAY['upcoming'::text, 'active'::text, 'completed'::text])). |
| 5 | `bracket_type` | `text` | não | `'single_elimination'::text` |  | Coluna bracket_type da tabela public.tournaments. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'single_elimination'::text. Validação CHECK: CHECK (bracket_type = ANY (ARRAY['single_elimination'::text, 'double_elimination'::text])). |
| 6 | `metric_type` | `text` | não | `'revenue'::text` |  | Coluna metric_type da tabela public.tournaments. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'revenue'::text. Validação CHECK: CHECK (metric_type = ANY (ARRAY['revenue'::text, 'deals'::text, 'activities'::text, 'conversion'::text])). |
| 7 | `round_duration_days` | `integer` | não | `7` |  | Coluna round_duration_days da tabela public.tournaments. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 7. |
| 8 | `current_round` | `integer` | não | `0` |  | Coluna current_round da tabela public.tournaments. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 9 | `total_rounds` | `integer` | não | `3` |  | Coluna total_rounds da tabela public.tournaments. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 3. |
| 10 | `xp_reward` | `integer` | não | `500` |  | Coluna xp_reward da tabela public.tournaments. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 500. |
| 11 | `starts_at` | `timestamp with time zone` | não |  |  | Coluna starts_at da tabela public.tournaments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. |
| 12 | `ends_at` | `timestamp with time zone` | sim |  |  | Coluna ends_at da tabela public.tournaments. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.tournaments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.tournaments. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
