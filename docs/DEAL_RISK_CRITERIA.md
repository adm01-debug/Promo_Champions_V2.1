# Critério canônico de "deal em risco"

Auditoria top-25 #22: existiam 4 definições diferentes de "risco" espalhadas
pelo código. Este documento fixa a definição canônica e mapeia as lentes por
superfície — cada tela continua podendo ter sua lente, desde que rotulada.

## Definição canônica

**`deal_health_scores.health_score < 50`** — mesma linha de corte usada por
`deal-risk-digest` (`HEALTH_THRESHOLD`) e pelas superfícies de Deal Health.
Quando alguém perguntar "quantos deals estão em risco", a resposta oficial é
essa consulta.

## Lentes por superfície (não são a definição canônica)

| Superfície | Rótulo na UI | Detector | Critério |
| --- | --- | --- | --- |
| Pipeline → `AtRiskDealsPanel` | "Deals em Risco — inatividade" | `useAtRiskDeals.ts` (client-side) + `detect-at-risk-deals` (IA por deal) | Heurística local: inatividade ≥48h, estagnação ≥7d, engajamento <2, anomalia de valor, amount alto + inativo >72h |
| Deal Intelligence → `StuckDealsPanel` | "Deals Presos" | `detect-stuck-deals` | Tempo no estágio ≥ p75/p90 da `stage_velocity_baselines` (lente de velocidade) |
| Win-Loss → `AtRiskDealsFromPatterns` | "Deals em risco — padrões de loss" | `detect-winloss-at-risk` | Score determinístico (estagnação 50 + alinhamento de valor 25 + match de estágio 25) ≥ `DEAL_RISK_THRESHOLD = 40` (`_shared/winloss-contract.ts`) |
| Digest de notificações | — | `deal-risk-digest` | **Canônico**: `health_score < 50` |

Decisão de produto pendente: nenhuma das lentes foi unificada num único score —
a escolha deliberada é rotular cada superfície com seu critério e manter
`health_score < 50` como a métrica oficial de contagem.
