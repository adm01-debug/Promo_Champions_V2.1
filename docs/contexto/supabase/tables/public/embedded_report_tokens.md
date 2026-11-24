# public.embedded_report_tokens

> Tabela public.embedded_report_tokens. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), report_id uuid NOT NULL, public_token uuid NOT NULL DEFAULT gen_random_uuid(), expires_at timestamp with time zone NULLABLE, allowed_domains text[] NULLABLE DEFAULT '{}'::text[], view_count integer NOT NULL DEFAULT 0, last_viewed_at timestamp with time zone NULLABLE, is_active boolean NOT NULL DEFAULT true, created_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: report_id → public.custom_reports(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.embedded_report_tokens. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `report_id` | `uuid` | não |  |  | Coluna report_id da tabela public.embedded_report_tokens. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.custom_reports(id). |
| 3 | `public_token` | `uuid` | não | `gen_random_uuid()` |  | Coluna public_token da tabela public.embedded_report_tokens. Tipo PostgreSQL: uuid. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 4 | `expires_at` | `timestamp with time zone` | sim |  |  | Coluna expires_at da tabela public.embedded_report_tokens. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 5 | `allowed_domains` | `text[]` | sim | `'{}'::text[]` |  | Coluna allowed_domains da tabela public.embedded_report_tokens. Tipo PostgreSQL: text[]. Aceita NULL. Valor padrão: '{}'::text[]. |
| 6 | `view_count` | `integer` | não | `0` |  | Coluna view_count da tabela public.embedded_report_tokens. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `last_viewed_at` | `timestamp with time zone` | sim |  |  | Coluna last_viewed_at da tabela public.embedded_report_tokens. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 8 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.embedded_report_tokens. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 9 | `created_by` | `uuid` | não |  |  | Coluna created_by da tabela public.embedded_report_tokens. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.embedded_report_tokens. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
