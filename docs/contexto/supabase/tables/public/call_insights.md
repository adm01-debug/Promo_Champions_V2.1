# public.call_insights

> Tabela public.call_insights. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, sentiment_score numeric(4,3) NULLABLE, sentiment_label text NULLABLE, talk_ratio_salesperson numeric(5,2) NULLABLE, talk_ratio_client numeric(5,2) NULLABLE, topics jsonb NULLABLE DEFAULT '[]'::jsonb, objections jsonb NULLABLE DEFAULT '[]'::jsonb, next_steps jsonb NULLABLE DEFAULT '[]'::jsonb, key_moments jsonb NULLABLE DEFAULT '[]'::jsonb, coaching_tips jsonb NULLABLE DEFAULT '[]'::jsonb, summary text NULLABLE, questions_asked integer NULLABLE DEFAULT 0, ai_model text NULLABLE DEFAULT 'google/gemini-2.5-flash'::text, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_insights. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_insights. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `sentiment_score` | `numeric(4,3)` | sim |  |  | Coluna sentiment_score da tabela public.call_insights. Tipo PostgreSQL: numeric(4,3). Aceita NULL. |
| 4 | `sentiment_label` | `text` | sim |  |  | Coluna sentiment_label da tabela public.call_insights. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (sentiment_label = ANY (ARRAY['very_negative'::text, 'negative'::text, 'neutral'::text, 'positive'::text, 'very_positive'::text])). |
| 5 | `talk_ratio_salesperson` | `numeric(5,2)` | sim |  |  | Coluna talk_ratio_salesperson da tabela public.call_insights. Tipo PostgreSQL: numeric(5,2). Aceita NULL. |
| 6 | `talk_ratio_client` | `numeric(5,2)` | sim |  |  | Coluna talk_ratio_client da tabela public.call_insights. Tipo PostgreSQL: numeric(5,2). Aceita NULL. |
| 7 | `topics` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna topics da tabela public.call_insights. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 8 | `objections` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna objections da tabela public.call_insights. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 9 | `next_steps` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna next_steps da tabela public.call_insights. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 10 | `key_moments` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna key_moments da tabela public.call_insights. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 11 | `coaching_tips` | `jsonb` | sim | `'[]'::jsonb` |  | Coluna coaching_tips da tabela public.call_insights. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '[]'::jsonb. |
| 12 | `summary` | `text` | sim |  |  | Coluna summary da tabela public.call_insights. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `questions_asked` | `integer` | sim | `0` |  | Coluna questions_asked da tabela public.call_insights. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 14 | `ai_model` | `text` | sim | `'google/gemini-2.5-flash'::text` |  | Coluna ai_model da tabela public.call_insights. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'google/gemini-2.5-flash'::text. |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.call_insights. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
