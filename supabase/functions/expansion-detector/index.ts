import { getCorsHeaders(req) } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.4';
import { chunkedIn } from '../_shared/chunked-in.ts';

interface Playbook {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, unknown> | null;
  expansion_type: string;
  recommended_action: string | null;
  is_active: boolean;
}

interface Account {
  id: string;
  tier: string;
  account_score: number;
  annual_revenue: number | null;
  owner_id: string | null;
}

function evalAccount(
  pb: Playbook,
  acc: Account,
  usage?: { adoption_score?: number }
): { match: boolean; confidence: number; estValue: number } {
  const cfg = pb.trigger_config ?? {};
  let match = false;
  let confidence = 60;
  switch (pb.trigger_type) {
    case 'tier': {
      const tiers = (cfg.tiers as string[]) ?? [];
      match = tiers.includes(acc.tier);
      confidence = match ? 75 : 0;
      break;
    }
    case 'health_score': {
      const min = (cfg.min_score as number) ?? 70;
      match = acc.account_score >= min;
      confidence = Math.min(95, 50 + Math.floor((acc.account_score - min) / 2));
      break;
    }
    case 'usage_threshold': {
      const min = (cfg.min_adoption as number) ?? 60;
      const a = usage?.adoption_score ?? 0;
      match = a >= min;
      confidence = Math.min(95, 50 + Math.floor((a - min) / 2));
      break;
    }
    default:
      match = false;
  }
  const baseValue = (acc.annual_revenue ?? 0) * 0.2;
  return { match, confidence, estValue: Math.round(baseValue) };
}

Deno.serve(
  withRequestId('expansion-detector', async (req, _ctx) => {
    if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });

    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: pbs } = await supabase
        .from('expansion_playbooks')
        .select(
          'id, name, trigger_type, trigger_config, expansion_type, recommended_action, is_active'
        )
        .eq('is_active', true)
        .limit(200);
      const playbooks = (pbs ?? []) as Playbook[];
      if (playbooks.length === 0) {
        return new Response(
          JSON.stringify({ ok: true, playbooks: 0, opportunities_created: 0 }),
          {
            headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
          }
        );
      }

      // Add limits to prevent full table scans
      const [accsRes, usageRes] = await Promise.all([
        supabase
          .from('accounts')
          .select('id, tier, account_score, annual_revenue, owner_id')
          .limit(2000),
        supabase
          .from('product_usage_summary')
          .select('account_id, adoption_score')
          .limit(5000),
      ]);
      const accounts = (accsRes.data ?? []) as Account[];
      const usageMap = new Map(
        (usageRes.data ?? []).map(u => [
          u.account_id as string,
          { adoption_score: Number(u.adoption_score ?? 0) },
        ])
      );

      // Pre-fetch ALL active opportunities for all accounts in one batch (was N×M per-pair queries)
      const accountIds = accounts.map(a => a.id);
      const existingOpps = await chunkedIn<{ account_id: string; playbook_id: string }>(
        accountIds,
        chunk =>
          supabase
            .from('expansion_opportunities')
            .select('account_id, playbook_id')
            .in('account_id', chunk)
            .in('status', ['identified', 'qualified', 'proposed']),
        { parallel: true, label: 'expansion-detector.existing' }
      );
      const existingSet = new Set<string>();
      for (const opp of existingOpps)
        existingSet.add(`${opp.account_id}:${opp.playbook_id}`);

      // Evaluate all (playbook × account) combos in memory — zero DB calls
      let skipped = 0;
      const newOppRows: Array<{
        account_id: string;
        playbook_id: string;
        type: string;
        estimated_value: number;
        status: string;
        confidence_score: number;
        owner_salesperson_id: string | null;
        notes: string;
      }> = [];

      for (const pb of playbooks) {
        for (const acc of accounts) {
          const r = evalAccount(pb, acc, usageMap.get(acc.id));
          if (!r.match) continue;
          if (existingSet.has(`${acc.id}:${pb.id}`)) {
            skipped++;
            continue;
          }
          newOppRows.push({
            account_id: acc.id,
            playbook_id: pb.id,
            type: pb.expansion_type,
            estimated_value: r.estValue,
            status: 'identified',
            confidence_score: r.confidence,
            owner_salesperson_id: acc.owner_id,
            notes:
              pb.recommended_action ??
              `Gerado automaticamente pelo playbook "${pb.name}"`,
          });
        }
      }

      // Single batch insert for all new opportunities (was N×M individual inserts)
      let created = 0;
      if (newOppRows.length > 0) {
        const { error } = await supabase
          .from('expansion_opportunities')
          .insert(newOppRows);
        if (!error) created = newOppRows.length;
        else console.error('expansion-detector insert error:', error);
      }

      return new Response(
        JSON.stringify({
          ok: true,
          playbooks: playbooks.length,
          accounts: accounts.length,
          opportunities_created: created,
          skipped_existing: skipped,
        }),
        {
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        }
      );
    } catch (err) {
      console.error('expansion-detector error:', err);
      return new Response(
        JSON.stringify({ error: err instanceof Error ? err.message : 'unknown' }),
        {
          status: 500,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        }
      );
    }
  })
);
