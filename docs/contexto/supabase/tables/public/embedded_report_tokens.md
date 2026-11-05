# public.embedded_report_tokens

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `report_id` | `uuid` | não |  |  |  |
| 3 | `public_token` | `uuid` | não | `gen_random_uuid()` |  |  |
| 4 | `expires_at` | `timestamp with time zone` | sim |  |  |  |
| 5 | `allowed_domains` | `text[]` | sim | `'{}'::text[]` |  |  |
| 6 | `view_count` | `integer` | não | `0` |  |  |
| 7 | `last_viewed_at` | `timestamp with time zone` | sim |  |  |  |
| 8 | `is_active` | `boolean` | não | `true` |  |  |
| 9 | `created_by` | `uuid` | não |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| embedded_report_tokens_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| embedded_report_tokens_public_token_key | UNIQUE | `UNIQUE (public_token)` |  |  | sim |
| embedded_report_tokens_report_id_fkey | FOREIGN KEY | `FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| embedded_report_tokens_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX embedded_report_tokens_pkey ON public.embedded_report_tokens USING btree (id)` |
| embedded_report_tokens_public_token_key | btree | public_token | sim | sim |  | `CREATE UNIQUE INDEX embedded_report_tokens_public_token_key ON public.embedded_report_tokens USING btree (public_token)` |
| idx_embedded_tokens_report | btree | report_id | não | sim |  | `CREATE INDEX idx_embedded_tokens_report ON public.embedded_report_tokens USING btree (report_id)` |
| idx_embedded_tokens_token | btree | public_token | não | sim |  | `CREATE INDEX idx_embedded_tokens_token ON public.embedded_report_tokens USING btree (public_token)` |


## Policies (RLS)

### `creator_full_access_tokens`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK | `((created_by = auth.uid()) OR is_admin_or_manager(auth.uid()))` |


## Triggers

_nenhum_


## Grants

_nenhum_
