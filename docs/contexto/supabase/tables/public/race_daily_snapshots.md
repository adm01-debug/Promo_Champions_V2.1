# public.race_daily_snapshots

> Tabela public.race_daily_snapshots. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), season_id uuid NOT NULL, salesperson_id uuid NOT NULL, snapshot_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date, rank integer NOT NULL, progress numeric NOT NULL DEFAULT 0, total_sales numeric NOT NULL DEFAULT 0, deals_count integer NOT NULL DEFAULT 0, score numeric NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: season_id → public.race_seasons(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_daily_snapshots. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `season_id` | `uuid` | não |  |  | Coluna season_id da tabela public.race_daily_snapshots. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.race_seasons(id). |
| 3 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.race_daily_snapshots. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `snapshot_date` | `date` | não | `((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date` |  | Coluna snapshot_date da tabela public.race_daily_snapshots. Tipo PostgreSQL: date. Não aceita NULL. Valor padrão: ((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date. |
| 5 | `rank` | `integer` | não |  |  | Coluna rank da tabela public.race_daily_snapshots. Tipo PostgreSQL: integer. Não aceita NULL. |
| 6 | `progress` | `numeric` | não | `0` |  | Coluna progress da tabela public.race_daily_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `total_sales` | `numeric` | não | `0` |  | Coluna total_sales da tabela public.race_daily_snapshots. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `deals_count` | `integer` | não | `0` |  | Coluna deals_count da tabela public.race_daily_snapshots. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 9 | `score` | `numeric` | sim |  |  | Coluna score da tabela public.race_daily_snapshots. Tipo PostgreSQL: numeric. Aceita NULL. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.race_daily_snapshots. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_daily_snapshots_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_daily_snapshots_season_id_fkey | FOREIGN KEY | `FOREIGN KEY (season_id) REFERENCES race_seasons(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_daily_snapshots_season_id_salesperson_id_snapshot_date_key | UNIQUE | `UNIQUE (season_id, salesperson_id, snapshot_date)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_daily_snapshots_lookup | btree | salesperson_id, season_id, snapshot_date | não | sim |  | `CREATE INDEX idx_race_daily_snapshots_lookup ON public.race_daily_snapshots USING btree (salesperson_id, season_id, snapshot_date DESC)` |
| idx_race_daily_snapshots_season_id | btree | season_id | não | sim |  | `CREATE INDEX idx_race_daily_snapshots_season_id ON public.race_daily_snapshots USING btree (season_id)` |
| race_daily_snapshots_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_daily_snapshots_pkey ON public.race_daily_snapshots USING btree (id)` |
| race_daily_snapshots_season_id_salesperson_id_snapshot_date_key | btree | season_id, salesperson_id, snapshot_date | sim | sim |  | `CREATE UNIQUE INDEX race_daily_snapshots_season_id_salesperson_id_snapshot_date_key ON public.race_daily_snapshots USING btree (season_id, salesperson_id, snapshot_date)` |


## Policies (RLS)

### `race_daily_snapshots_admin_manage`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `race_daily_snapshots_select_authenticated`

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
