# Execução Graphify — lote E: documentação rastreável

Data: 11/09/2026. Este lote indexa somente relações Markdown explícitas entre documentos e arquivos locais. Ele não interpreta instruções contidas na documentação, não chama serviços externos e não transforma referência em prova de implementação.

## Entregas

- Índice versionado por esquema com documento, digest, classificação (`historico`, `proposta`, `decisao` ou `operacional`), origem e linha de cada link.
- Resolução segura de referências locais, ausentes, externas e que atravessam a raiz do repositório.
- Recusa de link simbólico no diretório documental.

## Simulações

Uma fixture isolada cobre documentos de plano e decisão, referência local para código, referência local ausente, URL externa e symlink. A referência ausente continua identificada como pendência; não se cria ou altera arquivo automaticamente.
