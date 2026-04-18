
Ciclo 35-40 entregue. Próximo ciclo foca em narrativa de pista, profundidade ambiental e UI lateral aproveitando o espaço do layout vertical.

# Ciclo 41-46 (rumo ao 10/10++ definitivo)

**41. Painel lateral "Race Control"** — coluna esquerda fixa (largura ~200px) aproveitando o espaço sobrando do layout vertical, exibindo: bandeira atual da corrida (verde/amarela/vermelha/xadrez), tempo decorrido da season, próximo evento (ex: "Fim em 3d 4h"), e contador de ultrapassagens totais.

**42. Bandeira amarela em ultrapassagens próximas** — quando uma ultrapassagem acontece, exibe bandeira amarela animada no Race Control por 3s + leve overlay amarelo translúcido na pista. Cria tensão visual de "incidente na pista".

**43. Sombra dinâmica do sol** — gradiente radial sutil simulando posição do sol (canto superior direito), com sombras projetadas dos carros (elipse desfocada ~8px abaixo) que se alongam levemente. Profundidade cinematográfica.

**44. Efeito de calor no asfalto** — distorção sutil (`feTurbulence` + `feDisplacementMap`) na reta principal, animada com `baseFrequency` oscilando. Imita o "heat haze" de transmissão F1 em dia quente.

**45. Pneus deixando rastro nas curvas** — quando carro passa por uma curva (chicane ou top/bottom), deixa breve rastro preto translúcido (5px, opacity 0.3, fade-out 1.5s) no asfalto. Acumula naturalmente conforme a corrida progride, máximo 30 marcas.

**46. HUD de velocidade do líder** — pequeno mostrador no canto superior esquerdo (não obstrui) mostrando "velocidade" simulada do líder (km/h baseado em delta de progresso × 1000), com agulha analógica estilo painel de carro.

## Arquivos a editar
- `src/components/race/RaceArena.tsx` — Race Control panel, bandeira amarela em overtake, HUD velocidade, integrar tire-marks
- `src/components/race/RaceControlPanel.tsx` — novo componente lateral
- `src/components/race/SpeedHUD.tsx` — novo mostrador de velocidade
- `src/components/race/track/TrackTireMarks.tsx` — novo overlay SVG de marcas de pneu
- `src/components/race/track/TrackDefs.tsx` — filter de heat haze + sombra solar
- `src/components/race/track/TrackAsphalt.tsx` — aplicar filter heat haze nas retas
- `src/components/race/RaceCar.tsx` — sombra elíptica abaixo do carro
- `src/index.css` — keyframes yellow-flag-flash + heat-haze pulse

Sem perguntas. Executo as 6 em sequência.
