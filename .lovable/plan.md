
**Objetivo:** Validar a implementação recente do sistema visual de líder/ranking na Race Arena (badge P1/P2/P3, aura dourada do P1, coroa flutuante, faíscas, e pílula do nome com cor da livery).

**Escopo do teste (somente o que foi implementado nas últimas 4 mudanças):**
1. Badge de rank acima do carro (`RaceCar.tsx`) — tamanho, posição, prefixo "P", cores podium.
2. Pulso contínuo do badge P1.
3. Aura dourada + glow + faíscas + coroa do líder (P1).
4. Pílula do nome (`CarHelmetTooltip.tsx`) com fundo na cor primária da livery e texto adaptativo (YIQ).

**Plano de testes (3 camadas):**

### Camada 1 — Inspeção estática de código
- Reler `src/components/race/RaceCar.tsx` confirmando: helper de cor de medalha, animação loop só quando `rank === 1`, coroa SVG presente, faíscas com delay escalonado, glow via `drop-shadow`.
- Reler `src/components/race/CarHelmetTooltip.tsx` confirmando: helper `getReadableTextColor` com cálculo YIQ correto, prop `color` aplicada ao background, fallback quando `color` é undefined.
- Verificar parsing de cores: hex (`#RRGGBB`, `#RGB`), `hsl()`, `rgb()` — validar se o helper cobre todos os formatos de `primary_color` que vêm do preset.
- Conferir se nenhum carro recebe `rank=undefined` por engano (que faria badge sumir ou pulso vazar).

### Camada 2 — Testes visuais no preview (browser tools)
- `navigate_to_sandbox` para `/race-arena-sdr` (e depois `/race-arena-closer`).
- Screenshot inicial: confirmar que todos os carros têm badge "P1/P2/P3/…" centralizado acima.
- Screenshot focado no líder: verificar aura dourada pulsando, coroa flutuando, faíscas atrás, glow no chassi.
- Screenshot dos carros P2+: confirmar que NÃO têm aura/coroa/faíscas (efeito exclusivo do P1).
- Verificar pílula do nome: cores variadas conforme livery, contraste do texto preto/branco aplicado corretamente em pelo menos 3 cores diferentes.
- Confirmar que badges P4+ usam fundo cinza escuro (`hsl(0 0% 15%)`) e não somem sobre o asfalto.

### Camada 3 — Edge cases
- Carro sem preset/cor definida → pílula deve usar fallback sem quebrar.
- Apenas 1 piloto na corrida → P1 com todos os efeitos, sem outros.
- Mudança de líder em tempo real (se houver dados ao vivo) → coroa/aura migra para o novo P1.
- Console: zero warnings/errors novos relacionados a `RaceCar` ou `CarHelmetTooltip`.
- Performance: confirmar que animações não geram jank (checar via screenshot que renderiza limpo).

### Entrega
Relatório final com:
- ✅/❌ por item testado
- Screenshots anexados via tool
- Lista de bugs encontrados (se houver) com localização exata
- Recomendações de ajuste fino (se aplicável)

**Arquivos lidos (read-only):** `RaceCar.tsx`, `CarHelmetTooltip.tsx`, hooks de leaderboard relacionados.
**Sem edições nesta etapa** — só validação. Bugs encontrados → reporto e aguardo aprovação para corrigir.
