# Plano de Recuperação de Desastres (DR Plan)

## 1. Estratégia de Backup
- **Banco de Dados:** Backups diários automáticos via Supabase (retenção de 7 a 30 dias conforme o plano).
- **Point-in-Time Recovery (PITR):** Habilitado para permitir restauração em qualquer segundo nos últimos 7 dias.
- **Código:** Repositório Git hospedado no GitHub com redundância geográfica.

## 2. Procedimentos de Recuperação

### 2.1 Falha Crítica no Banco de Dados
1. Notificar a equipe de SRE/DevOps.
2. Avaliar a extensão dos danos.
3. Se houver corrupção de dados massiva, iniciar restauração via PITR:
   - Dashboard Supabase -> Database -> Backups -> PITR.
   - Selecionar o timestamp imediatamente anterior ao incidente.

### 2.2 Indisponibilidade Regional (Cloud Provider)
1. Monitorar o status do Supabase/AWS.
2. Caso a indisponibilidade exceda o RTO (Recovery Time Objective) de 4 horas:
   - Considerar o redirecionamento do tráfego para uma região secundária (se configurado).

### 2.3 Perda de Acesso (Secrets/Auth)
1. Utilizar as chaves mestras de recuperação (Recovery Keys) armazenadas no cofre de senhas da empresa.
2. Rotacionar todas as chaves de API afetadas imediatamente.

## 3. Matriz de Contatos
- **Responsável Técnico:** CTO / Lead Dev
- **Suporte Supabase:** [https://supabase.com/dashboard/support/new](https://supabase.com/dashboard/support/new)

## 4. Testes de DR
- Um teste de restauração de backup deve ser realizado trimestralmente em ambiente de staging para garantir a integridade dos dados.
