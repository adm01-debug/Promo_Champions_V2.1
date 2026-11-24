# public.call_sentiment_timeline

> Tabela public.call_sentiment_timeline. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, segment_index integer NOT NULL, start_sec integer NOT NULL DEFAULT 0, end_sec integer NOT NULL DEFAULT 0, speaker text NOT NULL DEFAULT 'unknown'::text, sentiment text NOT NULL DEFAULT 'neutral'::text, score numeric NOT NULL DEFAULT 0, confidence numeric NOT NULL DEFAULT 0.5, excerpt text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_sentiment_timeline. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_sentiment_timeline. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `segment_index` | `integer` | não |  |  | Coluna segment_index da tabela public.call_sentiment_timeline. Tipo PostgreSQL: integer. Não aceita NULL. |
| 4 | `start_sec` | `integer` | não | `0` |  | Coluna start_sec da tabela public.call_sentiment_timeline. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `end_sec` | `integer` | não | `0` |  | Coluna end_sec da tabela public.call_sentiment_timeline. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `speaker` | `text` | não | `'unknown'::text` |  | Coluna speaker da tabela public.call_sentiment_timeline. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'unknown'::text. Validação CHECK: CHECK (speaker = ANY (ARRAY['salesperson'::text, 'client'::text, 'unknown'::text, 'mixed'::text])). |
| 7 | `sentiment` | `text` | não | `'neutral'::text` |  | Coluna sentiment da tabela public.call_sentiment_timeline. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'neutral'::text. Validação CHECK: CHECK (sentiment = ANY (ARRAY['very_negative'::text, 'negative'::text, 'neutral'::text, 'positive'::text, 'very_positive'::text])). |
| 8 | `score` | `numeric` | não | `0` |  | Coluna score da tabela public.call_sentiment_timeline. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (score >= '-1'::integer::numeric AND score <= 1::numeric). |
| 9 | `confidence` | `numeric` | não | `0.5` |  | Coluna confidence da tabela public.call_sentiment_timeline. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0.5. Validação CHECK: CHECK (confidence >= 0::numeric AND confidence <= 1::numeric). |
| 10 | `excerpt` | `text` | sim |  |  | Coluna excerpt da tabela public.call_sentiment_timeline. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.call_sentiment_timeline. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
