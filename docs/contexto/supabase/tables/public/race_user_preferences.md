# public.race_user_preferences

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
| 3 | `view_mode` | `text` | não | `'focus'::text` |  |  |
| 4 | `calm_mode` | `boolean` | não | `false` |  |  |
| 5 | `audio_muted` | `boolean` | não | `true` |  |  |
| 6 | `tour_completed` | `boolean` | não | `false` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| race_user_preferences_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| race_user_preferences_user_id_key | UNIQUE | `UNIQUE (user_id)` |  |  | sim |
| race_user_preferences_view_mode_check | CHECK | `CHECK (view_mode = ANY (ARRAY['focus'::text, 'immersive'::text, 'competitive'::text, 'analysis'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_race_user_preferences_user | btree | user_id | não | sim |  | `CREATE INDEX idx_race_user_preferences_user ON public.race_user_preferences USING btree (user_id)` |
| race_user_preferences_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX race_user_preferences_pkey ON public.race_user_preferences USING btree (id)` |
| race_user_preferences_user_id_key | btree | user_id | sim | sim |  | `CREATE UNIQUE INDEX race_user_preferences_user_id_key ON public.race_user_preferences USING btree (user_id)` |


## Policies (RLS)

### `Users delete own race preferences`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users insert own race preferences`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = user_id)` |

### `Users read own race preferences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |

### `Users update own race preferences`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_race_user_preferences_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
