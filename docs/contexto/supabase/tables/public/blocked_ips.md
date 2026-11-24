# public.blocked_ips

> Lista de endereços IP bloqueados e informações sobre duração e motivo do bloqueio.

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do bloqueio. |
| 2 | `ip_address` | `text` | não |  |  | Endereço IP bloqueado. |
| 3 | `reason` | `text` | não |  |  | Motivo do bloqueio. |
| 4 | `blocked_by` | `uuid` | sim |  |  | Usuário que aplicou o bloqueio, quando identificado. |
| 5 | `blocked_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora em que o bloqueio foi aplicado. |
| 6 | `expires_at` | `timestamp with time zone` | sim |  |  | Data e hora de expiração do bloqueio, quando definida. |
| 7 | `is_permanent` | `boolean` | sim | `false` |  | Indica se o bloqueio foi configurado como permanente. |
| 8 | `block_count` | `integer` | sim | `1` |  | Quantidade de vezes que o endereço foi bloqueado. |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação do registro. |
| 10 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora da última atualização do registro. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| blocked_ips_blocked_by_fkey | FOREIGN KEY | `FOREIGN KEY (blocked_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| blocked_ips_ip_address_key | UNIQUE | `UNIQUE (ip_address)` |  |  | sim |
| blocked_ips_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| blocked_ips_ip_address_key | btree | ip_address | sim | sim |  | `CREATE UNIQUE INDEX blocked_ips_ip_address_key ON public.blocked_ips USING btree (ip_address)` |
| blocked_ips_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX blocked_ips_pkey ON public.blocked_ips USING btree (id)` |
| idx_blocked_ips_address | btree | ip_address | não | sim |  | `CREATE INDEX idx_blocked_ips_address ON public.blocked_ips USING btree (ip_address)` |
| idx_blocked_ips_blocked_by | btree | blocked_by | não | sim |  | `CREATE INDEX idx_blocked_ips_blocked_by ON public.blocked_ips USING btree (blocked_by)` |
| idx_blocked_ips_expires | btree | expires_at | não | sim |  | `CREATE INDEX idx_blocked_ips_expires ON public.blocked_ips USING btree (expires_at)` |


## Policies (RLS)

### `Admins can manage blocked_ips`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_blocked_ips_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
