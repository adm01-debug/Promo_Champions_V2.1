# public.commission_bonuses

> Tabela public.commission_bonuses. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, description text NULLABLE, bonus_type text NOT NULL, trigger_condition jsonb NOT NULL DEFAULT '{}'::jsonb, bonus_amount numeric(14,2) NOT NULL DEFAULT 0, bonus_kind text NOT NULL DEFAULT 'fixed'::text, salesperson_id uuid NULLABLE, priority integer NOT NULL DEFAULT 0, is_active boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.commission_bonuses. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.commission_bonuses. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `description` | `text` | sim |  |  | Coluna description da tabela public.commission_bonuses. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `bonus_type` | `text` | não |  |  | Coluna bonus_type da tabela public.commission_bonuses. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (bonus_type = ANY (ARRAY['first_sale'::text, 'milestone'::text, 'ranking'::text, 'streak'::text, 'other'::text])). |
| 5 | `trigger_condition` | `jsonb` | não | `'{}'::jsonb` |  | Coluna trigger_condition da tabela public.commission_bonuses. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 6 | `bonus_amount` | `numeric(14,2)` | não | `0` |  | Coluna bonus_amount da tabela public.commission_bonuses. Tipo PostgreSQL: numeric(14,2). Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (bonus_amount >= 0::numeric). |
| 7 | `bonus_kind` | `text` | não | `'fixed'::text` |  | Coluna bonus_kind da tabela public.commission_bonuses. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'fixed'::text. Validação CHECK: CHECK (bonus_kind = ANY (ARRAY['fixed'::text, 'percentage'::text])). |
| 8 | `salesperson_id` | `uuid` | sim |  |  | Coluna salesperson_id da tabela public.commission_bonuses. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 9 | `priority` | `integer` | não | `0` |  | Coluna priority da tabela public.commission_bonuses. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 10 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.commission_bonuses. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.commission_bonuses. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.commission_bonuses. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| commission_bonuses_bonus_amount_check | CHECK | `CHECK (bonus_amount >= 0::numeric)` |  |  | sim |
| commission_bonuses_bonus_kind_check | CHECK | `CHECK (bonus_kind = ANY (ARRAY['fixed'::text, 'percentage'::text]))` |  |  | sim |
| commission_bonuses_bonus_type_check | CHECK | `CHECK (bonus_type = ANY (ARRAY['first_sale'::text, 'milestone'::text, 'ranking'::text, 'streak'::text, 'other'::text]))` |  |  | sim |
| commission_bonuses_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| commission_bonuses_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.commission_bonus_awards | commission_bonus_awards_bonus_id_fkey | bonus_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| commission_bonuses_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX commission_bonuses_pkey ON public.commission_bonuses USING btree (id)` |
| idx_commission_bonuses_active | btree | is_active, priority | não | sim | `(is_active = true)` | `CREATE INDEX idx_commission_bonuses_active ON public.commission_bonuses USING btree (is_active, priority DESC) WHERE (is_active = true)` |
| idx_commission_bonuses_salesperson | btree | salesperson_id | não | sim | `(salesperson_id IS NOT NULL)` | `CREATE INDEX idx_commission_bonuses_salesperson ON public.commission_bonuses USING btree (salesperson_id) WHERE (salesperson_id IS NOT NULL)` |


## Policies (RLS)

### `Admins and managers manage commission_bonuses`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Salespeople view applicable active bonuses`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((is_active = true) AND ((salesperson_id IS NULL) OR (salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| update_commission_bonuses_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
