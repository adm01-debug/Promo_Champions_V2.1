# public.salesperson_preferences

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `ai_assistant_name` | `text` | não | `'Coach IA'::text` |  |  |
| 4 | `ai_assistant_avatar` | `text` | sim |  |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `response_mode` | `text` | não | `'text'::text` |  | How the AI should respond: text only, audio only, or both |
| 8 | `voice_id` | `text` | sim | `'CwhRBWXzGAHq8TQ4Fs17'::text` |  | ElevenLabs voice ID for TTS |
| 9 | `voice_name` | `text` | sim | `'Roger'::text` |  | Human-readable name of the selected voice |
| 10 | `contact_rules` | `jsonb` | sim | `'{"quiet_hours": {"end": "08:00", "start": "20:00"}, "prioritize_human": true, "max_calls_per_day": 3}'::jsonb` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salesperson_preferences_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| salesperson_preferences_response_mode_check | CHECK | `CHECK (response_mode = ANY (ARRAY['text'::text, 'audio'::text, 'both'::text]))` |  |  | sim |
| salesperson_preferences_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| salesperson_preferences_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| salesperson_preferences_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_preferences_pkey ON public.salesperson_preferences USING btree (id)` |
| salesperson_preferences_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_preferences_salesperson_id_key ON public.salesperson_preferences USING btree (salesperson_id)` |


## Policies (RLS)

### `Users can insert own preferences`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can read own preferences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own preferences`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_salesperson_preferences_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_
