# public.weekly_matchups

> Tabela public.weekly_matchups. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_a_id uuid NOT NULL, salesperson_b_id uuid NOT NULL, week_start date NOT NULL, score_a numeric NOT NULL DEFAULT 0, score_b numeric NOT NULL DEFAULT 0, winner_id uuid NULLABLE, status text NOT NULL DEFAULT 'active'::text, xp_reward integer NOT NULL DEFAULT 100, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_a_id → public.salespeople(id); salesperson_b_id → public.salespeople(id); winner_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.weekly_matchups. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_a_id` | `uuid` | não |  |  | Coluna salesperson_a_id da tabela public.weekly_matchups. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `salesperson_b_id` | `uuid` | não |  |  | Coluna salesperson_b_id da tabela public.weekly_matchups. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 4 | `week_start` | `date` | não |  |  | Coluna week_start da tabela public.weekly_matchups. Tipo PostgreSQL: date. Não aceita NULL. |
| 5 | `score_a` | `numeric` | não | `0` |  | Coluna score_a da tabela public.weekly_matchups. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `score_b` | `numeric` | não | `0` |  | Coluna score_b da tabela public.weekly_matchups. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `winner_id` | `uuid` | sim |  |  | Coluna winner_id da tabela public.weekly_matchups. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 8 | `status` | `text` | não | `'active'::text` |  | Coluna status da tabela public.weekly_matchups. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'active'::text. |
| 9 | `xp_reward` | `integer` | não | `100` |  | Coluna xp_reward da tabela public.weekly_matchups. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 100. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.weekly_matchups. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| weekly_matchups_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| weekly_matchups_salesperson_a_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_a_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| weekly_matchups_salesperson_b_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_b_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| weekly_matchups_winner_id_fkey | FOREIGN KEY | `FOREIGN KEY (winner_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.competitive_chat_messages | competitive_chat_messages_matchup_id_fkey | matchup_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_weekly_matchups_salesperson_a_id | btree | salesperson_a_id | não | sim |  | `CREATE INDEX idx_weekly_matchups_salesperson_a_id ON public.weekly_matchups USING btree (salesperson_a_id)` |
| idx_weekly_matchups_salesperson_b_id | btree | salesperson_b_id | não | sim |  | `CREATE INDEX idx_weekly_matchups_salesperson_b_id ON public.weekly_matchups USING btree (salesperson_b_id)` |
| idx_weekly_matchups_winner_id | btree | winner_id | não | sim |  | `CREATE INDEX idx_weekly_matchups_winner_id ON public.weekly_matchups USING btree (winner_id)` |
| weekly_matchups_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX weekly_matchups_pkey ON public.weekly_matchups USING btree (id)` |


## Policies (RLS)

### `Admins manage matchups`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Anyone can read matchups`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| tr_check_battle_achievements | AFTER | UPDATE | ROW | enabled | public.check_battle_achievements |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |
