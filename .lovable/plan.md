
# Plano: Teste E2E da pista serpenteante

## Objetivo
Validar visualmente que os carros se movem corretamente em todas as curvas do novo circuito em `/race-arena/closer` e `/race-arena/sdr`.

## Passos
1. `navigate_to_sandbox` → `/race-arena/closer` (viewport 1561x861)
2. `screenshot` inicial — verificar render da pista, posições iniciais dos carros, cenário (lago, prédios, árvores, barreiras)
3. Aguardar ~3s e tirar 2-3 screenshots em sequência para capturar carros em diferentes pontos do circuito (retas, hairpin, S-curve, chicane)
4. Verificar via `read_console_logs` se há erros de render
5. `navigate_to_sandbox` → `/race-arena/sdr`
6. Repetir screenshots + checagem de console

## Critérios de validação
- Carros sobre o asfalto (não cortando gramado/lago)
- Rotação dos carros alinhada à tangente da pista em curvas
- Lanes (offset perpendicular) sem sobreposição
- Linha de chegada xadrez visível e perpendicular
- Barreiras zebradas posicionadas nas curvas
- Zero erros de console relacionados a SVG/path

## Em caso de problemas
Reportar achados ao usuário antes de qualquer correção (read-only mode).
