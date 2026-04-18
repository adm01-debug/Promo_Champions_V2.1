
Olhando o print, os principais problemas visuais são:

1. **Pista serpentina caótica** — curvas desconexas, larguras inconsistentes, parece "desenhada à mão"
2. **Curbs vermelho/branco fragmentados** — aparecem como pontilhado quebrado, não como faixa sólida
3. **Carros com nomes rotacionados/invertidos** — "Carlos" e "João" aparecem de cabeça pra baixo
4. **Infield vazio e desorganizado** — prédio sozinho + lago genérico no meio
5. **Árvores com sombra preta dura** — parecem stickers colados
6. **Falta hierarquia visual** — tudo compete por atenção

# Plano: Redesign visual nível Awwwards

## 1. Pista — geometria limpa estilo "circuito de kart"
- Substituir path serpentino por **circuito oval estendido com 1 chicane suave** (estilo Suzuki Kart / Mario Circuit 1)
- Largura de pista **constante** (72px) com curvas usando arcos `A` SVG ao invés de bezier livre
- Adicionar **gradiente radial sutil** no asfalto (centro mais claro, bordas mais escuras) para dar profundidade

## 2. Curbs — faixa vermelho/branco contínua e limpa
- Renderizar curbs como **dois paths paralelos sólidos** (não dashed sobreposto)
- Usar `strokeDasharray` calibrado por comprimento de curva para alinhar perfeitamente
- Aplicar curbs **só nas curvas** (não nas retas) — mais realista

## 3. Carros — labels sempre legíveis + visual premium
- Nome do piloto sempre **horizontal** (counter-rotate ao path rotation)
- Adicionar **chip de fundo translúcido** atrás do nome (`bg-black/60` + blur)
- Sombra projetada **mais suave** (blur 8, opacity 0.3) ao invés de elipse dura
- Reflexo/highlight no capô (gradient linear branco 30%)

## 4. Infield — composição cuidada
- **Lago** reposicionado + ilha pequena com palmeira no centro
- **Pit building** alinhado com grid (não centralizado solto)
- Adicionar **paddock** (linhas brancas marcando boxes)
- Hélicóptero/drone estilizado decorativo (opcional, sutil)

## 5. Cenário — árvores e ambiente
- Árvores com **sombra projetada suave** (filter dropShadow blur 2) ao invés de elipse preta
- Variar **3 tamanhos** de árvore com escala randômica determinística
- Adicionar **arquibancadas** nas retas longas (retângulos coloridos pixelados representando público)
- **Bandeiras de patrocinador** decorativas nas barreiras

## 6. Grama — textura mais rica
- Manter blobs claros/escuros mas adicionar **padrão sutil de listras** (corte de gramado em diagonal) no infield
- Vinheta nas bordas mais pronunciada

## 7. Polish geral
- **Filtro global de saturação leve** (+10%) no SVG inteiro
- Sombra do SVG sobre o container (drop-shadow no wrapper)
- Border radius do container 24px com leve inner shadow

## Arquivos a editar
- `src/components/race/raceTrackHelpers.ts` — novo path circuito oval+chicane
- `src/components/race/track/TrackAsphalt.tsx` — curbs sólidos só em curvas + gradiente
- `src/components/race/track/TrackScenery.tsx` — paddock, arquibancadas, árvores variadas
- `src/components/race/track/TrackPond.tsx` — lago + ilha + palmeira
- `src/components/race/track/TrackDefs.tsx` — novos gradients/filters
- `src/components/race/RaceCar.tsx` — label counter-rotate + chip + sombra suave
- `src/index.css` — tokens novos (arquibancada, paddock)

Sem perguntas. Executo as 7 melhorias em sequência, uma por commit, até o resultado estar nível "Mario Kart 2D pro".
