
Próxima: **Melhoria #3/20 — Empty States Cinematográficos** quando não há season ativa.

## Plano

### Problema atual
Quando `season` é null, `RaceArenaView` renderiza um aviso simples sem impacto visual. Precisa virar uma cena cinematográfica que motive o admin a criar uma season e oriente o piloto.

### Solução
Novo componente `RaceEmptyState.tsx` (~180L) em `src/components/race/`:
- **Ilustração SVG procedural**: pista vazia em perspectiva com bandeira quadriculada (`CheckeredFlag`) ondulando no horizonte + carro silhueta pontilhado na largada (aguardando)
- **Headline Sora**: "A pista está silenciosa" / subtítulo Inter explicando estado
- **Variantes por role**:
  - `isAdmin`: CTA primário "Iniciar Nova Temporada" → abre `StartSeasonDialog` + secundário "Ir para Admin Console"
  - piloto: mensagem "Aguardando o gestor abrir a próxima corrida" + botão ghost "Ver histórico de campeões"
- **Animações framer-motion**: bandeira ondulando contínuo, fade-in sequencial (ilustração → texto → CTAs), partículas de poeira sutis na pista
- **Decoração**: gradiente radial sutil, padrão de xadrez no rodapé do card, glow em volta da ilustração

### Integração
- `RaceArenaView.tsx`: substituir o bloco `!season ? (...)` atual por `<RaceEmptyState roleType={roleType} isAdmin={isAdmin} onStartSeason={() => setStartOpen(true)} />`
- Exportar em `src/components/race/index.ts`

### Padrões
- Semantic tokens (sem cores hardcoded), Sora título / Inter corpo, ≤200L, reaproveita `CheckeredFlag` e `Button`
- A11y: `role="status"`, `aria-live="polite"`, foco gerenciado nos CTAs

### Próximas (preview da fila)
#4 Transição Hub↔Pistas (motion shared layout) → #5 Painel Próxima Meta no sidebar → #6 Combo Streak indicator → ... até #20.
