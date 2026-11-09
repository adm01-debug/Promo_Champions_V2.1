# public.call_sentiment_timeline

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
| usada por views | public.call_sentiment_summary |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `recording_id` | `uuid` | não |  |  |  |
| 3 | `segment_index` | `integer` | não |  |  |  |
| 4 | `start_sec` | `integer` | não | `0` |  |  |
| 5 | `end_sec` | `integer` | não | `0` |  |  |
| 6 | `speaker` | `text` | não | `'unknown'::text` |  |  |
| 7 | `sentiment` | `text` | não | `'neutral'::text` |  |  |
| 8 | `score` | `numeric` | não | `0` |  |  |
| 9 | `confidence` | `numeric` | não | `0.5` |  |  |
| 10 | `excerpt` | `text` | sim |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_sentiment_timeline_confidence_check | CHECK | `CHECK (confidence >= 0::numeric AND confidence <= 1::numeric)` |  |  | sim |
| call_sentiment_timeline_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_sentiment_timeline_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_sentiment_timeline_score_check | CHECK | `CHECK (score >= '-1'::integer::numeric AND score <= 1::numeric)` |  |  | sim |
| call_sentiment_timeline_sentiment_check | CHECK | `CHECK (sentiment = ANY (ARRAY['very_negative'::text, 'negative'::text, 'neutral'::text, 'positive'::text, 'very_positive'::text]))` |  |  | sim |
| call_sentiment_timeline_speaker_check | CHECK | `CHECK (speaker = ANY (ARRAY['salesperson'::text, 'client'::text, 'unknown'::text, 'mixed'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_sentiment_timeline_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_sentiment_timeline_pkey ON public.call_sentiment_timeline USING btree (id)` |
| idx_sentiment_timeline_recording | btree | recording_id, start_sec | não | sim |  | `CREATE INDEX idx_sentiment_timeline_recording ON public.call_sentiment_timeline USING btree (recording_id, start_sec)` |


## Policies (RLS)

### `Service role manages sentiment timeline`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'service_role'::text)` |
| WITH CHECK | `(auth.role() = 'service_role'::text)` |

### `View sentiment of own/managed recordings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM call_recordings cr   WHERE ((cr.id = call_sentiment_timeline.recording_id) AND ((cr.salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
