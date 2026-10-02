# 15 — Escada de cobertura por módulo crítico

## Por que existe

O ratchet global (`scripts/check-coverage-ratchet.mjs`, etapa 32) trava a média
do projeto — mas uma regressão num módulo financeiro pode ser diluída por
ganho em outro lugar e passar batida. A escada complementa: cada módulo
crítico tem seu próprio piso em `coverage-ladder-baseline.json` e o check
`npm run coverage:ladder` reprova qualquer queda além de 0,05pp de ruído.

## Módulos cobertos

`src/lib/financeiro` **não existe** — a lógica financeira deste projeto vive
em `markupHelpers`, `bi/`, `revenueForecast/` e `services/`. A lista real:

| Prefixo                    | Domínio                                      |
| -------------------------- | -------------------------------------------- |
| `src/lib/validators/`      | Validadores BR (CPF/CNPJ, brSchemas)         |
| `src/lib/schemas/`         | Schemas comerciais (comissão, metas, regras) |
| `src/lib/markupHelpers`    | Markup e preço de venda                      |
| `src/lib/gamification.ts`  | XP e progressão de nível                     |
| `src/lib/race/`            | Gamificação de arena (celebrações, tiers)    |
| `src/lib/orderTracking/`   | State machine de status de pedido            |
| `src/lib/bi/`              | Agregações de BI                             |
| `src/lib/revenueForecast/` | Forecast de receita                          |
| `src/services/`            | Camada de serviços (sales, combo, goals)     |
| `src/hooks/reports/`       | Helpers de relatórios                        |

Novos módulos entram na lista editando `LADDER_MODULES` em
`scripts/update-coverage-baseline.mjs` e regenerando o baseline.

## Como funciona

- **Piso inicial** = cobertura de linhas medida no módulo, truncada em 0,1pp.
  O piso nunca é editado manualmente — regenera com
  `npm run coverage:baseline:update` (que atualiza global + módulos juntos).
- **`npm run coverage:ladder`** roda no job `test` do `pr-checks.yml`, logo
  após o ratchet global. Falha se algum módulo cair abaixo do piso e avisa se
  um prefixo parou de existir (módulo renomeado/removido).

## Plano de subida gradual

1. **Travado no atual** (este pacote): pisos medidos — módulos já bem testados
   (`validators`, `orderTracking`) travam alto; os baixos travam onde estão.
2. **Quem toca, sobe**: ao mexer num módulo, adicione testes e commite o
   baseline novo na mesma PR — o ganho fica visível no diff.
3. **Metas por degrau** (sugestão de sequência, revisar a cada ciclo):
   - `src/lib/markupHelpers` → 80% de linhas
   - `src/lib/schemas/` → 90% (schemas declarativos são baratos de testar)
   - `src/services/` → 40% → 60% (extrair lógica pura para `src/lib/` ajuda)
   - `src/hooks/reports/` → 50%
4. Nunca baixar um piso. Se uma remoção legítima de código reduz a cobertura,
   regenere o baseline na mesma PR com justificativa no corpo.

## Verificação local

```sh
npm run test:coverage        # gera coverage/coverage-summary.json
npm run coverage:ratchet     # piso global
npm run coverage:ladder      # pisos por módulo
npm run test:config          # padrões de spec vs disco (drift de config)
```
