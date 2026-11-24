# public.call_coaching_scorecards

> Tabela public.call_coaching_scorecards. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, salesperson_id uuid NULLABLE, overall_score numeric NOT NULL DEFAULT 0, talk_score numeric NOT NULL DEFAULT 0, question_score numeric NOT NULL DEFAULT 0, objection_score numeric NOT NULL DEFAULT 0, sentiment_score numeric NOT NULL DEFAULT 0, moments_score numeric NOT NULL DEFAULT 0, health text NOT NULL DEFAULT 'fair'::text, top_strengths jsonb NOT NULL DEFAULT '[]'::jsonb, top_gaps jsonb NOT NULL DEFAULT '[]'::jsonb, recommendations jsonb NOT NULL DEFAULT '[]'::jsonb, factors jsonb NOT NULL DEFAULT '{}'::jsonb, calculated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |
| usada por views | public.coaching_impact_metrics |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_coaching_scorecards. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_coaching_scorecards. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `salesperson_id` | `uuid` | sim |  |  | Coluna salesperson_id da tabela public.call_coaching_scorecards. Tipo PostgreSQL: uuid. Aceita NULL. |
| 4 | `overall_score` | `numeric` | não | `0` |  | Coluna overall_score da tabela public.call_coaching_scorecards. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 5 | `talk_score` | `numeric` | não | `0` |  | Coluna talk_score da tabela public.call_coaching_scorecards. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `question_score` | `numeric` | não | `0` |  | Coluna question_score da tabela public.call_coaching_scorecards. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `objection_score` | `numeric` | não | `0` |  | Coluna objection_score da tabela public.call_coaching_scorecards. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `sentiment_score` | `numeric` | não | `0` |  | Coluna sentiment_score da tabela public.call_coaching_scorecards. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `moments_score` | `numeric` | não | `0` |  | Coluna moments_score da tabela public.call_coaching_scorecards. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 10 | `health` | `text` | não | `'fair'::text` |  | Coluna health da tabela public.call_coaching_scorecards. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'fair'::text. Validação CHECK: CHECK (health = ANY (ARRAY['poor'::text, 'fair'::text, 'good'::text, 'excellent'::text])). |
| 11 | `top_strengths` | `jsonb` | não | `'[]'::jsonb` |  | Coluna top_strengths da tabela public.call_coaching_scorecards. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 12 | `top_gaps` | `jsonb` | não | `'[]'::jsonb` |  | Coluna top_gaps da tabela public.call_coaching_scorecards. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 13 | `recommendations` | `jsonb` | não | `'[]'::jsonb` |  | Coluna recommendations da tabela public.call_coaching_scorecards. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 14 | `factors` | `jsonb` | não | `'{}'::jsonb` |  | Coluna factors da tabela public.call_coaching_scorecards. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 15 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.call_coaching_scorecards. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_coaching_scorecards_health_check | CHECK | `CHECK (health = ANY (ARRAY['poor'::text, 'fair'::text, 'good'::text, 'excellent'::text]))` |  |  | sim |
| call_coaching_scorecards_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_coaching_scorecards_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_coaching_scorecards_recording_id_key | UNIQUE | `UNIQUE (recording_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_coaching_scorecards_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_coaching_scorecards_pkey ON public.call_coaching_scorecards USING btree (id)` |
| call_coaching_scorecards_recording_id_key | btree | recording_id | sim | sim |  | `CREATE UNIQUE INDEX call_coaching_scorecards_recording_id_key ON public.call_coaching_scorecards USING btree (recording_id)` |
| idx_ccs_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_ccs_recording ON public.call_coaching_scorecards USING btree (recording_id)` |
| idx_ccs_salesperson | btree | salesperson_id, calculated_at | não | sim |  | `CREATE INDEX idx_ccs_salesperson ON public.call_coaching_scorecards USING btree (salesperson_id, calculated_at DESC)` |


## Policies (RLS)

### `ccs_read_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `ccs_write_admin_manager`

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
