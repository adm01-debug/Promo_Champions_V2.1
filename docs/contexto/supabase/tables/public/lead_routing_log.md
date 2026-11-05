# public.lead_routing_log

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `client_id` | `uuid` | sim |  |  |  |
| 3 | `from_salesperson_id` | `uuid` | sim |  |  |  |
| 4 | `to_salesperson_id` | `uuid` | sim |  |  |  |
| 5 | `routing_reason` | `text` | não |  |  |  |
| 6 | `notes` | `text` | sim |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_routing_log_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| lead_routing_log_from_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (from_salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| lead_routing_log_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| lead_routing_log_to_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (to_salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_lead_routing_log_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_lead_routing_log_client_id ON public.lead_routing_log USING btree (client_id)` |
| idx_lead_routing_log_from_salesperson_id | btree | from_salesperson_id | não | sim |  | `CREATE INDEX idx_lead_routing_log_from_salesperson_id ON public.lead_routing_log USING btree (from_salesperson_id)` |
| idx_lead_routing_log_to_salesperson_id | btree | to_salesperson_id | não | sim |  | `CREATE INDEX idx_lead_routing_log_to_salesperson_id ON public.lead_routing_log USING btree (to_salesperson_id)` |
| lead_routing_log_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_routing_log_pkey ON public.lead_routing_log USING btree (id)` |


## Policies (RLS)

### `Admin and managers can read lead_routing_log`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can insert lead_routing_log`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |


## Triggers

_nenhum_


## Grants

_nenhum_
