# Quadro de débito técnico — Promo Champions V2.1

> Gerado por `node scripts/debt-report.mjs` (2026-10-01). Atualize o quadro
> rodando o script; os números abaixo são a fotografia da data.
> Regra geral: todo item é um **ratchet** — só pode melhorar, nunca piorar.

| Item                                      | Atual (2026-10-01)                            | Teto / meta                                              | Fonte da verdade                        | Dono            | Prazo                            |
| ----------------------------------------- | --------------------------------------------- | -------------------------------------------------------- | --------------------------------------- | --------------- | -------------------------------- |
| Cobertura de testes (ratchet etapa 32)    | linhas 3,59% · branches 3,07% · funções 2,65% | só sobe; meta próxima 5%                                 | `coverage-baseline.json`                | Time engenharia | contínuo, revisão por sprint     |
| Complexidade >20 / arquivos >600 linhas   | 131 warnings em 121 arquivos (2026-11-24)     | teto 131 = medido, sem folga → meta 0                    | `package.json`                          | Time engenharia | -25 warnings/trimestre           |
| eslint-disable em `src/`                  | 270 diretivas                                 | reduzir, nunca aumentar                                  | grep `src/`                             | Time engenharia | contínuo                         |
| └─ `no-restricted-syntax`                 | 213 diretivas                                 | 0 — revisar se a regra restrita ainda se aplica          | grep                                    | Time engenharia | Q1 2027                          |
| └─ `react-hooks/exhaustive-deps`          | 51 diretivas                                  | 0 — corrigir deps de verdade ou justificar no comentário | grep                                    | Time engenharia | -10/mês                          |
| Cast `as unknown as` (tipagem contornada) | 214 em `src/` + 20 em `supabase/functions`    | 0 — tipar respostas do Supabase corretamente             | grep                                    | Time engenharia | contínuo                         |
| Edge functions sem lint de request-id     | 8 funções                                     | 0 — toda função pública propaga `x-request-id`           | `scripts/request-id-lint-allowlist.txt` | Backend         | próxima alteração em cada função |
| Edge functions (typecheck por função)     | 166 funções                                   | `deno check` zero erros em funções tocadas               | `scripts/bundle-edge-functions.ts`      | Backend         | por PR                           |
| Budget de bundle por chunk                | budgets gzip por vendor                       | `BUDGETS_KB` em `scripts/check-bundle-budget.mjs`        | CI (`pr-checks.yml`)                    | Time engenharia | por PR                           |

### O que sustenta o teto de complexidade (medição de 2026-11-24, etapa 222)

`npm run lint:complexity` mede **131 warnings em 121 arquivos**: 112 de `complexity` e 19 de
`max-lines`. O teto do `package.json` está em **131**, ou seja, exatamente o medido — não há folga,
então qualquer warning novo quebra a CI. Ele **não** foi devolvido ao valor anterior (126) porque
isso exigiria eliminar 5 ocorrências, e todas as que restam são funções/arquivos existentes em uso:

| Faixa                                   | Ocorrências | Como reduzir                                                                 |
| --------------------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `complexity` 21–25                      | 45          | exigiria refatorar a função — o plano de QA proíbe mexer só para baixar número |
| `complexity` 26–40                      | 49          | idem; a maioria é componente de tela com muitos ramos de estado               |
| `complexity` >40                        | 18          | extração de subcomponentes: mudança estrutural, não diff pequeno              |
| `max-lines` >600 (12 arquivos só nisso) | 19          | mover blocos para outros arquivos: churn sem ganho de comportamento          |

Os cinco maiores ofensores, se algum dia houver janela para refatoração de verdade:
`src/pages/BICloser.tsx:44` (92), `src/pages/Index.tsx:108` (88), `src/pages/BISDR.tsx:42` (79),
`src/components/race/RaceArena.tsx:80` (70) e `src/components/predictive/PredictiveIntelligenceDashboard.tsx:41` (67) —
todos em rotas ativas (nenhum é código morto, então não há remoção "de graça").

Enquanto o teto ficar igual ao medido, a regra "só desce" continua valendo: o número só pode cair.

## Como operar

- `npm run lint:complexity` — quebra CI acima de 131 warnings.
- `npm run coverage:baseline:update` — sobe o piso de cobertura quando melhorar (commita o número na mesma PR).
- `node scripts/debt-report.mjs` — regera o quadro (use `--quick` para pular o eslint).
- `node scripts/check-bundle-budget.mjs` — valida tamanho gzip dos chunks após `ANALYZE_BUNDLE=1 npm run build`.

## Notas de governança

1. **Ratchet nunca desce.** Se uma métrica piorar, a PR é bloqueada ou pede waiver explícito registrado aqui.
2. **Disables justificados ficam.** Um `eslint-disable` com comentário explicando o padrão (ex.: comparação rasa em loop de animação) não é débito — é documentação de trade-off.
3. **Dono = responsável por defender o número em review**, não necessariamente quem corrige tudo sozinho.
