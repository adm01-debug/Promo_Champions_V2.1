# public.xp_adjustments

> Tabela public.xp_adjustments. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, amount integer NOT NULL, reason text NOT NULL, source text NOT NULL DEFAULT 'manual'::text, related_assignment_id uuid NULLABLE, adjusted_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: related_assignment_id → public.task_assignments(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.xp_adjustments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.xp_adjustments. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `amount` | `integer` | não |  |  | Coluna amount da tabela public.xp_adjustments. Tipo PostgreSQL: integer. Não aceita NULL. |
| 4 | `reason` | `text` | não |  |  | Coluna reason da tabela public.xp_adjustments. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `source` | `text` | não | `'manual'::text` |  | Coluna source da tabela public.xp_adjustments. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'manual'::text. |
| 6 | `related_assignment_id` | `uuid` | sim |  |  | Coluna related_assignment_id da tabela public.xp_adjustments. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.task_assignments(id). |
| 7 | `adjusted_by` | `uuid` | não |  |  | Coluna adjusted_by da tabela public.xp_adjustments. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.xp_adjustments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| xp_adjustments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| xp_adjustments_related_assignment_id_fkey | FOREIGN KEY | `FOREIGN KEY (related_assignment_id) REFERENCES task_assignments(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_xp_adjustments_created | btree | created_at | não | sim |  | `CREATE INDEX idx_xp_adjustments_created ON public.xp_adjustments USING btree (created_at DESC)` |
| idx_xp_adjustments_related_assignment_id | btree | related_assignment_id | não | sim |  | `CREATE INDEX idx_xp_adjustments_related_assignment_id ON public.xp_adjustments USING btree (related_assignment_id)` |
| idx_xp_adjustments_user | btree | user_id | não | sim |  | `CREATE INDEX idx_xp_adjustments_user ON public.xp_adjustments USING btree (user_id)` |
| xp_adjustments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX xp_adjustments_pkey ON public.xp_adjustments USING btree (id)` |


## Policies (RLS)

### `Admin can insert xp adjustments`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admin can view xp adjustments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR (user_id = auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
