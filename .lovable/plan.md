
Vou substituir a pista oval por um circuito serpenteante (estilo F1/Mario Kart top-down) com curvas variadas, mantendo o sistema de progresso 0..1 dos carros.

## Mudança central
Em `raceTrackHelpers.ts`, reescrever `getPositionOnTrack(progress)` para seguir um **path SVG fechado serpenteante** ao invés de uma elipse. Estratégia:

1. Definir um path SVG fechado (`TRACK_PATH`) com curvas Bezier formando um circuito tipo "8 alongado" / serpentina dentro do viewBox 1000x600
2. Usar uma instância invisível de `SVGPathElement` via `document.createElementNS` ou pré-computar pontos amostrando o path com matemática Bezier
3. **Solução prática sem DOM**: pré-computar uma lookup table de ~400 pontos ao longo do path usando aproximação Bezier cúbica, exportar como array e interpolar por progresso

## Implementação

**1. `raceTrackHelpers.ts`**:
- Definir `TRACK_PATH_D` (string SVG path) — circuito serpenteante fechado com 6-8 curvas
- Função `samplePath(d, n)` que gera array de `{x, y}` amostrando o path manualmente (parser de comandos M/C/Z + De Casteljau para cúbicas)
- Pré-calcular `TRACK_POINTS = samplePath(TRACK_PATH_D, 400)` no module-load
- `getPositionOnTrack(progress, laneOffset)` → indexa `TRACK_POINTS`, calcula tangente entre vizinhos, aplica offset perpendicular para a raia
- Exportar `TRACK_PATH_D` para os componentes desenharem

**2. `TrackAsphalt.tsx`** — reescrever:
- Usar `<path d={TRACK_PATH_D}>` para asfalto (stroke largo cinza ~70px)
- Run-off bege: mesmo path com stroke ainda mais largo (~90px) bege, renderizado abaixo
- Bordas brancas: mesmo path com stroke fino branco
- Linha central tracejada: mesmo path com stroke branco dasharray
- Miolo verde: não precisa, gramado já está abaixo
- Checkpoints: pontos no path em progresso 0.25, 0.5, 0.75 com pequena marca perpendicular

**3. `TrackStartGantry.tsx`** — usar `getPositionOnTrack(0)` (já compatível) para posicionar a faixa xadrez perpendicular ao path

**4. `TrackBarriers.tsx`** — já usa `getPositionOnTrack`, reposicionar offsets para fora da pista (perpendicular ao path)

**5. `TrackPond.tsx`** — reposicionar lago para uma área "vazia" do circuito (não no centro 500,300 que pode ser cruzada pela pista)

**6. `TrackScenery.tsx`** — manter, ajustar posições de árvores/prédios para áreas livres do novo traçado

**7. `RaceArena.tsx`** — `lane = (idx - sorted.length / 2) * 8` continua válido (laneOffset perpendicular)

## Padrões
- ≤200L/arquivo, SVG puro, zero deps
- Path desenhado **uma única vez** (string constante), amostragem **uma única vez** no module-load → zero overhead em render
- Sistema de progresso dos carros 100% preservado (mesma assinatura `getPositionOnTrack`)

## Próximo passo
Implementar agora.
