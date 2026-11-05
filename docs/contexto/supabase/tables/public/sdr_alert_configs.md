# public.sdr_alert_configs

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
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `metric_type` | `text` | não |  |  |  |
| 4 | `threshold_value` | `double precision` | não |  |  |  |
| 5 | `is_active` | `boolean` | sim | `true` |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sdr_alert_configs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sdr_alert_configs_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sdr_alert_configs_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_sdr_alert_configs_user_id ON public.sdr_alert_configs USING btree (user_id)` |
| sdr_alert_configs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sdr_alert_configs_pkey ON public.sdr_alert_configs USING btree (id)` |


## Policies (RLS)

### `Users can manage their own alert configs`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

_nenhum_
