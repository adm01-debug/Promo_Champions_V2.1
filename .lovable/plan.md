
# Plano: Pista Top-Down Estilo Ilustração Vetorial (referência anexada)

## Análise da referência (pixel-by-pixel)
A imagem enviada mostra um **circuito serpenteante top-down** com características muito diferentes da pista oval atual:

1. **Forma**: circuito orgânico, sinuoso, com múltiplas curvas (S-curves, hairpin, chicane) — NÃO é uma elipse
2. **Asfalto cinza claro uniforme** (#a0a4a8 aprox), sem gradient radial dramático
3. **Bordas bege/areia** (#d4c5a0) — run-off areas largas em volta de toda a pista
4. **Linhas brancas tracejadas** no centro da pista separando 2 raias (ida/volta)
5. **Borda branca contínua** em ambos os lados do asfalto
6. **Barreiras zebradas vermelho/branco verticais** (não rumble strips horizontais) posicionadas em pontos estratégicos como obstáculos/divisores
7. **Gramado verde médio uniforme** (#5fa358 aprox) — sem mowing stripes, sem texturas complexas
8. **Árvores estilizadas top-down**: massa de bolinhas verdes formando copas circulares/orgânicas, sombra suave
9. **Estruturas cinzas top-down**: garagens, prédios pit, torres de controle como retângulos/quadrados cinza simples
10. **Lago azul** orgânico no miolo (decorativo)
11. **Linha de chegada xadrez preto/branco** simples (não pórtico 3D)
12. **Carros pequenos top-down vetoriais** — F1, karts, stock cars, caminhões coloridos
13. **Estética geral**: ilustração vetorial flat/clean, NÃO cinematográfica/realista

## Diagnóstico do que está errado hoje
A Fase A entregou uma estética **cinematográfica AAA** (skybox, golden hour, vinheta, mountains, gradient radial dramático no asfalto, rumble strips em todo o perímetro, pórtico 3D start/finish, holofote central, glow amarelo nas linhas). Isso é o **OPOSTO** do estilo flat/vetorial top-down da referência. Precisa ser **completamente repensado**.

## Estratégia: reescrever todas as camadas track/* com estética flat top-down

### Mudanças estruturais

**1. `raceTrackHelpers.ts` — manter forma oval mas com path serpenteante visual**
- Manter cálculo elíptico de posição dos carros (compatibilidade com sistema de progresso)
- Adicionar constante de **lane width** para 2 raias (ida/volta) com linha tracejada central

**2. `TrackSky.tsx` → DELETAR** (não há céu em vista top-down)

**3. `TrackGrass.tsx` — reescrever**
- Verde sólido `#5fa358` (sem mowing stripes, sem gradient, sem turbulence)
- Manter apenas como background

**4. `TrackAsphalt.tsx` — reescrever do zero**
- Faixa bege externa (run-off) larga `#d4c5a0`
- Asfalto cinza claro `#9ca3af` uniforme (sem gradient radial)
- Borda branca contínua interna+externa do asfalto (2px)
- Linha central tracejada branca (separa 2 raias) `#ffffff` dasharray "12 8"
- REMOVER: rumble strips zebrados em todo perímetro, skid marks, glow amarelo, highlight especular
- Miolo verde igual ao gramado externo

**5. `TrackStartGantry.tsx` → reescrever como linha xadrez plana**
- Apenas faixa retangular com padrão xadrez 8x8 preto/branco atravessando a pista
- SEM pórtico 3D, postes, bandeirinhas, placa "START/FINISH"

**6. `TrackDefs.tsx` — limpar**
- Remover skyGradient, asphaltGradient, vignette, centerSpotlight, yellowGlow, mountainGradient
- Manter apenas: pattern checkered, filtros leves de sombra para árvores/estruturas

**7. NOVO `TrackBarriers.tsx`** — barreiras zebradas vermelho/branco verticais
- 6-8 retângulos verticais (~30x80) zebrados posicionados em pontos estratégicos das curvas
- Sombra suave abaixo

**8. NOVO `TrackScenery.tsx`** — árvores + estruturas top-down
- **Árvores**: clusters de 5-8 círculos verdes (`#3a7a3a`, `#4a8a4a`, `#5a9a5a`) sobrepostos formando copa orgânica + sombra elipse `rgba(0,0,0,0.15)` deslocada 4px
- 12-15 árvores distribuídas no gramado externo + miolo
- **Estruturas pit/garagens**: 3-4 retângulos cinza `#c0c4c8` com borda escura, leve gradient pra simular volume top-down (sombra interna), pequenos quadrados representando portas
- 1 estrutura "torre de controle" circular cinza com topo

**9. NOVO `TrackPond.tsx`** — lago decorativo no miolo
- Path orgânico azul `#3b8cc4` com borda mais escura + reflexo branco sutil

**10. `RaceTrack.tsx` — recompor camadas**
```
TrackGrass (background verde)
TrackPond (lago no miolo)
TrackScenery (árvores externas — atrás da pista)
TrackAsphalt (run-off bege + asfalto + linhas)
TrackBarriers (barreiras zebradas)
TrackStartGantry (linha xadrez)
TrackScenery (árvores internas + estruturas pit)
[children = carros]
```
REMOVER: holofote central, vinheta cinematográfica

**11. `RaceArena.tsx` — ajustar background**
- Trocar `bg-gradient-to-b from-sky-200 to-sky-100` por verde sólido matching o gramado
- Remover sombra exagerada

**12. `RaceCar.tsx` — leves ajustes**
- Manter estilo top-down já existente (está coerente com a referência)
- Aumentar levemente escala default para 1.1 para melhor leitura
- Suavizar sombra (já existe)

## Padrões respeitados
- SVG puro, zero deps novas
- ≤200L por arquivo (TrackAsphalt e TrackScenery são os maiores ~150L)
- Cores hex literais (cenário visual, não tokens de UI)
- Manter sistema de progresso/posicionamento dos carros intacto
- Strict TS

## Arquivos
- **Criar**: `src/components/race/track/TrackBarriers.tsx`, `src/components/race/track/TrackScenery.tsx`, `src/components/race/track/TrackPond.tsx`
- **Reescrever**: `TrackGrass.tsx`, `TrackAsphalt.tsx`, `TrackStartGantry.tsx`, `TrackDefs.tsx`, `RaceTrack.tsx`
- **Deletar**: `TrackSky.tsx` (não usado em vista top-down)
- **Editar**: `RaceArena.tsx` (background), `RaceCar.tsx` (escala)

## Resultado esperado
Pista flat top-down vetorial idêntica em estética à referência: gramado verde com lago azul, asfalto cinza serpenteante com run-off bege, linhas brancas tracejadas, barreiras zebradas vermelho/branco verticais, árvores como clusters de bolinhas verdes, prédios pit cinza, linha de chegada xadrez plana. Os carros (já top-down) ficarão coerentes visualmente.
