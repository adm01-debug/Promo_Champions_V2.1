# public.race_seasons

> Tabela public.race_seasons. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, start_date date NOT NULL, end_date date NOT NULL, track_type text NOT NULL DEFAULT 'oval'::text, goal_amount numeric NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'upcoming'::text, winner_id uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), role_type text NOT NULL DEFAULT 'closer'::text. Relacionamentos FK: winner_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.race_leaderboard_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_seasons. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.race_seasons. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `start_date` | `date` | não |  |  | Coluna start_date da tabela public.race_seasons. Tipo PostgreSQL: date. Não aceita NULL. |
| 4 | `end_date` | `date` | não |  |  | Coluna end_date da tabela public.race_seasons. Tipo PostgreSQL: date. Não aceita NULL. |
| 5 | `track_type` | `text` | não | `'oval'::text` |  | Coluna track_type da tabela public.race_seasons. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'oval'::text. Validação CHECK: CHECK (track_type = ANY (ARRAY['oval'::text, 'circuit'::text, 'street'::text])). |
| 6 | `goal_amount` | `numeric` | não | `0` |  | Coluna goal_amount da tabela public.race_seasons. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `status` | `text` | não | `'upcoming'::text` |  | Coluna status da tabela public.race_seasons. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'upcoming'::text. Validação CHECK: CHECK (status = ANY (ARRAY['upcoming'::text, 'active'::text, 'finished'::text])). |
| 8 | `winner_id` | `uuid` | sim |  |  | Coluna winner_id da tabela public.race_seasons. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.race_seasons. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.race_seasons. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `role_type` | `text` | não | `'closer'::text` |  | Coluna role_type da tabela public.race_seasons. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'closer'::text. Validação CHECK: CHECK (role_type = ANY (ARRAY['closer'::text, 'sdr'::text])). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_seasons_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_seasons_role_type_check | CHECK | `CHECK (role_type = ANY (ARRAY['closer'::text, 'sdr'::text]))` |  |  | sim |
| race_seasons_status_check | CHECK | `CHECK (status = ANY (ARRAY['upcoming'::text, 'active'::text, 'finished'::text]))` |  |  | sim |
| race_seasons_track_type_check | CHECK | `CHECK (track_type = ANY (ARRAY['oval'::text, 'circuit'::text, 'street'::text]))` |  |  | sim |
| race_seasons_winner_id_fkey | FOREIGN KEY | `FOREIGN KEY (winner_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.race_badges | race_badges_season_id_fkey | season_id | SET NULL |
| public.race_daily_snapshots | race_daily_snapshots_season_id_fkey | season_id | CASCADE |
| public.race_events | race_events_season_id_fkey | season_id | CASCADE |
| public.race_powerups | race_powerups_season_id_fkey | season_id | CASCADE |
| public.race_rivalries_persistent | race_rivalries_persistent_season_id_fkey | season_id | CASCADE |
| public.race_scoring_rules | race_scoring_rules_season_id_fkey | season_id | CASCADE |
| public.race_teams | race_teams_season_id_fkey | season_id | CASCADE |
| public.race_user_daily_checkins | race_user_daily_checkins_season_id_fkey | season_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_seasons_role_status | btree | role_type, status | não | sim |  | `CREATE INDEX idx_race_seasons_role_status ON public.race_seasons USING btree (role_type, status)` |
| idx_race_seasons_status | btree | status | não | sim |  | `CREATE INDEX idx_race_seasons_status ON public.race_seasons USING btree (status)` |
| idx_race_seasons_winner_id | btree | winner_id | não | sim |  | `CREATE INDEX idx_race_seasons_winner_id ON public.race_seasons USING btree (winner_id)` |
| race_seasons_one_active_per_role | btree | role_type | sim | sim | `(status = 'active'::text)` | `CREATE UNIQUE INDEX race_seasons_one_active_per_role ON public.race_seasons USING btree (role_type) WHERE (status = 'active'::text)` |
| race_seasons_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_seasons_pkey ON public.race_seasons USING btree (id)` |


## Policies (RLS)

### `admin_manage_race_seasons`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `view_race_seasons`

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
| trg_race_seasons_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
