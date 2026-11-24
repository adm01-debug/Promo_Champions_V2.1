# public.report_embed_tokens

> Tabela public.report_embed_tokens. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), report_id uuid NOT NULL, token text NOT NULL, created_by uuid NOT NULL, expires_at timestamp with time zone NULLABLE, allowed_origins text[] NOT NULL DEFAULT '{}'::text[], view_count integer NOT NULL DEFAULT 0, last_viewed_at timestamp with time zone NULLABLE, revoked boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: report_id → public.custom_reports(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.report_embed_tokens. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `report_id` | `uuid` | não |  |  | Coluna report_id da tabela public.report_embed_tokens. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.custom_reports(id). |
| 3 | `token` | `text` | não |  |  | Coluna token da tabela public.report_embed_tokens. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `created_by` | `uuid` | não |  |  | Coluna created_by da tabela public.report_embed_tokens. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 5 | `expires_at` | `timestamp with time zone` | sim |  |  | Coluna expires_at da tabela public.report_embed_tokens. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 6 | `allowed_origins` | `text[]` | não | `'{}'::text[]` |  | Coluna allowed_origins da tabela public.report_embed_tokens. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: '{}'::text[]. |
| 7 | `view_count` | `integer` | não | `0` |  | Coluna view_count da tabela public.report_embed_tokens. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `last_viewed_at` | `timestamp with time zone` | sim |  |  | Coluna last_viewed_at da tabela public.report_embed_tokens. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 9 | `revoked` | `boolean` | não | `false` |  | Coluna revoked da tabela public.report_embed_tokens. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.report_embed_tokens. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
