# public.pipeline_inspection_snapshots

> Tabela public.pipeline_inspection_snapshots. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, stage text NOT NULL, days_in_stage integer NOT NULL DEFAULT 0, last_activity_at timestamp with time zone NULLABLE, days_since_activity integer NULLABLE, risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb, health_score integer NULLABLE, inspected_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `stage` | `text` | não |  |  | Coluna stage da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `days_in_stage` | `integer` | não | `0` |  | Coluna days_in_stage da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `last_activity_at` | `timestamp with time zone` | sim |  |  | Coluna last_activity_at da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 6 | `days_since_activity` | `integer` | sim |  |  | Coluna days_since_activity da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: integer. Aceita NULL. |
| 7 | `risk_flags` | `jsonb` | não | `'[]'::jsonb` |  | Coluna risk_flags da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 8 | `health_score` | `integer` | sim |  |  | Coluna health_score da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: integer. Aceita NULL. |
| 9 | `inspected_at` | `timestamp with time zone` | não | `now()` |  | Coluna inspected_at da tabela public.pipeline_inspection_snapshots. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| pipeline_inspection_snapshots_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| pipeline_inspection_snapshots_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pis_inspected | btree | inspected_at | não | sim |  | `CREATE INDEX idx_pis_inspected ON public.pipeline_inspection_snapshots USING btree (inspected_at DESC)` |
| idx_pis_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_pis_sale ON public.pipeline_inspection_snapshots USING btree (sale_id)` |
| pipeline_inspection_snapshots_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX pipeline_inspection_snapshots_pkey ON public.pipeline_inspection_snapshots USING btree (id)` |


## Policies (RLS)

### `pis_insert_admin`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `pis_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = pipeline_inspection_snapshots.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
