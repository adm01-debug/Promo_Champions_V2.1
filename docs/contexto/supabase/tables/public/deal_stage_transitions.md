# public.deal_stage_transitions

> Tabela public.deal_stage_transitions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, from_stage text NULLABLE, to_stage text NOT NULL, entered_at timestamp with time zone NOT NULL DEFAULT now(), exited_at timestamp with time zone NULLABLE, duration_hours numeric NULLABLE DEFAULT 
CASE
    WHEN (exited_at IS NOT NULL) THEN (EXTRACT(epoch FROM (exited_at - entered_at)) / 3600.0)
    ELSE NULL::numeric
END, transitioned_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.deal_stage_transitions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.deal_stage_transitions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `from_stage` | `text` | sim |  |  | Coluna from_stage da tabela public.deal_stage_transitions. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `to_stage` | `text` | não |  |  | Coluna to_stage da tabela public.deal_stage_transitions. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `entered_at` | `timestamp with time zone` | não | `now()` |  | Coluna entered_at da tabela public.deal_stage_transitions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 6 | `exited_at` | `timestamp with time zone` | sim |  |  | Coluna exited_at da tabela public.deal_stage_transitions. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 7 | `duration_hours` | `numeric` | sim | ` CASE     WHEN (exited_at IS NOT NULL) THEN (EXTRACT(epoch FROM (exited_at - entered_at)) / 3600.0)     ELSE NULL::numeric END` | s | Coluna duration_hours da tabela public.deal_stage_transitions. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão:  CASE     WHEN (exited_at IS NOT NULL) THEN (EXTRACT(epoch FROM (exited_at - entered_at)) / 3600.0)     ELSE NULL::numeric END. |
| 8 | `transitioned_by` | `uuid` | sim |  |  | Coluna transitioned_by da tabela public.deal_stage_transitions. Tipo PostgreSQL: uuid. Aceita NULL. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.deal_stage_transitions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_stage_transitions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_stage_transitions_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_stage_transitions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_stage_transitions_pkey ON public.deal_stage_transitions USING btree (id)` |
| idx_dst_open | btree | sale_id | não | sim | `(exited_at IS NULL)` | `CREATE INDEX idx_dst_open ON public.deal_stage_transitions USING btree (sale_id) WHERE (exited_at IS NULL)` |
| idx_dst_sale_entered | btree | sale_id, entered_at | não | sim |  | `CREATE INDEX idx_dst_sale_entered ON public.deal_stage_transitions USING btree (sale_id, entered_at DESC)` |
| idx_dst_to_stage | btree | to_stage | não | sim |  | `CREATE INDEX idx_dst_to_stage ON public.deal_stage_transitions USING btree (to_stage)` |


## Policies (RLS)

### `admin manager write stage transitions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `auth read stage transitions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
