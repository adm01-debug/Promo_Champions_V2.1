# Migrations sem downtime — disciplina expand-contract

> O frontend publicado pelo Lovable e os workers/crons continuam rodando a
> versão anterior enquanto uma migration é aplicada. Toda mudança de schema
> precisa sobreviver à janela em que **código velho convive com schema novo**
> (e vice-versa). A regra é: **expand → deploy → backfill → deploy → contract**.

## O ciclo em 3 releases

### Release 1 — Expand (só aditivo)

- `CREATE TABLE`, `ADD COLUMN` **nullable** ou com `DEFAULT`, novo índice,
  nova RPC, nova policy.
- O código novo escreve nos campos novos **e mantém os antigos** (dual-write)
  quando necessário.
- Nada é removido, renomeado ou apertado nesta release.

### Release 2 — Backfill + troca de leitura

- Backfill dos dados (migration `UPDATE` em lotes, ou job pg_cron).
- O frontend/edge passa a **ler** do campo novo; o velho vira fallback.
- Validar invariantes antes de seguir (ex.: contagem de nulos no campo novo).

### Release 3 — Contract (remoção)

- `NOT NULL`, `CHECK`, `UNIQUE`, `DROP COLUMN`/`DROP TABLE`, remoção de
  policies antigas — só depois que nenhum código em produção toca o campo velho.
- Drops de colunas/tabelas precisam de **uma release inteira de quarentena**:
  primeiro parar de escrever/ler, observar, só então dropar.

## Regras específicas deste repo

1. **Versão = timestamp estritamente crescente** (`YYYYMMDDHHMMSS_descricao.sql`)
   maior que o `max(version)` atual. Comentário descritivo no topo do arquivo.
2. **Guards obrigatórios**: `to_regclass`, `IF NOT EXISTS`, `IF EXISTS`,
   `ON CONFLICT` — a mesma migration pode ser reexecutada sem erro.
3. `CREATE INDEX CONCURRENTLY` **não funciona** pelo pooler transacional —
   usar `CREATE INDEX` simples (preferir janela de baixo tráfego para tabelas
   grandes).
4. Aplicação é **manual** (SQL Editor / MCP db_query) — agendar junto com o
   deploy do frontend, nunca "soltar e esquecer".
5. Migrations são **forward-only**: nunca editar ou apagar uma migration já
   aplicada; correções vão em arquivo novo.
6. DDL destrutivo (`DROP`, `ALTER ... TYPE` com cast perdendo dados,
   `NOT NULL` em coluna populada) exige a fase Contract — ver §anterior.
7. Funções/RPCs alteradas precisam manter a assinatura aceita pelo código
   antigo (parâmetros novos sempre com `DEFAULT`).

## Checklist antes de mergear uma migration

- [ ] É aditiva OU tem a fase contract justificada e escalonada?
- [ ] Código velho continua funcionando com o schema novo?
- [ ] Código novo funciona mesmo antes da migration aplicada? (degradar, não quebrar)
- [ ] Tem guard de idempotência?
- [ ] Backfill é idempotente e em lotes (`WHERE ... LIMIT` + loop, ou batch UPDATE)?
- [ ] Se altera tabela quente (`sales`, `clients`, `activities`, `tasks`,
      `quotes`, `orders`): lock evaluation feita? `statement_timeout` curto?

## Anti-padrões já vistos (evitar)

- `ALTER COLUMN ... TYPE` direto em coluna populada → criar coluna nova,
  dual-write, backfill, trocar, dropar a velha.
- `NOT NULL` sem default numa tabela grande → travamento de reescrita.
  Caminho: `ADD COLUMN ... DEFAULT`, backfill, depois `SET NOT NULL`
  (idealmente via `CHECK` validada primeiro).
- Renomear coluna numa release → quebra o código velho. Expand-contract.
- Migration sem guard que falha na 2ª execução → sempre `IF [NOT] EXISTS`/
  `to_regclass`.
