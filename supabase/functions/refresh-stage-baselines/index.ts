import { getCorsHeaders } from '../_shared/cors.ts';
import { chunkedIn } from '../_shared/chunked-in.ts';
import { withRequestId } from '../_shared/request-id.ts';
import {
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from '../_shared/auth-client.ts';

function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

Deno.serve(
  withRequestId('refresh-stage-baselines', async (req, _ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    try {
      // Recalcula baselines globais e por owner de todo o pipeline — exige
      // JWT de usuário com papel admin/manager.
      let caller;
      try {
        caller = await getUserClient(req);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          return new Response(JSON.stringify({ error: 'unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        throw error;
      }
      const { data: isPrivileged, error: roleError } = await caller.client.rpc(
        'is_admin_or_manager' as never,
        { _user_id: caller.userId } as never
      );
      if (roleError) throw roleError;
      if (!isPrivileged) {
        return new Response(JSON.stringify({ error: 'forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Bypass de RLS necessário: baselines cobrem histórico de toda a equipe.
      const admin = getServiceClient(
        'baselines de velocidade cobrem historico de estagios de toda a equipe'
      );

      const since = new Date(Date.now() - 90 * 86400000).toISOString();
      const { data: history, error } = await admin
        .from('deal_stage_history')
        .select('stage, entered_at, exited_at, sale_id')
        .gte('entered_at', since)
        .not('exited_at', 'is', null)
        .limit(20000);
      if (error) throw error;

      // Build sale -> owner map
      const saleIds = [
        ...new Set((history ?? []).map((h: { sale_id: string }) => h.sale_id)),
      ];
      const ownerBySale = new Map<string, string | null>();
      if (saleIds.length) {
        type SaleRow = {
          id: string;
          salespeople?: { auth_user_id?: string | null } | null;
        };
        const sales = await chunkedIn<SaleRow>(
          saleIds,
          chunk =>
            admin
              .from('sales')
              .select('id, salesperson_id, salespeople:salesperson_id(auth_user_id)')
              .in('id', chunk),
          { parallel: true, label: 'refresh-stage-baselines.sales' }
        );
        for (const s of sales) {
          const ownerId = s.salespeople?.auth_user_id ?? null;
          ownerBySale.set(s.id, ownerId);
        }
      }

      type Bucket = { stage: string; owner_id: string | null; days: number[] };
      const buckets = new Map<string, Bucket>();
      const push = (stage: string, owner_id: string | null, days: number) => {
        const key = `${stage}|${owner_id ?? 'GLOBAL'}`;
        if (!buckets.has(key)) buckets.set(key, { stage, owner_id, days: [] });
        buckets.get(key)!.days.push(days);
      };

      for (const row of history ?? []) {
        const days = Math.max(
          0,
          (new Date(row.exited_at!).getTime() - new Date(row.entered_at).getTime()) /
            86400000
        );
        push(row.stage, null, days); // global
        const owner = ownerBySale.get(row.sale_id) ?? null;
        if (owner) push(row.stage, owner, days);
      }

      const upserts = [...buckets.values()].map(b => {
        const sorted = [...b.days].sort((a, b) => a - b);
        const avg = sorted.reduce((s, n) => s + n, 0) / sorted.length;
        return {
          stage: b.stage,
          owner_id: b.owner_id,
          avg_days: Number(avg.toFixed(2)),
          median_days: Number(percentile(sorted, 50).toFixed(2)),
          p75_days: Number(percentile(sorted, 75).toFixed(2)),
          sample_size: sorted.length,
          calculated_at: new Date().toISOString(),
        };
      });

      // Batch upsert all baselines in a single round-trip
      let inserted = 0;
      if (upserts.length > 0) {
        const { error: upErr } = await admin
          .from('stage_velocity_baselines')
          .upsert(upserts, { onConflict: 'stage,owner_id' });
        if (!upErr) inserted = upserts.length;
        else console.error('stage_velocity_baselines upsert error:', upErr);
      }
      return new Response(
        JSON.stringify({ buckets: upserts.length, upserted: inserted }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (e) {
      console.error('refresh-stage-baselines error', e);
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  })
);
