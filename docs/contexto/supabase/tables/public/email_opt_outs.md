# public.email_opt_outs

> Tabela public.email_opt_outs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), email text NOT NULL, reason text NULLABLE, source text NOT NULL DEFAULT 'unsubscribe_link'::text, owner_id uuid NULLABLE, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.email_opt_outs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `email` | `text` | não |  |  | Coluna email da tabela public.email_opt_outs. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `reason` | `text` | sim |  |  | Coluna reason da tabela public.email_opt_outs. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `source` | `text` | não | `'unsubscribe_link'::text` |  | Coluna source da tabela public.email_opt_outs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'unsubscribe_link'::text. |
| 5 | `owner_id` | `uuid` | sim |  |  | Coluna owner_id da tabela public.email_opt_outs. Tipo PostgreSQL: uuid. Aceita NULL. |
| 6 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  | Coluna metadata da tabela public.email_opt_outs. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.email_opt_outs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| email_opt_outs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| email_opt_outs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX email_opt_outs_pkey ON public.email_opt_outs USING btree (id)` |
| idx_email_opt_outs_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_email_opt_outs_created_at ON public.email_opt_outs USING btree (created_at DESC)` |
| idx_email_opt_outs_email_lower_created | btree | created_at | não | sim |  | `CREATE INDEX idx_email_opt_outs_email_lower_created ON public.email_opt_outs USING btree (lower(btrim(email)), created_at DESC)` |
| idx_email_opt_outs_source | btree | source | não | sim |  | `CREATE INDEX idx_email_opt_outs_source ON public.email_opt_outs USING btree (source)` |
| uq_email_opt_outs_email | btree |  | sim | sim |  | `CREATE UNIQUE INDEX uq_email_opt_outs_email ON public.email_opt_outs USING btree (lower(email))` |


## Policies (RLS)

### `Admins can add opt-outs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admins can delete opt-outs`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admins can view opt-outs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
