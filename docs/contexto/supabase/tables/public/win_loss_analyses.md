# public.win_loss_analyses

> Tabela public.win_loss_analyses. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, outcome text NOT NULL, primary_reason text NULLABLE, secondary_reasons jsonb NOT NULL DEFAULT '[]'::jsonb, competitor text NULLABLE, lost_stage text NULLABLE, cycle_days numeric NULLABLE, amount numeric NULLABLE, segment text NULLABLE, analyzed_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.win_loss_analyses. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.win_loss_analyses. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `outcome` | `text` | não |  |  | Coluna outcome da tabela public.win_loss_analyses. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (outcome = ANY (ARRAY['won'::text, 'lost'::text])). |
| 4 | `primary_reason` | `text` | sim |  |  | Coluna primary_reason da tabela public.win_loss_analyses. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `secondary_reasons` | `jsonb` | não | `'[]'::jsonb` |  | Coluna secondary_reasons da tabela public.win_loss_analyses. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 6 | `competitor` | `text` | sim |  |  | Coluna competitor da tabela public.win_loss_analyses. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `lost_stage` | `text` | sim |  |  | Coluna lost_stage da tabela public.win_loss_analyses. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `cycle_days` | `numeric` | sim |  |  | Coluna cycle_days da tabela public.win_loss_analyses. Tipo PostgreSQL: numeric. Aceita NULL. |
| 9 | `amount` | `numeric` | sim |  |  | Coluna amount da tabela public.win_loss_analyses. Tipo PostgreSQL: numeric. Aceita NULL. |
| 10 | `segment` | `text` | sim |  |  | Coluna segment da tabela public.win_loss_analyses. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `analyzed_at` | `timestamp with time zone` | não | `now()` |  | Coluna analyzed_at da tabela public.win_loss_analyses. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.win_loss_analyses. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| win_loss_analyses_outcome_check | CHECK | `CHECK (outcome = ANY (ARRAY['won'::text, 'lost'::text]))` |  |  | sim |
| win_loss_analyses_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| win_loss_analyses_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| win_loss_analyses_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wla_analyzed_at | btree | analyzed_at | não | sim |  | `CREATE INDEX idx_wla_analyzed_at ON public.win_loss_analyses USING btree (analyzed_at DESC)` |
| idx_wla_competitor | btree | competitor | não | sim |  | `CREATE INDEX idx_wla_competitor ON public.win_loss_analyses USING btree (competitor)` |
| idx_wla_outcome | btree | outcome | não | sim |  | `CREATE INDEX idx_wla_outcome ON public.win_loss_analyses USING btree (outcome)` |
| idx_wla_outcome_segment | btree | outcome, segment | não | sim |  | `CREATE INDEX idx_wla_outcome_segment ON public.win_loss_analyses USING btree (outcome, segment)` |
| idx_wla_segment | btree | segment | não | sim |  | `CREATE INDEX idx_wla_segment ON public.win_loss_analyses USING btree (segment)` |
| win_loss_analyses_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX win_loss_analyses_pkey ON public.win_loss_analyses USING btree (id)` |
| win_loss_analyses_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX win_loss_analyses_sale_id_key ON public.win_loss_analyses USING btree (sale_id)` |


## Policies (RLS)

### `wla read auth`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = win_loss_analyses.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |

### `wla write admin/manager`

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
