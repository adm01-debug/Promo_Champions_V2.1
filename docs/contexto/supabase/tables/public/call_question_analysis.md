# public.call_question_analysis

> Tabela public.call_question_analysis. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, total_questions integer NOT NULL DEFAULT 0, open_questions integer NOT NULL DEFAULT 0, closed_questions integer NOT NULL DEFAULT 0, discovery_questions integer NOT NULL DEFAULT 0, impact_questions integer NOT NULL DEFAULT 0, leading_questions integer NOT NULL DEFAULT 0, avg_depth numeric NOT NULL DEFAULT 0, question_density numeric NOT NULL DEFAULT 0, quality_score numeric NOT NULL DEFAULT 0, health text NOT NULL DEFAULT 'fair'::text, factors jsonb NOT NULL DEFAULT '{}'::jsonb, calculated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_question_analysis. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_question_analysis. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `total_questions` | `integer` | não | `0` |  | Coluna total_questions da tabela public.call_question_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 4 | `open_questions` | `integer` | não | `0` |  | Coluna open_questions da tabela public.call_question_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `closed_questions` | `integer` | não | `0` |  | Coluna closed_questions da tabela public.call_question_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `discovery_questions` | `integer` | não | `0` |  | Coluna discovery_questions da tabela public.call_question_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `impact_questions` | `integer` | não | `0` |  | Coluna impact_questions da tabela public.call_question_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `leading_questions` | `integer` | não | `0` |  | Coluna leading_questions da tabela public.call_question_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 9 | `avg_depth` | `numeric` | não | `0` |  | Coluna avg_depth da tabela public.call_question_analysis. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 10 | `question_density` | `numeric` | não | `0` |  | Coluna question_density da tabela public.call_question_analysis. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 11 | `quality_score` | `numeric` | não | `0` |  | Coluna quality_score da tabela public.call_question_analysis. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 12 | `health` | `text` | não | `'fair'::text` |  | Coluna health da tabela public.call_question_analysis. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'fair'::text. Validação CHECK: CHECK (health = ANY (ARRAY['poor'::text, 'fair'::text, 'good'::text, 'excellent'::text])). |
| 13 | `factors` | `jsonb` | não | `'{}'::jsonb` |  | Coluna factors da tabela public.call_question_analysis. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 14 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.call_question_analysis. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_question_analysis_health_check | CHECK | `CHECK (health = ANY (ARRAY['poor'::text, 'fair'::text, 'good'::text, 'excellent'::text]))` |  |  | sim |
| call_question_analysis_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_question_analysis_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_question_analysis_recording_id_key | UNIQUE | `UNIQUE (recording_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_question_analysis_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_question_analysis_pkey ON public.call_question_analysis USING btree (id)` |
| call_question_analysis_recording_id_key | btree | recording_id | sim | sim |  | `CREATE UNIQUE INDEX call_question_analysis_recording_id_key ON public.call_question_analysis USING btree (recording_id)` |
| idx_call_question_analysis_health | btree | health, calculated_at | não | sim |  | `CREATE INDEX idx_call_question_analysis_health ON public.call_question_analysis USING btree (health, calculated_at DESC)` |
| idx_call_question_analysis_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_call_question_analysis_recording ON public.call_question_analysis USING btree (recording_id)` |


## Policies (RLS)

### `auth read question analysis`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `managers write question analysis`

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
