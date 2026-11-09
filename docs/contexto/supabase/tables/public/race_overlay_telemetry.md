# public.race_overlay_telemetry

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `overlay_name` | `text` | não |  |  |  |
| 4 | `viewed_count` | `integer` | não | `1` |  |  |
| 5 | `last_viewed_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_overlay_telemetry_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_overlay_telemetry_user_id_overlay_name_key | UNIQUE | `UNIQUE (user_id, overlay_name)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_overlay_telemetry_overlay | btree | overlay_name, last_viewed_at | não | sim |  | `CREATE INDEX idx_race_overlay_telemetry_overlay ON public.race_overlay_telemetry USING btree (overlay_name, last_viewed_at DESC)` |
| idx_race_overlay_telemetry_user | btree | user_id | não | sim |  | `CREATE INDEX idx_race_overlay_telemetry_user ON public.race_overlay_telemetry USING btree (user_id)` |
| race_overlay_telemetry_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_overlay_telemetry_pkey ON public.race_overlay_telemetry USING btree (id)` |
| race_overlay_telemetry_user_id_overlay_name_key | btree | user_id, overlay_name | sim | sim |  | `CREATE UNIQUE INDEX race_overlay_telemetry_user_id_overlay_name_key ON public.race_overlay_telemetry USING btree (user_id, overlay_name)` |


## Policies (RLS)

### `Admins read all overlay telemetry`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Users insert their overlay telemetry`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users read their overlay telemetry`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users update their overlay telemetry`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK | `(auth.uid() = user_id)` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
