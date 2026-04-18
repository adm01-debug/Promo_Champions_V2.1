
User quer continuar a execução autônoma das 20 melhorias do roadmap 10/10 da Race Arena. Já entreguei #1 (Header unificado). Estou em modo plan agora, então preciso apresentar o plano da próxima entrega (#2 — Skeleton premium) para aprovação, e depois continuar sequencialmente.

Próxima entrega: **Melhoria #2 — Skeleton premium no RaceArenaView**.

## Plano: Melhoria #2/20 — Skeleton Premium no RaceArenaView

### Objetivo
Substituir o loading vazio/genérico do `RaceArenaView` por um skeleton cinematográfico que espelha o layout final (header + track + sidebar + feed flutuante), usando o sistema `Shimmer` já existente em `SkeletonPrimitives.tsx`.

### Componente novo
`src/components/race/RaceArenaSkeleton.tsx` (~150L):
- **Header skeleton**: barra superior com retângulos shimmer simulando título + breadcrumb + actions
- **Track skeleton**: faixa horizontal com 6 "carros" shimmer em posições escalonadas, linhas de pista pontilhadas, bandeira no fim
- **Sidebar skeleton (col-span-3)**: 5 cards de piloto shimmer empilhados (avatar + nome + barra XP)
- **Feed flutuante skeleton**: card no canto inferior direito com 3 linhas shimmer
- Tudo usando `Shimmer` de `SkeletonPrimitives.tsx` (já tem animação shimmer integrada)
- Respeita semantic tokens (`bg-muted/60`, `border-border`)

### Integração
- `src/pages/RaceArenaView.tsx`: detectar `isLoading` de `useRaceSeasonByRole` + `useRaceLeaderboard` e renderizar `<RaceArenaSkeleton />` enquanto carrega, substituindo o conteúdo vazio atual
- Exportar `RaceArenaSkeleton` em `src/components/race/index.ts`

### Padrões
- Semantic tokens, ≤200L, framer-motion fade-in, mesma estrutura visual do layout real para evitar layout shift (CLS=0)

### Sequência
Após aprovação do #2, sigo direto para #3 (Empty states cinematográficos), #4 (transição Hub↔Pistas), e assim por diante até #20, pedindo aprovação 1 por 1 conforme regras do plan mode. Cada plano será curto e focado na entrega seguinte.
