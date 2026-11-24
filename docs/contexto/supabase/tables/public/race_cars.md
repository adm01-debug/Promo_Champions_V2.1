# public.race_cars

> Tabela public.race_cars. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, car_number integer NOT NULL, primary_color text NOT NULL DEFAULT '#ef4444'::text, secondary_color text NOT NULL DEFAULT '#ffffff'::text, car_style text NOT NULL DEFAULT 'f1'::text, nickname text NULLABLE, total_races integer NOT NULL DEFAULT 0, total_wins integer NOT NULL DEFAULT 0, total_overtakes integer NOT NULL DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), victory_quote text NULLABLE, preset_id text NULLABLE. Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| usada por views | public.race_leaderboard_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_cars. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.race_cars. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `car_number` | `integer` | não |  |  | Coluna car_number da tabela public.race_cars. Tipo PostgreSQL: integer. Não aceita NULL. Validação CHECK: CHECK (car_number >= 1 AND car_number <= 99). |
| 4 | `primary_color` | `text` | não | `'#ef4444'::text` |  | Coluna primary_color da tabela public.race_cars. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: '#ef4444'::text. |
| 5 | `secondary_color` | `text` | não | `'#ffffff'::text` |  | Coluna secondary_color da tabela public.race_cars. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: '#ffffff'::text. |
| 6 | `car_style` | `text` | não | `'f1'::text` |  | Coluna car_style da tabela public.race_cars. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'f1'::text. Validação CHECK: CHECK (car_style = ANY (ARRAY['f1'::text, 'stock'::text, 'kart'::text])). |
| 7 | `nickname` | `text` | sim |  |  | Coluna nickname da tabela public.race_cars. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `total_races` | `integer` | não | `0` |  | Coluna total_races da tabela public.race_cars. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 9 | `total_wins` | `integer` | não | `0` |  | Coluna total_wins da tabela public.race_cars. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 10 | `total_overtakes` | `integer` | não | `0` |  | Coluna total_overtakes da tabela public.race_cars. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.race_cars. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.race_cars. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `victory_quote` | `text` | sim |  |  | Coluna victory_quote da tabela public.race_cars. Tipo PostgreSQL: text. Aceita NULL. |
| 14 | `preset_id` | `text` | sim |  |  | Coluna preset_id da tabela public.race_cars. Tipo PostgreSQL: text. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_cars_car_number_check | CHECK | `CHECK (car_number >= 1 AND car_number <= 99)` |  |  | sim |
| race_cars_car_style_check | CHECK | `CHECK (car_style = ANY (ARRAY['f1'::text, 'stock'::text, 'kart'::text]))` |  |  | sim |
| race_cars_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_cars_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| race_cars_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.race_rivalries_persistent | race_rivalries_persistent_car_id_fkey | car_id | CASCADE |
| public.race_rivalries_persistent | race_rivalries_persistent_rival_car_id_fkey | rival_car_id | CASCADE |
| public.race_team_members | race_team_members_car_id_fkey | car_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| race_cars_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_cars_pkey ON public.race_cars USING btree (id)` |
| race_cars_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX race_cars_salesperson_id_key ON public.race_cars USING btree (salesperson_id)` |


## Policies (RLS)

### `admin_manage_cars`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `insert_own_car`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |

### `update_own_car`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |

### `view_race_cars`

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
| trg_race_cars_guard_counters | BEFORE | INSERT OR UPDATE | ROW | enabled | public.race_cars_guard_counters |
| trg_race_cars_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
