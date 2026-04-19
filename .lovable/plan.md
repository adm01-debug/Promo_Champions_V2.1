
O preset "The Panther" (provavelmente id `panther` ou similar) precisa ser renomeado para "Phanter Group". Preciso localizar o id exato em `src/components/race/raceColors.ts` antes de aplicar.

Plano:
1. Localizar o preset com `name: 'The Panther'` em `src/components/race/raceColors.ts`.
2. Renomear `name` para `'Phanter Group'`, mantendo id, cores, style e demais propriedades intactos.

Observação: já existe um preset `f1-phanter-group` (estilo F1, preto/dourado). Este é um preset diferente (estilo Panther, laranja/preto na imagem). Serão dois presets distintos com o mesmo `name` exibido — se preferir nomes únicos, me avise para diferenciar (ex: "Phanter Group GT").
