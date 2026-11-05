# public.external_seller_map

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
| 2 | `external_id` | `text` | não |  |  |  |
| 3 | `external_source` | `text` | não | `'gift_store'::text` |  |  |
| 4 | `salesperson_id` | `uuid` | não |  |  |  |
| 5 | `external_name` | `text` | sim |  |  |  |
| 6 | `external_email` | `text` | sim |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| chk_external_seller_map_email_format | CHECK | `CHECK (external_email IS NULL OR external_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'::text)` |  |  | sim |
| chk_external_seller_map_external_id_len | CHECK | `CHECK (char_length(external_id) >= 1 AND char_length(external_id) <= 128)` |  |  | sim |
| chk_external_seller_map_source_allowed | CHECK | `CHECK (external_source = ANY (ARRAY['bitrix24'::text, 'gift_store'::text, 'promogifts'::text, 'n8n'::text, 'manual'::text, 'api'::text]))` |  |  | sim |
| external_seller_map_external_source_external_id_key | UNIQUE | `UNIQUE (external_source, external_id)` |  |  | sim |
| external_seller_map_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| external_seller_map_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| external_seller_map_external_source_external_id_key | btree | external_source, external_id | sim | sim |  | `CREATE UNIQUE INDEX external_seller_map_external_source_external_id_key ON public.external_seller_map USING btree (external_source, external_id)` |
| external_seller_map_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX external_seller_map_pkey ON public.external_seller_map USING btree (id)` |
| idx_champ_external_seller_map_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_champ_external_seller_map_salesperson_id ON public.external_seller_map USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins manage seller map`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated read seller map`

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


## Grants

_nenhum_
