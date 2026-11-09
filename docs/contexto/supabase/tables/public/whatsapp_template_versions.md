# public.whatsapp_template_versions

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `template_id` | `uuid` | não |  |  |  |
| 3 | `body` | `text` | não |  |  |  |
| 4 | `version_number` | `integer` | não |  |  |  |
| 5 | `created_by` | `uuid` | sim |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| whatsapp_template_versions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.follow_up_settings | follow_up_settings_current_whatsapp_version_id_fkey | current_whatsapp_version_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| whatsapp_template_versions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX whatsapp_template_versions_pkey ON public.whatsapp_template_versions USING btree (id)` |


## Policies (RLS)

### `Admins can manage template versions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |
| WITH CHECK |  |

### `Only admins can create versions`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM user_roles   WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::app_role))))` |

### `Versions are viewable by authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
