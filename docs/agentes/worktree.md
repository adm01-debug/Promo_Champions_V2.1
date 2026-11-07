# Isolamento por worktree (trabalho local)

Movido do antigo `AGENTS.md` (seção "GIT: Isolamento Worktree") na limpeza das instruções para agentes. O nome da branch segue a regra 5.4 do `AGENTS.md` (`claude/<tipo>-<slug>-<AAMMDD-HHMM>`); o esquema `fix/hermes-<id>-<descricao>` abaixo é o formato original do Hermes Agent e vale só para esse executor.

**NUNCA usar `git checkout -b` diretamente no checkout principal.** Sempre criar worktree isolado:

```bash
# 1. Gerar ID único
HERMES_BRANCH_ID="{{ h$(date +%s | tail -c 7) }}"
BRANCH="fix/hermes-${HERMES_BRANCH_ID}-<descricao>"
WORKSPACE="$HOME/hermes-workspaces/chat-${HERMES_BRANCH_ID}"

# 2. Criar worktree
git worktree add "$WORKSPACE" -b "$BRANCH" && cd "$WORKSPACE"

# 3. Verificar isolamento
[ "$(git branch --show-current)" = "$BRANCH" ] || exit 1

# ... trabalhar, commit, push, PR, merge ...

# 4. Cleanup obrigatório
git branch -D "$BRANCH"
git worktree remove "$WORKSPACE" --force
git worktree prune
```

**Por quê:** múltiplos agentes/chats no mesmo repo = colisão de branches.

## PR Flow

branch → commit → push → PR via GitHub → CI → merge squash → delete branch.
Workers/editores NUNCA mexem em git/branches — só o orquestrador.

**Nunca usar `git commit --no-verify`.** Os hooks de pre-commit existem para pegar erros antes do push; quem garante a qualidade é o CI (`pr-checks.yml`), não o atalho. Se um hook falhar, corrija o problema em vez de pular o hook.
