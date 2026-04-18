
# Plano: Novo traçado do circuito + uso do espaço vertical

## Problema
1. O path serpenteante atual tem uma protuberância no topo-esquerda que ficou com formato fálico — precisa ser redesenhado
2. A pista não usa bem a altura disponível (viewBox 1000x600, mas o circuito fica concentrado no meio-topo)

## Solução

### 1. Novo `TRACK_PATH_D` em `raceTrackHelpers.ts`
Substituir por um circuito tipo **"figura-8 horizontal" ou "circuito clássico de F1 estilo Suzuka/Interlagos"** que:
- Ocupa toda a altura útil (y: 60 → 540, usando ~80% do viewBox vertical)
- Ocupa toda a largura (x: 80 → 920)
- Tem curvas balanceadas e simétricas (sem protuberâncias estranhas)
- Possui variedade: 2 retas longas, 1 hairpin, 1 chicane, 1 curva ampla

**Traçado proposto** (formato "estádio com chicane interna"):
```
Start (direita-meio) → reta superior longa → hairpin esquerda no topo →
desce em S suave pelo lado esquerdo → curva ampla embaixo-esquerda →
reta inferior → chicane direita embaixo → sobe pelo lado direito →
fecha no start
```

Path Bezier aproximado:
```
M 880 300                              (start)
C 880 150, 750 80, 500 80              (reta superior + curva topo)
C 350 80, 200 100, 140 200             (hairpin topo-esquerda)
C 100 280, 140 360, 220 380            (S esquerdo descendo)
C 320 400, 280 480, 200 500            (curva ampla baixo-esquerda)
C 350 540, 550 540, 650 500            (reta inferior)
C 720 480, 680 420, 760 420            (chicane direita)
C 860 420, 880 380, 880 300            (sobe direita + fecha)
Z
```

### 2. Reposicionar elementos cenográficos
- **`TrackPond.tsx`**: lago no espaço livre central-baixo (~450, 280) que o novo traçado deixa vazio
- **`TrackScenery.tsx` (inner)**: pit buildings no centro-direita (~550, 280) onde há área livre
- **`TrackScenery.tsx` (outer)**: árvores nos 4 cantos + bordas, aproveitando a nova distribuição
- **`TrackBarriers.tsx`**: reposicionar barreiras zebradas nas curvas reais do novo traçado (hairpin topo-esquerda, chicane baixo-direita, curva ampla baixo-esquerda)

### 3. Ajuste de `RaceArena.tsx`
- Garantir que o container SVG estique verticalmente (revisar se há `max-height` limitando) para usar todo o espaço disponível

### Padrões
- Apenas reescrever a string `TRACK_PATH_D` + reposicionar coordenadas estáticas dos componentes de cenário
- Sistema de progresso 0..1 e amostragem do path **100% preservados** (não mexe na lógica)
- ≤200L/arquivo mantido

## Arquivos
- **Editar**: `raceTrackHelpers.ts` (novo path), `TrackPond.tsx`, `TrackScenery.tsx`, `TrackBarriers.tsx`, `RaceArena.tsx` (verificar altura)
