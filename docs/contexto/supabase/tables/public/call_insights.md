# public.call_insights

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `recording_id` | `uuid` | não |  |  |  |
| 3 | `sentiment_score` | `numeric(4,3)` | sim |  |  |  |
| 4 | `sentiment_label` | `text` | sim |  |  |  |
| 5 | `talk_ratio_salesperson` | `numeric(5,2)` | sim |  |  |  |
| 6 | `talk_ratio_client` | `numeric(5,2)` | sim |  |  |  |
| 7 | `topics` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 8 | `objections` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 9 | `next_steps` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 10 | `key_moments` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 11 | `coaching_tips` | `jsonb` | sim | `'[]'::jsonb` |  |  |
| 12 | `summary` | `text` | sim |  |  |  |
| 13 | `questions_asked` | `integer` | sim | `0` |  |  |
| 14 | `ai_model` | `text` | sim | `'google/gemini-2.5-flash'::text` |  |  |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_insights_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_insights_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_insights_sentiment_label_check | CHECK | `CHECK (sentiment_label = ANY (ARRAY['very_negative'::text, 'negative'::text, 'neutral'::text, 'positive'::text, 'very_positive'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_insights_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_insights_pkey ON public.call_insights USING btree (id)` |
| idx_call_insights_recording | btree | recording_id | sim | sim |  | `CREATE UNIQUE INDEX idx_call_insights_recording ON public.call_insights USING btree (recording_id)` |


## Policies (RLS)

### `System inserts insights`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM call_recordings r   WHERE ((r.id = call_insights.recording_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |

### `View insights via recording access`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM call_recordings r   WHERE ((r.id = call_insights.recording_id) AND ((r.salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
