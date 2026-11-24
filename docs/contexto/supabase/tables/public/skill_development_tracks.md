# public.skill_development_tracks

> Tabela public.skill_development_tracks. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, skill text NOT NULL, priority integer NOT NULL DEFAULT 1, current_level text NOT NULL DEFAULT 'beginner'::text, target_level text NOT NULL DEFAULT 'intermediate'::text, milestones jsonb NOT NULL DEFAULT '[]'::jsonb, estimated_weeks integer NOT NULL DEFAULT 4, ai_plan text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.skill_development_tracks. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.skill_development_tracks. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `skill` | `text` | não |  |  | Coluna skill da tabela public.skill_development_tracks. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (skill = ANY (ARRAY['discovery'::text, 'qualification'::text, 'objection_handling'::text, 'closing'::text, 'prospecting'::text, 'negotiation'::text])). |
| 4 | `priority` | `integer` | não | `1` |  | Coluna priority da tabela public.skill_development_tracks. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 5 | `current_level` | `text` | não | `'beginner'::text` |  | Coluna current_level da tabela public.skill_development_tracks. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'beginner'::text. |
| 6 | `target_level` | `text` | não | `'intermediate'::text` |  | Coluna target_level da tabela public.skill_development_tracks. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'intermediate'::text. |
| 7 | `milestones` | `jsonb` | não | `'[]'::jsonb` |  | Coluna milestones da tabela public.skill_development_tracks. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 8 | `estimated_weeks` | `integer` | não | `4` |  | Coluna estimated_weeks da tabela public.skill_development_tracks. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 4. |
| 9 | `ai_plan` | `text` | sim |  |  | Coluna ai_plan da tabela public.skill_development_tracks. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.skill_development_tracks. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.skill_development_tracks. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| skill_development_tracks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| skill_development_tracks_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| skill_development_tracks_salesperson_id_skill_key | UNIQUE | `UNIQUE (salesperson_id, skill)` |  |  | sim |
| skill_development_tracks_skill_check | CHECK | `CHECK (skill = ANY (ARRAY['discovery'::text, 'qualification'::text, 'objection_handling'::text, 'closing'::text, 'prospecting'::text, 'negotiation'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_skill_tracks_created | btree | created_at | não | sim |  | `CREATE INDEX idx_skill_tracks_created ON public.skill_development_tracks USING btree (created_at DESC)` |
| idx_skill_tracks_priority | btree | priority | não | sim |  | `CREATE INDEX idx_skill_tracks_priority ON public.skill_development_tracks USING btree (priority)` |
| idx_skill_tracks_sp | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_skill_tracks_sp ON public.skill_development_tracks USING btree (salesperson_id)` |
| skill_development_tracks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX skill_development_tracks_pkey ON public.skill_development_tracks USING btree (id)` |
| skill_development_tracks_salesperson_id_skill_key | btree | salesperson_id, skill | sim | sim |  | `CREATE UNIQUE INDEX skill_development_tracks_salesperson_id_skill_key ON public.skill_development_tracks USING btree (salesperson_id, skill)` |


## Policies (RLS)

### `Admin/manager delete skill_tracks`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Admin/manager insert skill_tracks`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Admin/manager update skill_tracks`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Authenticated read skill_tracks`

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
| update_skill_tracks_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
