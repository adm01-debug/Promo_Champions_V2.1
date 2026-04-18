
## Mudança: Pista horizontal → vertical

Hoje o `TRACK_VIEWBOX` é 1000×600 (paisagem). O usuário tem muito espaço vertical sobrando e quer aproveitá-lo. Plano:

### 1. Inverter o viewBox e o path da pista
Em `src/components/race/raceTrackHelpers.ts`:
- Trocar `TRACK_VIEWBOX` para `{ width: 600, height: 1000 }` (retrato).
- Reescrever `TRACK_PATH_D` para um oval estendido **vertical** (retas longas verticais nas laterais, curvas em cima/embaixo, mantendo a chicane suave no meio de uma das retas).
- Recalcular `CHECKPOINTS`, `SECTOR_BOUNDARIES`, `DRS_ZONES` para o novo traçado (mesmas proporções, novo eixo).
- Linha de largada/chegada agora horizontal no topo.

### 2. Reposicionar todos os elementos do infield
Coordenadas atuais assumem 1000×600. Atualizar para 600×1000:
- `TrackPond.tsx` — lago + ilha + palmeira reposicionados ao centro (cx≈300, cy≈560).
- `TrackScenery.tsx` — paddock, garagens da pit lane, arquibancadas, marshal posts, helicóptero (orbit elíptica vertical), árvores externas/internas.
- `TrackGrass.tsx` — recalcular `lightBlobs`/`darkBlobs` para o novo canvas vertical.
- `TrackStartGantry.tsx` — funciona automaticamente (usa `getPositionOnTrack(0)`).
- `TrackBarriers.tsx` — funciona automaticamente (usa offsets do path).

### 3. Ajustar o container externo
Em `RaceArena.tsx`:
- O `<svg>` usa `preserveAspectRatio="xMidYMid meet"` então adapta sozinho.
- O wrapper externo (na page que monta a arena) hoje tem altura limitada para layout horizontal. Vou trocar a classe de altura para `aspect-[3/5]` (ou similar) e/ou `min-h-[78vh]` para o SVG vertical preencher a tela.
- MiniMap, Timing Tower, ReplayButton e CommentaryBubble já são overlays absolutos — continuam funcionando, só revisar posicionamento (timing tower no canto superior direito; minimap inferior esquerdo continuam ok no formato retrato).

### 4. Pit lane vertical
A pit lane hoje é horizontal acompanhando a reta superior. No layout vertical ela passa a acompanhar a reta lateral esquerda (ou direita) — refazer geometria das 6 garagens em coluna.

### 5. Sem mudanças de comportamento
Toda a lógica de progresso (0..1), ultrapassagens, DRS, setores, replay, comentarista permanece idêntica — depende apenas do `TRACK_PATH_D` via `getPositionOnTrack()`.

### Arquivos a editar
- `src/components/race/raceTrackHelpers.ts` — viewBox + path vertical + checkpoints/sectors/DRS
- `src/components/race/track/TrackPond.tsx` — recolocar lago
- `src/components/race/track/TrackScenery.tsx` — paddock, pit lane vertical, helicóptero, árvores
- `src/components/race/track/TrackGrass.tsx` — manchas reposicionadas
- `src/pages/RaceArenaView.tsx` (ou onde o `RaceArena` é renderizado) — altura/aspect do container

Sem perguntas. Executo direto.
