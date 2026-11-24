# public.lead_score_explanations

> Tabela public.lead_score_explanations. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, score integer NOT NULL, baseline_score numeric NOT NULL DEFAULT 0, top_drivers jsonb NOT NULL DEFAULT '[]'::jsonb, recommendations jsonb NOT NULL DEFAULT '[]'::jsonb, narrative text NULLABLE, model_version text NOT NULL DEFAULT 'v1'::text, calculated_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.lead_score_explanations. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.lead_score_explanations. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `score` | `integer` | não |  |  | Coluna score da tabela public.lead_score_explanations. Tipo PostgreSQL: integer. Não aceita NULL. |
| 4 | `baseline_score` | `numeric` | não | `0` |  | Coluna baseline_score da tabela public.lead_score_explanations. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 5 | `top_drivers` | `jsonb` | não | `'[]'::jsonb` |  | Coluna top_drivers da tabela public.lead_score_explanations. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 6 | `recommendations` | `jsonb` | não | `'[]'::jsonb` |  | Coluna recommendations da tabela public.lead_score_explanations. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 7 | `narrative` | `text` | sim |  |  | Coluna narrative da tabela public.lead_score_explanations. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `model_version` | `text` | não | `'v1'::text` |  | Coluna model_version da tabela public.lead_score_explanations. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'v1'::text. |
| 9 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.lead_score_explanations. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.lead_score_explanations. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.lead_score_explanations. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_score_explanations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| lead_score_explanations_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| lead_score_explanations_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_lead_score_explanations_calculated | btree | calculated_at | não | sim |  | `CREATE INDEX idx_lead_score_explanations_calculated ON public.lead_score_explanations USING btree (calculated_at DESC)` |
| idx_lead_score_explanations_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_lead_score_explanations_sale ON public.lead_score_explanations USING btree (sale_id)` |
| lead_score_explanations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_score_explanations_pkey ON public.lead_score_explanations USING btree (id)` |
| lead_score_explanations_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX lead_score_explanations_sale_id_key ON public.lead_score_explanations USING btree (sale_id)` |


## Policies (RLS)

### `Admins manage explanations`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Salespeople view own deal explanations`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = lead_score_explanations.sale_id) AND (sp.auth_user_id = auth.uid())))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Service role manages explanations`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'service_role'::text)` |
| WITH CHECK | `(auth.role() = 'service_role'::text)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_lead_score_explanations_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
