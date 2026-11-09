# public.send_time_profiles

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `best_hour` | `integer` | não | `10` |  |  |
| 4 | `best_dow` | `integer` | não | `2` |  |  |
| 5 | `confidence` | `numeric` | não | `0` |  |  |
| 6 | `sample_size` | `integer` | não | `0` |  |  |
| 7 | `tz` | `text` | não | `'America/Sao_Paulo'::text` |  |  |
| 8 | `hour_distribution` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 9 | `dow_distribution` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 10 | `last_calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| send_time_profiles_best_dow_check | CHECK | `CHECK (best_dow >= 0 AND best_dow <= 6)` |  |  | sim |
| send_time_profiles_best_hour_check | CHECK | `CHECK (best_hour >= 0 AND best_hour <= 23)` |  |  | sim |
| send_time_profiles_confidence_check | CHECK | `CHECK (confidence >= 0::numeric AND confidence <= 1::numeric)` |  |  | sim |
| send_time_profiles_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| send_time_profiles_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| send_time_profiles_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| send_time_profiles_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX send_time_profiles_pkey ON public.send_time_profiles USING btree (id)` |
| send_time_profiles_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX send_time_profiles_sale_id_key ON public.send_time_profiles USING btree (sale_id)` |


## Policies (RLS)

### `owners and managers read send_time_profiles`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = send_time_profiles.sale_id) AND (sp.auth_user_id = auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
