#!/bin/bash
# Sessão na nuvem: instala o graphify e gera/atualiza o grafo do código em graphify-out/.
# Adaptado de Zapp_Web_V2/.claude/hooks/session-start.sh: lá graphify-out/ não é versionado;
# aqui GRAPH_REPORT.md e manifest.json SÃO (docs/agentes/contexto-gerado.md) e já têm um
# auto-sync próprio (N8N, até 15 min) — por isso este hook roda `graphify update .` mas
# restaura os dois ao estado do HEAD depois, e só mantém graph.json (ignorado pelo Git desde
# a regra adicionada em .gitignore) para `graphify query/path/explain` funcionarem na sessão.
# - Só roda com CLAUDE_CODE_REMOTE=true (local usa a skill /graphify ou graph:update do Zapp;
#   aqui não existe scripts/graphify/setup.sh — a versão vem de .claude/skills/graphify/.graphify_version).
# - Assíncrono: o build leva minutos e não segura o início da sessão.
# - Pula se o grafo já foi gerado no commit atual (marca em graphify-out/.session-built-commit).
# Log de tudo (instalação inclusive): graphify-out/.session-start.log
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 900000}'

cd "${CLAUDE_PROJECT_DIR:-.}"
export PATH="$HOME/.local/bin:$PATH"
mkdir -p graphify-out
LOG=graphify-out/.session-start.log
MARCA=graphify-out/.session-built-commit

# Versão pinada pela skill interativa (fonte única deste repo; não há scripts/graphify/setup.sh
# como no Zapp), respeitando o mesmo override GRAPHIFY_VERSION.
versao_padrao="$(cat .claude/skills/graphify/.graphify_version 2>/dev/null || true)"
versao="${GRAPHIFY_VERSION:-${versao_padrao:-0.9.51}}"

exec >>"$LOG" 2>&1
echo "== $(date -u +%FT%TZ) session-start (graphify $versao)"

# O hook também dispara em resume/clear/compact, que podem cair no meio de um build de
# minutos: só um por vez neste clone. O segundo sai na hora; o primeiro termina e carimba.
exec 9>graphify-out/.session-start.lock
if ! flock -n 9; then
  echo "outro session-start já está rodando neste clone — saindo"
  exit 0
fi

# Instala/confere a versão ANTES do atalho: o grafo pode estar em dia e o binário ter sumido.
if ! graphify --version 2>/dev/null | grep -qx "graphify $versao"; then
  if command -v uv >/dev/null 2>&1; then
    uv tool install --force "graphifyy[sql]==${versao}"
  elif command -v pipx >/dev/null 2>&1; then
    pipx install --force "graphifyy[sql]==${versao}"
  else
    python3 -m pip install --user --quiet "graphifyy[sql]==${versao}"
  fi
fi
graphify --version

head_sha="$(git rev-parse HEAD)"
if [ -f graphify-out/graph.json ] && [ -f graphify-out/GRAPH_REPORT.md ] && [ "$(cat "$MARCA" 2>/dev/null)" = "$head_sha" ]; then
  echo "grafo já está no commit $head_sha — nada a fazer"
  exit 0
fi

# GRAPH_REPORT.md e manifest.json são versionados neste repo — guarda o hash deles ANTES do
# rebuild para poder restaurar depois. O `graphify update .` escreve os dois de novo (não tem
# flag para pular), e deixar "modificado" um arquivo versionado por um build local da sessão
# sujaria o worktree para o primeiro commit do agente.
antes_report="$(git hash-object graphify-out/GRAPH_REPORT.md 2>/dev/null || true)"
antes_manifest="$(git hash-object graphify-out/manifest.json 2>/dev/null || true)"

rm -f "$MARCA"
PYTHONHASHSEED=0 graphify update .

depois_report="$(git hash-object graphify-out/GRAPH_REPORT.md 2>/dev/null || true)"
depois_manifest="$(git hash-object graphify-out/manifest.json 2>/dev/null || true)"
if [ -n "$antes_report" ] && [ "$antes_report" != "$depois_report" ]; then
  git checkout -- graphify-out/GRAPH_REPORT.md
  echo "GRAPH_REPORT.md restaurado ao HEAD (o N8N do repo é quem atualiza a versão versionada)"
fi
if [ -n "$antes_manifest" ] && [ "$antes_manifest" != "$depois_manifest" ]; then
  git checkout -- graphify-out/manifest.json
  echo "manifest.json restaurado ao HEAD (o N8N do repo é quem atualiza a versão versionada)"
fi

# O build leva minutos e roda em segundo plano: se o checkout mudou no meio, não carimba —
# a próxima sessão refaz.
if [ "$(git rev-parse HEAD)" = "$head_sha" ]; then
  echo "$head_sha" > "$MARCA"
  echo "grafo pronto no commit $head_sha (graph.json local; GRAPH_REPORT.md/manifest.json preservados)"
else
  echo "HEAD mudou durante o build ($head_sha -> $(git rev-parse HEAD)); marca não gravada"
fi
