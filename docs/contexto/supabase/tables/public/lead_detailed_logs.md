# public.lead_detailed_logs

> Tabela public.lead_detailed_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), client_id uuid NOT NULL, event_type text NOT NULL, action text NOT NULL, details jsonb NULLABLE DEFAULT '{}'::jsonb, created_at timestamp with time zone NULLABLE DEFAULT now(), created_by uuid NULLABLE. Relacionamentos FK: client_id → public.clients(id); created_by → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.lead_detailed_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `client_id` | `uuid` | não |  |  | Coluna client_id da tabela public.lead_detailed_logs. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.clients(id). |
| 3 | `event_type` | `text` | não |  |  | Coluna event_type da tabela public.lead_detailed_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `action` | `text` | não |  |  | Coluna action da tabela public.lead_detailed_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `details` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna details da tabela public.lead_detailed_logs. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |
| 6 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.lead_detailed_logs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 7 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.lead_detailed_logs. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_detailed_logs_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| lead_detailed_logs_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| lead_detailed_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_lead_detailed_logs_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_lead_detailed_logs_client_id ON public.lead_detailed_logs USING btree (client_id)` |
| idx_lead_detailed_logs_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_lead_detailed_logs_created_by ON public.lead_detailed_logs USING btree (created_by)` |
| lead_detailed_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_detailed_logs_pkey ON public.lead_detailed_logs USING btree (id)` |


## Policies (RLS)

### `Users can insert logs for their clients`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((auth.uid() = created_by) AND (is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM clients c   WHERE ((c.id = lead_detailed_logs.client_id) AND (c.user_id = auth.uid()))))))` |

### `Users can insert own logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = created_by)` |

### `Users can view logs of their clients`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM clients c   WHERE ((c.id = lead_detailed_logs.client_id) AND ((c.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| WITH CHECK |  |

### `Users can view own logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((auth.uid() = created_by) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
