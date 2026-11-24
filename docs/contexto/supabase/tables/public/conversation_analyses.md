# public.conversation_analyses

> Tabela public.conversation_analyses. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NULLABLE, client_id uuid NULLABLE, source text NOT NULL, transcript text NOT NULL, summary text NULLABLE, sentiment text NOT NULL DEFAULT 'neutral'::text, objections jsonb NOT NULL DEFAULT '[]'::jsonb, next_steps jsonb NOT NULL DEFAULT '[]'::jsonb, buying_signals text[] NOT NULL DEFAULT '{}'::text[], risk_signals text[] NOT NULL DEFAULT '{}'::text[], decision_makers text[] NOT NULL DEFAULT '{}'::text[], ai_model text NULLABLE, analyzed_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| usada por views | public.conversation_insights_summary |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.conversation_analyses. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.conversation_analyses. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 3 | `client_id` | `uuid` | sim |  |  | Coluna client_id da tabela public.conversation_analyses. Tipo PostgreSQL: uuid. Aceita NULL. |
| 4 | `source` | `text` | não |  |  | Coluna source da tabela public.conversation_analyses. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (source = ANY (ARRAY['call'::text, 'email'::text, 'meeting'::text, 'whatsapp'::text])). |
| 5 | `transcript` | `text` | não |  |  | Coluna transcript da tabela public.conversation_analyses. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `summary` | `text` | sim |  |  | Coluna summary da tabela public.conversation_analyses. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `sentiment` | `text` | não | `'neutral'::text` |  | Coluna sentiment da tabela public.conversation_analyses. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'neutral'::text. Validação CHECK: CHECK (sentiment = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text, 'mixed'::text])). |
| 8 | `objections` | `jsonb` | não | `'[]'::jsonb` |  | Coluna objections da tabela public.conversation_analyses. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 9 | `next_steps` | `jsonb` | não | `'[]'::jsonb` |  | Coluna next_steps da tabela public.conversation_analyses. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 10 | `buying_signals` | `text[]` | não | `'{}'::text[]` |  | Coluna buying_signals da tabela public.conversation_analyses. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: '{}'::text[]. |
| 11 | `risk_signals` | `text[]` | não | `'{}'::text[]` |  | Coluna risk_signals da tabela public.conversation_analyses. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: '{}'::text[]. |
| 12 | `decision_makers` | `text[]` | não | `'{}'::text[]` |  | Coluna decision_makers da tabela public.conversation_analyses. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: '{}'::text[]. |
| 13 | `ai_model` | `text` | sim |  |  | Coluna ai_model da tabela public.conversation_analyses. Tipo PostgreSQL: text. Aceita NULL. |
| 14 | `analyzed_by` | `uuid` | sim |  |  | Coluna analyzed_by da tabela public.conversation_analyses. Tipo PostgreSQL: uuid. Aceita NULL. |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.conversation_analyses. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| conversation_analyses_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| conversation_analyses_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| conversation_analyses_sentiment_check | CHECK | `CHECK (sentiment = ANY (ARRAY['positive'::text, 'neutral'::text, 'negative'::text, 'mixed'::text]))` |  |  | sim |
| conversation_analyses_source_check | CHECK | `CHECK (source = ANY (ARRAY['call'::text, 'email'::text, 'meeting'::text, 'whatsapp'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| conversation_analyses_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX conversation_analyses_pkey ON public.conversation_analyses USING btree (id)` |
| idx_conv_analyses_created | btree | created_at | não | sim |  | `CREATE INDEX idx_conv_analyses_created ON public.conversation_analyses USING btree (created_at DESC)` |
| idx_conv_analyses_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_conv_analyses_sale ON public.conversation_analyses USING btree (sale_id)` |
| idx_conv_analyses_sentiment | btree | sentiment | não | sim |  | `CREATE INDEX idx_conv_analyses_sentiment ON public.conversation_analyses USING btree (sentiment)` |
| idx_conversation_analyses_analyzed_by | btree | analyzed_by | não | sim |  | `CREATE INDEX idx_conversation_analyses_analyzed_by ON public.conversation_analyses USING btree (analyzed_by)` |
| idx_conversation_analyses_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_conversation_analyses_created_at ON public.conversation_analyses USING btree (created_at)` |


## Policies (RLS)

### `Authenticated can insert conversations`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `((auth.uid() IS NOT NULL) AND (analyzed_by = auth.uid()))` |

### `Owner or manager can delete`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (analyzed_by = auth.uid()))` |
| WITH CHECK |  |

### `Owner or manager can update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (analyzed_by = auth.uid()))` |
| WITH CHECK |  |

### `Salesperson sees own deal conversations`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (analyzed_by = auth.uid()) OR (EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = conversation_analyses.sale_id) AND (sp.auth_user_id = auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
