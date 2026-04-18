
User wants the "Narração ao Vivo" feed to be moved to a secondary/background position so the race track (mapa) gets more horizontal space.

Current layout in `src/pages/RaceArena.tsx`:
- col-span-3 (left): Ranking Champions
- col-span-6 (middle): Race Arena (track)
- col-span-3 (right): Narração ao Vivo

The track only gets 50% of the width. Moving the feed out gives the track more room.

## Plan: Reduzir feed e expandir o mapa da corrida

### Mudança principal
Transformar o feed "Narração ao Vivo" em um painel **flutuante colapsável** no canto inferior direito, liberando todo o espaço central+direito para o mapa da pista.

### Novo layout
- **Esquerda (col-span-3)**: Ranking Champions (mantém)
- **Centro+Direita (col-span-9)**: RaceArena (mapa) — agora ocupa ~75% da largura
- **Feed**: vira `FloatingEventFeedPanel` — drawer/card flutuante posicionado `fixed bottom-4 right-4`, largura ~340px, altura ~420px, com botão de toggle (collapse/expand) e badge de contador de novos eventos

### Componente novo
`src/components/race/FloatingEventFeed.tsx`:
- Wrapper sobre o `RaceEventFeed` existente
- Estado `isOpen` (default: aberto, mas minimizável)
- Quando colapsado: pílula compacta com ícone Radio pulsante + contador
- Quando aberto: card com mesmo conteúdo do feed atual + botão X/minimize
- Animação framer-motion (slide+fade)
- z-index acima do conteúdo, abaixo do FAB do Copilot

### Edits
- `src/pages/RaceArena.tsx`: remover coluna direita do feed, mudar grid para 3+9, montar `<FloatingEventFeed>` como overlay fora do grid
- `src/components/race/index.ts`: exportar novo componente

### Resultado
Mapa da corrida ganha ~50% mais largura útil; feed continua acessível mas em segundo plano, sem competir com o protagonista (a pista).
