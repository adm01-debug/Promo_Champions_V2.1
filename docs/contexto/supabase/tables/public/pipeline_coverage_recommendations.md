# public.pipeline_coverage_recommendations

> Tabela public.pipeline_coverage_recommendations. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), snapshot_id uuid NOT NULL, priority text NOT NULL DEFAULT 'medium'::text, title text NOT NULL, action text NOT NULL, expected_impact_amount numeric NOT NULL DEFAULT 0, ai_generated boolean NOT NULL DEFAULT true, acted_on boolean NOT NULL DEFAULT false, acted_on_at timestamp with time zone NULLABLE, acted_on_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: snapshot_id → public.pipeline_coverage_snapshots(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `snapshot_id` | `uuid` | não |  |  | Coluna snapshot_id da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.pipeline_coverage_snapshots(id). |
| 3 | `priority` | `text` | não | `'medium'::text` |  | Coluna priority da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'medium'::text. Validação CHECK: CHECK (priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text])). |
| 4 | `title` | `text` | não |  |  | Coluna title da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `action` | `text` | não |  |  | Coluna action da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `expected_impact_amount` | `numeric` | não | `0` |  | Coluna expected_impact_amount da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `ai_generated` | `boolean` | não | `true` |  | Coluna ai_generated da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 8 | `acted_on` | `boolean` | não | `false` |  | Coluna acted_on da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 9 | `acted_on_at` | `timestamp with time zone` | sim |  |  | Coluna acted_on_at da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `acted_on_by` | `uuid` | sim |  |  | Coluna acted_on_by da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: uuid. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.pipeline_coverage_recommendations. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| pipeline_coverage_recommendations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| pipeline_coverage_recommendations_priority_check | CHECK | `CHECK (priority = ANY (ARRAY['high'::text, 'medium'::text, 'low'::text]))` |  |  | sim |
| pipeline_coverage_recommendations_snapshot_id_fkey | FOREIGN KEY | `FOREIGN KEY (snapshot_id) REFERENCES pipeline_coverage_snapshots(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pcr_priority | btree | priority, acted_on | não | sim |  | `CREATE INDEX idx_pcr_priority ON public.pipeline_coverage_recommendations USING btree (priority, acted_on)` |
| idx_pcr_snapshot | btree | snapshot_id | não | sim |  | `CREATE INDEX idx_pcr_snapshot ON public.pipeline_coverage_recommendations USING btree (snapshot_id)` |
| pipeline_coverage_recommendations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX pipeline_coverage_recommendations_pkey ON public.pipeline_coverage_recommendations USING btree (id)` |


## Policies (RLS)

### `Admins can delete coverage recommendations`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admins/managers can insert coverage recommendations`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated users can view coverage recommendations`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Managers can update coverage recommendations`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
