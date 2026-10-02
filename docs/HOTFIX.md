# Procedimento de hotfix

> Correção urgente em produção. Princípio: **o menor diff que restaura o
> serviço** — sem refatorações, sem "aproveitar pra arrumar".

## 1. Branch

```bash
git checkout -b hotfix/<descricao-curta>   # ex.: hotfix/webhook-401
# base: main (produção = o que está publicado no Lovable a partir da main)
```

## 2. Gates de CI — o que pode e o que não pode ser contornado

| Check | Regra |
|-------|-------|
| `pr-checks` (lint, typecheck, tests) | **Nunca** pular — rodar escopo afetado localmente antes do push |
| `edge-functions-*` (lint/bundle/request-id) | Obrigatório quando toca `supabase/functions/` |
| E2E / quote-to-sale | Pode falhar por credenciais/ambiente pré-existente — documentar no PR o motivo, com link para o job |
| Quality gates opcionais (Lighthouse, audit) | Não-bloqueantes por natureza; não usar como desculpa para pular os obrigatórios |

**Bypass permitido** apenas quando: (a) a falha é comprovadamente
pré-existente na `main` (mesmo job vermelho antes do hotfix) e (b) o
admin aprova explicitamente no PR. Registrar o bypass na descrição do PR.

## 3. Execução

1. Reproduzir o problema (logs, health, `curl` na function) — diagnóstico
   antes de patch.
2. Fix mínimo + teste local do escopo (`vitest run` nos arquivos
   relacionados, `deno check`/`deno lint` se edge function).
3. PR `hotfix/*` → `main` com: causa raiz, evidência do bug, mitigação
   aplicada, checks afetados.
4. Merge → executar o deploy real: aplicar migration (se houver) **antes**
   do Publish; deployar a function alterada; então **Publish** no Lovable.
5. Smoke pós-hotfix (5 min): health da integração afetada + golden path.

## 4. Comunicação

- Avisar no canal do time **antes** do merge (o que caiu, o que vai mudar,
  janela estimada).
- Ao final: resultado + link do PR + o que falta (ex.: backfill,
  observação de métricas).
- Se envolve dado de usuário (corrompido, exposto): escalar imediatamente
  para {{ NOME_DONO_PRODUTO }} — ver `docs/runbooks/on-call.md`.

## 5. Pós-hotfix

- Backfill/correção de dados em PR separado (não misturar com o hotfix).
- Se o bypass de gate foi usado, abrir acompanhamento para a falha do check.
- Registrar causa raiz no `docs/RUNBOOK.md` (se for padrão recorrente) e
  entrada no `CHANGELOG.md`.
