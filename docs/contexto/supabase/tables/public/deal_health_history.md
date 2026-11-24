# public.deal_health_history

> Tabela public.deal_health_history. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, owner_id uuid NOT NULL, score integer NOT NULL, tier text NOT NULL, delta integer NOT NULL DEFAULT 0, snapshot_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.deal_health_history. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.deal_health_history. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.deal_health_history. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `score` | `integer` | não |  |  | Coluna score da tabela public.deal_health_history. Tipo PostgreSQL: integer. Não aceita NULL. |
| 5 | `tier` | `text` | não |  |  | Coluna tier da tabela public.deal_health_history. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `delta` | `integer` | não | `0` |  | Coluna delta da tabela public.deal_health_history. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `snapshot_at` | `timestamp with time zone` | não | `now()` |  | Coluna snapshot_at da tabela public.deal_health_history. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_health_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_health_history_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_health_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_health_history_pkey ON public.deal_health_history USING btree (id)` |
| idx_deal_health_history_sale_time | btree | sale_id, snapshot_at | não | sim |  | `CREATE INDEX idx_deal_health_history_sale_time ON public.deal_health_history USING btree (sale_id, snapshot_at DESC)` |


## Policies (RLS)

### `Authenticated users can insert health history`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = owner_id)` |

### `Users see own deal health history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
