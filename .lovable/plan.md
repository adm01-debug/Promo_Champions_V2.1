
Aplicar as 3 correções em `src/components/race/raceColors.ts`:

1. Reverter `f1-sun-tzu-force` → `name: 'Sun Tzu Force'` (mantém cores preto/dourado atuais).
2. Adicionar 3 novos presets F1 com novos ids:
   - `f1-pai-on` → "Scuderia o Pai ta ON"
   - `f1-mae-on` → "Scuderia a Mãe ta ON"
   - `f1-phanter-group` → "Phanter Group"
   - Todos com style `f1`, primary `#0a0a0a`, secondary/accent `#b8860b`, pattern `stripes`.
3. Corrigir typo no preset `black-power`: `Scudeira Black Power` → `Scuderia Black Power`.
