# public.cadence_advanced_stats

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
| 2 | `cadence_id` | `uuid` | sim |  |  |  |
| 3 | `click_rate` | `numeric` | sim | `0` |  |  |
| 4 | `bookings_count` | `integer` | sim | `0` |  |  |
| 5 | `recorded_at` | `timestamp with time zone` | sim | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| cadence_advanced_stats_cadence_id_fkey | FOREIGN KEY | `FOREIGN KEY (cadence_id) REFERENCES cadences(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| cadence_advanced_stats_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| cadence_advanced_stats_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX cadence_advanced_stats_pkey ON public.cadence_advanced_stats USING btree (id)` |
| idx_cadence_advanced_stats_cadence_id | btree | cadence_id | não | sim |  | `CREATE INDEX idx_cadence_advanced_stats_cadence_id ON public.cadence_advanced_stats USING btree (cadence_id)` |


## Policies (RLS)

### `Leitura pública autenticada para stats`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
