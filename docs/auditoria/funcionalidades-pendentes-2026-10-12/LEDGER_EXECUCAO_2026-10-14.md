# Ledger — auditoria funcionalidades-pendentes-2026-10-12 (resto após Onda 1)

Projeto: Promo_Champions_V2.1 · base medida: origin/main @ f58605d8a (13/10)
Chat: execução Onda C. Atualizado em 2026-10-14.

## Mapa medido (não confiar no plano cego)

| Bloco                                  | Estado              | Prova                                                                                                                    |
| -------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Onda 1 (crons/envios/comissão/reports) | MERGED              | PRs #244,#245,#246,#261,#262,#263                                                                                        |
| A1 fe-numeros                          | MERGED              | PR #267; Speedometer.tsx sem Math.random (o que resta em FuturisticSpeedometerDashboard.tsx:233 é id randômico legítimo) |
| A2 db-kpi                              | MERGED              | PR #265; migration 20261013152000_fix_kpis_auditoria_top25.sql                                                           |
| A3 metas-functions                     | MERGED              | PR #264; 4 functions leem sales_goals/monthly_goal                                                                       |
| A4 seguranca                           | MERGED              | PR #266 (A7/A8/#18/#10/#12)                                                                                              |
| B5 lgpd                                | EM VOO outro chat   | PR #269 OPEN fix/hermes-908988-lgpd-consent-optout                                                                       |
| B6 gamificacao                         | EM VOO outro chat   | PR #271 OPEN fix/hermes-909071-gamificacao-server                                                                        |
| B7 integracoes                         | EM VOO outro chat   | PR #270 OPEN fix/hermes-908909-integracoes-meio                                                                          |
| B8 ai-hardening                        | EM VOO outro chat   | PR #268 OPEN fix/hermes-908799-prompt-injection-ai-fns                                                                   |
| C9 hidden-features                     | A FAZER (este chat) | #21 + links quebrados + CNPJ (#23 validador)                                                                             |
| C10 dedupe-metricas                    | A FAZER             | #22 escopo reduzido; cuidado: sobrepõe #264/#265 já mergeados                                                            |
| C11 dead-code                          | A FAZER             | 148 arquivos mortos; último (risco de colisão c/ PRs B)                                                                  |
| C12 docs-verdade                       | A FAZER             | reescrever 15 docs §6 — por último, anota PRs                                                                            |

## Bloqueados no Joaquim (fora do workflow)

- PAT novo em SUPABASE_ACCESS_TOKEN (aplicar ~10 migrations — canal DDL morto)
- Upgrade plano Supabase (172 fns > limite 100), function secrets, staging, credenciais Evolution/N8N/VAPID, repo privado

## Ritmo/observações

- Repo público confirmado? (auditoria diz sim; item bloqueado do Joaquim pede decisão)
- Ordem escolhida: 9 → 10 → 11 → 12
