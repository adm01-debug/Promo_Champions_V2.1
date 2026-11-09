# public.integration_secret_refs

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `credential_id` | `uuid` | não |  |  |  |
| 3 | `owner_id` | `uuid` | não |  |  |  |
| 4 | `key` | `text` | não |  |  |  |
| 5 | `secret_ref` | `text` | não |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| integration_secret_refs_credential_id_fkey | FOREIGN KEY | `FOREIGN KEY (credential_id) REFERENCES channel_credentials(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| integration_secret_refs_credential_id_key_key | UNIQUE | `UNIQUE (credential_id, key)` |  |  | sim |
| integration_secret_refs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| integration_secret_refs_secret_ref_check | CHECK | `CHECK (secret_ref ~ '^(internal\|env):[A-Za-z_][A-Za-z0-9_.-]*$'::text)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_integration_secret_refs_credential | btree | credential_id | não | sim |  | `CREATE INDEX idx_integration_secret_refs_credential ON public.integration_secret_refs USING btree (credential_id)` |
| idx_integration_secret_refs_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_integration_secret_refs_owner ON public.integration_secret_refs USING btree (owner_id)` |
| integration_secret_refs_credential_id_key_key | btree | credential_id, key | sim | sim |  | `CREATE UNIQUE INDEX integration_secret_refs_credential_id_key_key ON public.integration_secret_refs USING btree (credential_id, key)` |
| integration_secret_refs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX integration_secret_refs_pkey ON public.integration_secret_refs USING btree (id)` |


## Policies (RLS)

### `Admins can delete secret refs`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can insert secret refs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins can update secret refs`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Owners can view their secret refs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_integration_secret_refs_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
