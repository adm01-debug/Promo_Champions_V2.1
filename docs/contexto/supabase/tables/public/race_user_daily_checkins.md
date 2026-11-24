# public.race_user_daily_checkins

> Tabela public.race_user_daily_checkins. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, season_id uuid NOT NULL, checkin_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date, streak_days integer NOT NULL DEFAULT 1, reward_granted boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: season_id → public.race_seasons(id); user_id → auth.users(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_user_daily_checkins. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.race_user_daily_checkins. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: auth.users(id). |
| 3 | `season_id` | `uuid` | não |  |  | Coluna season_id da tabela public.race_user_daily_checkins. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.race_seasons(id). |
| 4 | `checkin_date` | `date` | não | `((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date` |  | Coluna checkin_date da tabela public.race_user_daily_checkins. Tipo PostgreSQL: date. Não aceita NULL. Valor padrão: ((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date. |
| 5 | `streak_days` | `integer` | não | `1` |  | Coluna streak_days da tabela public.race_user_daily_checkins. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 6 | `reward_granted` | `boolean` | não | `false` |  | Coluna reward_granted da tabela public.race_user_daily_checkins. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.race_user_daily_checkins. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_user_daily_checkins_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_user_daily_checkins_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_user_daily_checkins_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_user_daily_checkins_user_id_season_id_checkin_date_key | UNIQUE | `UNIQUE (user_id, season_id, checkin_date)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_champ_race_user_daily_checkins_season_id | btree | season_id | não | sim |  | `CREATE INDEX idx_champ_race_user_daily_checkins_season_id ON public.race_user_daily_checkins USING btree (season_id)` |
| idx_race_user_daily_checkins_user | btree | user_id, season_id, checkin_date | não | sim |  | `CREATE INDEX idx_race_user_daily_checkins_user ON public.race_user_daily_checkins USING btree (user_id, season_id, checkin_date DESC)` |
| race_user_daily_checkins_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_user_daily_checkins_pkey ON public.race_user_daily_checkins USING btree (id)` |
| race_user_daily_checkins_user_id_season_id_checkin_date_key | btree | user_id, season_id, checkin_date | sim | sim |  | `CREATE UNIQUE INDEX race_user_daily_checkins_user_id_season_id_checkin_date_key ON public.race_user_daily_checkins USING btree (user_id, season_id, checkin_date)` |


## Policies (RLS)

### `race_user_daily_checkins_own_insert`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `race_user_daily_checkins_own_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
