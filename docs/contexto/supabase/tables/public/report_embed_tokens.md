# public.report_embed_tokens

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
| 2 | `report_id` | `uuid` | não |  |  |  |
| 3 | `token` | `text` | não |  |  |  |
| 4 | `created_by` | `uuid` | não |  |  |  |
| 5 | `expires_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `allowed_origins` | `text[]` | não | `'{}'::text[]` |  |  |
| 7 | `view_count` | `integer` | não | `0` |  |  |
| 8 | `last_viewed_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `revoked` | `boolean` | não | `false` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| report_embed_tokens_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| report_embed_tokens_report_id_fkey | FOREIGN KEY | `FOREIGN KEY (report_id) REFERENCES custom_reports(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| report_embed_tokens_token_key | UNIQUE | `UNIQUE (token)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_report_embed_tokens_report_id | btree | report_id | não | sim |  | `CREATE INDEX idx_report_embed_tokens_report_id ON public.report_embed_tokens USING btree (report_id)` |
| idx_report_embed_tokens_token | btree | token | não | sim |  | `CREATE INDEX idx_report_embed_tokens_token ON public.report_embed_tokens USING btree (token)` |
| report_embed_tokens_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX report_embed_tokens_pkey ON public.report_embed_tokens USING btree (id)` |
| report_embed_tokens_token_key | btree | token | sim | sim |  | `CREATE UNIQUE INDEX report_embed_tokens_token_key ON public.report_embed_tokens USING btree (token)` |


## Policies (RLS)

### `Owners and managers can delete embed tokens`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Owners and managers can update embed tokens`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Owners and managers can view embed tokens`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Owners can create embed tokens`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(created_by = auth.uid())` |


## Triggers

_nenhum_


## Grants

_nenhum_
