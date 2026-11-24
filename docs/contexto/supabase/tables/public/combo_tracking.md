# public.combo_tracking

> Tabela public.combo_tracking. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, combo_date date NOT NULL DEFAULT CURRENT_DATE, actions_count integer NOT NULL DEFAULT 0, current_multiplier numeric(3,1) NOT NULL DEFAULT 1.0, current_tier integer NOT NULL DEFAULT 0, max_tier_today integer NOT NULL DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.combo_tracking. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.combo_tracking. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `combo_date` | `date` | não | `CURRENT_DATE` |  | Coluna combo_date da tabela public.combo_tracking. Tipo PostgreSQL: date. Não aceita NULL. Valor padrão: CURRENT_DATE. |
| 4 | `actions_count` | `integer` | não | `0` |  | Coluna actions_count da tabela public.combo_tracking. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `current_multiplier` | `numeric(3,1)` | não | `1.0` |  | Coluna current_multiplier da tabela public.combo_tracking. Tipo PostgreSQL: numeric(3,1). Não aceita NULL. Valor padrão: 1.0. |
| 6 | `current_tier` | `integer` | não | `0` |  | Coluna current_tier da tabela public.combo_tracking. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `max_tier_today` | `integer` | não | `0` |  | Coluna max_tier_today da tabela public.combo_tracking. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.combo_tracking. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.combo_tracking. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| combo_tracking_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| combo_tracking_salesperson_id_combo_date_key | UNIQUE | `UNIQUE (salesperson_id, combo_date)` |  |  | sim |
| combo_tracking_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| combo_tracking_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX combo_tracking_pkey ON public.combo_tracking USING btree (id)` |
| combo_tracking_salesperson_id_combo_date_key | btree | salesperson_id, combo_date | sim | sim |  | `CREATE UNIQUE INDEX combo_tracking_salesperson_id_combo_date_key ON public.combo_tracking USING btree (salesperson_id, combo_date)` |
| idx_combo_tracking_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_combo_tracking_salesperson_id ON public.combo_tracking USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins can update combo_tracking`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Anyone can read combo_tracking`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Users can insert own combo_tracking`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())  LIMIT 1))` |

### `Users can update own combo_tracking`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())  LIMIT 1))` |
| WITH CHECK | `(salesperson_id = ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())  LIMIT 1))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
