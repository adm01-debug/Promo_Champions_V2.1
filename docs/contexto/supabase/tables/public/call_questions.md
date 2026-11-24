# public.call_questions

> Tabela public.call_questions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, turn_index integer NOT NULL DEFAULT 0, text text NOT NULL, category text NOT NULL DEFAULT 'other'::text, depth integer NOT NULL DEFAULT 1, start_estimate numeric NOT NULL DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_questions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_questions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `turn_index` | `integer` | não | `0` |  | Coluna turn_index da tabela public.call_questions. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 4 | `text` | `text` | não |  |  | Coluna text da tabela public.call_questions. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `category` | `text` | não | `'other'::text` |  | Coluna category da tabela public.call_questions. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'other'::text. Validação CHECK: CHECK (category = ANY (ARRAY['open'::text, 'closed'::text, 'discovery'::text, 'impact'::text, 'leading'::text, 'other'::text])). |
| 6 | `depth` | `integer` | não | `1` |  | Coluna depth da tabela public.call_questions. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 7 | `start_estimate` | `numeric` | não | `0` |  | Coluna start_estimate da tabela public.call_questions. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.call_questions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_questions_category_check | CHECK | `CHECK (category = ANY (ARRAY['open'::text, 'closed'::text, 'discovery'::text, 'impact'::text, 'leading'::text, 'other'::text]))` |  |  | sim |
| call_questions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_questions_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_questions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_questions_pkey ON public.call_questions USING btree (id)` |
| idx_call_questions_category | btree | category | não | sim |  | `CREATE INDEX idx_call_questions_category ON public.call_questions USING btree (category)` |
| idx_call_questions_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_call_questions_recording ON public.call_questions USING btree (recording_id)` |


## Policies (RLS)

### `auth read questions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `managers write questions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
