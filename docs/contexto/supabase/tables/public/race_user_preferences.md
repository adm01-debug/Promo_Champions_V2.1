# public.race_user_preferences

> Tabela public.race_user_preferences. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, view_mode text NOT NULL DEFAULT 'focus'::text, calm_mode boolean NOT NULL DEFAULT false, audio_muted boolean NOT NULL DEFAULT true, tour_completed boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.race_user_preferences. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.race_user_preferences. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `view_mode` | `text` | não | `'focus'::text` |  | Coluna view_mode da tabela public.race_user_preferences. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'focus'::text. Validação CHECK: CHECK (view_mode = ANY (ARRAY['focus'::text, 'immersive'::text, 'competitive'::text, 'analysis'::text])). |
| 4 | `calm_mode` | `boolean` | não | `false` |  | Coluna calm_mode da tabela public.race_user_preferences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 5 | `audio_muted` | `boolean` | não | `true` |  | Coluna audio_muted da tabela public.race_user_preferences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 6 | `tour_completed` | `boolean` | não | `false` |  | Coluna tour_completed da tabela public.race_user_preferences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.race_user_preferences. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.race_user_preferences. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
