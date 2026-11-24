# public.commission_bonus_awards

> Tabela public.commission_bonus_awards. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), bonus_id uuid NOT NULL, salesperson_id uuid NOT NULL, period_month date NOT NULL, computed_amount numeric(14,2) NOT NULL DEFAULT 0, bonus_kind text NOT NULL, status text NOT NULL DEFAULT 'pending'::text, awarded_at timestamp with time zone NOT NULL DEFAULT now(), paid_at timestamp with time zone NULLABLE, admin_notes text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: bonus_id → public.commission_bonuses(id); salesperson_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.commission_bonus_awards. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `bonus_id` | `uuid` | não |  |  | Coluna bonus_id da tabela public.commission_bonus_awards. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.commission_bonuses(id). |
| 3 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.commission_bonus_awards. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 4 | `period_month` | `date` | não |  |  | Coluna period_month da tabela public.commission_bonus_awards. Tipo PostgreSQL: date. Não aceita NULL. |
| 5 | `computed_amount` | `numeric(14,2)` | não | `0` |  | Coluna computed_amount da tabela public.commission_bonus_awards. Tipo PostgreSQL: numeric(14,2). Não aceita NULL. Valor padrão: 0. |
| 6 | `bonus_kind` | `text` | não |  |  | Coluna bonus_kind da tabela public.commission_bonus_awards. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (bonus_kind = ANY (ARRAY['fixed'::text, 'percentage'::text])). |
| 7 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.commission_bonus_awards. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'cancelled'::text])). |
| 8 | `awarded_at` | `timestamp with time zone` | não | `now()` |  | Coluna awarded_at da tabela public.commission_bonus_awards. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `paid_at` | `timestamp with time zone` | sim |  |  | Coluna paid_at da tabela public.commission_bonus_awards. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `admin_notes` | `text` | sim |  |  | Coluna admin_notes da tabela public.commission_bonus_awards. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.commission_bonus_awards. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.commission_bonus_awards. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| commission_bonus_awards_bonus_id_fkey | FOREIGN KEY | `FOREIGN KEY (bonus_id) REFERENCES commission_bonuses(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| commission_bonus_awards_bonus_id_salesperson_id_period_mont_key | UNIQUE | `UNIQUE (bonus_id, salesperson_id, period_month)` |  |  | sim |
| commission_bonus_awards_bonus_kind_check | CHECK | `CHECK (bonus_kind = ANY (ARRAY['fixed'::text, 'percentage'::text]))` |  |  | sim |
| commission_bonus_awards_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| commission_bonus_awards_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| commission_bonus_awards_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'cancelled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| commission_bonus_awards_bonus_id_salesperson_id_period_mont_key | btree | bonus_id, salesperson_id, period_month | sim | sim |  | `CREATE UNIQUE INDEX commission_bonus_awards_bonus_id_salesperson_id_period_mont_key ON public.commission_bonus_awards USING btree (bonus_id, salesperson_id, period_month)` |
| commission_bonus_awards_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX commission_bonus_awards_pkey ON public.commission_bonus_awards USING btree (id)` |
| idx_cba_salesperson_period | btree | salesperson_id, period_month | não | sim |  | `CREATE INDEX idx_cba_salesperson_period ON public.commission_bonus_awards USING btree (salesperson_id, period_month DESC)` |
| idx_cba_status_pending | btree | status | não | sim | `(status = 'pending'::text)` | `CREATE INDEX idx_cba_status_pending ON public.commission_bonus_awards USING btree (status) WHERE (status = 'pending'::text)` |


## Policies (RLS)

### `Admins delete awards`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admins insert awards`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Admins update awards`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Salespeople view own awards`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_notify_bonus_paid | AFTER | INSERT OR UPDATE | ROW | enabled | public.notify_salesperson_on_bonus_paid |
| update_commission_bonus_awards_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
