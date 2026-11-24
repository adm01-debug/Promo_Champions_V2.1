# public.activity_goals

> Tabela public.activity_goals. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, calls_goal integer NOT NULL DEFAULT 30, emails_goal integer NOT NULL DEFAULT 20, meetings_goal integer NOT NULL DEFAULT 3, linkedin_goal integer NOT NULL DEFAULT 10, whatsapp_goal integer NOT NULL DEFAULT 15, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.activity_goals. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.activity_goals. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `calls_goal` | `integer` | não | `30` |  | Coluna calls_goal da tabela public.activity_goals. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 30. |
| 4 | `emails_goal` | `integer` | não | `20` |  | Coluna emails_goal da tabela public.activity_goals. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 20. |
| 5 | `meetings_goal` | `integer` | não | `3` |  | Coluna meetings_goal da tabela public.activity_goals. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 3. |
| 6 | `linkedin_goal` | `integer` | não | `10` |  | Coluna linkedin_goal da tabela public.activity_goals. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 10. |
| 7 | `whatsapp_goal` | `integer` | não | `15` |  | Coluna whatsapp_goal da tabela public.activity_goals. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 15. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.activity_goals. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.activity_goals. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| activity_goals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| activity_goals_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE RESTRICT` | RESTRICT | NO ACTION | sim |
| activity_goals_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| activity_goals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX activity_goals_pkey ON public.activity_goals USING btree (id)` |
| activity_goals_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX activity_goals_salesperson_id_key ON public.activity_goals USING btree (salesperson_id)` |
| idx_activity_goals_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_activity_goals_salesperson_id ON public.activity_goals USING btree (salesperson_id)` |


## Policies (RLS)

### `Admins can delete activity_goals`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can insert own activity_goals`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can update own activity_goals`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can view own activity_goals or admin`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_activity_goals_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
