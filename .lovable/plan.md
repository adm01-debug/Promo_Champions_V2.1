
## Plano: Migrar carros mock para os 10 novos presets

**Situação atual**
- 11 carros mock no banco com `preset_id = NULL` e cores hex antigas (#1F2937, #FF3B30, #007AFF…) que não correspondem aos 27 presets premium do `raceColors.ts`.
- Visualmente isso quebra a identidade ("Pedro" roxo simples, "Ana" amarelo simples) — eles não usam liveries (chamas, listras, pride).

**Objetivo**
- Substituir os 11 carros antigos por 10 carros novos, cada um vinculado a um `preset_id` distinto do catálogo, mantendo 10 vendedores reais.

**Mapeamento proposto (10 vendedores ↔ 10 presets)**

| # | Vendedor | Preset escolhido | Nº carro | Apelido |
|---|----------|------------------|----------|---------|
| 1 | João Silva | `ferrari-scuderia` 🏎️ | 7 | Red Force |
| 2 | Maria Santos | `power-girl` 💖 | 11 | Power Girl |
| 3 | Carlos Oliveira | `monster` 👹 | 23 | Monster |
| 4 | Pedro Lima | `powerfull-girl` 💜 | 88 | Girl Force |
| 5 | Ana Costa | `full-energy` ⚡ | 4 | Full Energy |
| 6 | Gaby | `pink` 💗 | 9 | Pink Leagues |
| 7 | JOAQUIM ROSA | `scuderia-alpha` 🔵 | 27 | Alpha |
| 8 | Closer Teste | `f1-fire-force` 🔥 | 17 | Fire Force |
| 9 | SDR Teste | `cooper-league` 🌲 | 33 | Cooper |
| 10 | Admin Teste | `gold-fury` 🏆 | 1 | Gold Fury |

→ "Teste QA" (11º) será **deletado** para fechar em 10 carros, conforme pedido.

**Execução (1 migration SQL)**
1. `DELETE FROM race_cars WHERE salesperson_id = '<Teste QA id>'` (remove o 11º).
2. `UPDATE race_cars SET preset_id, primary_color, secondary_color, car_style, nickname` para cada um dos 10, copiando exatamente os valores do preset correspondente em `raceColors.ts` (primary, secondary, style).
3. Cascata limpa automaticamente eventuais `race_events`/`race_powerups` do QA via FK ON DELETE CASCADE existente.

**Por que migration UPDATE em vez de DELETE+INSERT**
- Preserva os `id`s dos carros → não invalida `race_events`, `race_leaderboard_view`, snapshots e referências em hooks/cache.
- Trigger `validate_race_event` (Round 3) continua válida.

**Entregável**
- 1 migration SQL idempotente atualizando os 10 carros + removendo o QA.
- Sem mudanças em código React (os hooks já leem `preset_id` via `getPresetById`/`inferPresetFromColors`).

Após aplicar, o preview de `/race-arena/closer` mostrará os 10 carros com liveries premium (chamas, listras, pride, etc.) em vez dos blocos de cor sólida atuais.
