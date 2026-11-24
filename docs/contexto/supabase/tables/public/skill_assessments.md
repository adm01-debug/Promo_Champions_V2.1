# public.skill_assessments

> Tabela public.skill_assessments. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, skill text NOT NULL, current_level text NOT NULL DEFAULT 'beginner'::text, score numeric NOT NULL DEFAULT 0, trend text NOT NULL DEFAULT 'stable'::text, gap_count_30d integer NOT NULL DEFAULT 0, gap_count_90d integer NOT NULL DEFAULT 0, last_assessed_at timestamp with time zone NOT NULL DEFAULT now(), factors jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.skill_assessments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.skill_assessments. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `skill` | `text` | não |  |  | Coluna skill da tabela public.skill_assessments. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (skill = ANY (ARRAY['discovery'::text, 'qualification'::text, 'objection_handling'::text, 'closing'::text, 'prospecting'::text, 'negotiation'::text])). |
| 4 | `current_level` | `text` | não | `'beginner'::text` |  | Coluna current_level da tabela public.skill_assessments. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'beginner'::text. Validação CHECK: CHECK (current_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text, 'expert'::text])). |
| 5 | `score` | `numeric` | não | `0` |  | Coluna score da tabela public.skill_assessments. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (score >= 0::numeric AND score <= 100::numeric). |
| 6 | `trend` | `text` | não | `'stable'::text` |  | Coluna trend da tabela public.skill_assessments. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'stable'::text. Validação CHECK: CHECK (trend = ANY (ARRAY['improving'::text, 'stable'::text, 'declining'::text])). |
| 7 | `gap_count_30d` | `integer` | não | `0` |  | Coluna gap_count_30d da tabela public.skill_assessments. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `gap_count_90d` | `integer` | não | `0` |  | Coluna gap_count_90d da tabela public.skill_assessments. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 9 | `last_assessed_at` | `timestamp with time zone` | não | `now()` |  | Coluna last_assessed_at da tabela public.skill_assessments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `factors` | `jsonb` | não | `'{}'::jsonb` |  | Coluna factors da tabela public.skill_assessments. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.skill_assessments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.skill_assessments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| skill_assessments_current_level_check | CHECK | `CHECK (current_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text, 'expert'::text]))` |  |  | sim |
| skill_assessments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| skill_assessments_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| skill_assessments_salesperson_id_skill_key | UNIQUE | `UNIQUE (salesperson_id, skill)` |  |  | sim |
| skill_assessments_score_check | CHECK | `CHECK (score >= 0::numeric AND score <= 100::numeric)` |  |  | sim |
| skill_assessments_skill_check | CHECK | `CHECK (skill = ANY (ARRAY['discovery'::text, 'qualification'::text, 'objection_handling'::text, 'closing'::text, 'prospecting'::text, 'negotiation'::text]))` |  |  | sim |
| skill_assessments_trend_check | CHECK | `CHECK (trend = ANY (ARRAY['improving'::text, 'stable'::text, 'declining'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_skill_assessments_assessed | btree | last_assessed_at | não | sim |  | `CREATE INDEX idx_skill_assessments_assessed ON public.skill_assessments USING btree (last_assessed_at DESC)` |
| idx_skill_assessments_score | btree | score | não | sim |  | `CREATE INDEX idx_skill_assessments_score ON public.skill_assessments USING btree (score)` |
| idx_skill_assessments_skill | btree | skill | não | sim |  | `CREATE INDEX idx_skill_assessments_skill ON public.skill_assessments USING btree (skill)` |
| idx_skill_assessments_sp | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_skill_assessments_sp ON public.skill_assessments USING btree (salesperson_id)` |
| skill_assessments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX skill_assessments_pkey ON public.skill_assessments USING btree (id)` |
| skill_assessments_salesperson_id_skill_key | btree | salesperson_id, skill | sim | sim |  | `CREATE UNIQUE INDEX skill_assessments_salesperson_id_skill_key ON public.skill_assessments USING btree (salesperson_id, skill)` |


## Policies (RLS)

### `Admin/manager delete skill_assessments`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Admin/manager insert skill_assessments`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Admin/manager update skill_assessments`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Authenticated read skill_assessments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_skill_assessments_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
