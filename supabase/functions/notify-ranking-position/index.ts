import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from '../_shared/request-id.ts';
import {
  getServiceClient,
  getUserClient,
  UnauthorizedError,
} from '../_shared/auth-client.ts';

const fmtBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);

function buildMessage(
  rank: number,
  totalSales: number,
  gapToFirst: number,
  gapToNext: number,
  nextName: string | null,
  totalCount: number
): string {
  if (rank === 1) {
    return `🥇 Você está em 1º lugar com ${fmtBRL(totalSales)} em vendas! Mantenha o ritmo, a coroa é sua.`;
  }
  if (rank === 2) {
    return `🥈 Você está em 2º lugar! Faltam apenas ${fmtBRL(gapToNext)} para ultrapassar ${nextName ?? 'o líder'} e assumir o topo.`;
  }
  if (rank === 3) {
    return `🥉 Você está no pódium em 3º! ${fmtBRL(gapToNext)} para subir para 2º e ${fmtBRL(gapToFirst)} para o 1º.`;
  }
  if (rank <= Math.ceil(totalCount / 2)) {
    return `Você está em ${rank}º. Faltam ${fmtBRL(gapToNext)} para alcançar ${nextName ?? 'o próximo'} e ${fmtBRL(gapToFirst)} para o líder.`;
  }
  return `Você está em ${rank}º lugar. Hora de acelerar! ${fmtBRL(gapToNext)} para subir uma posição e entrar no jogo.`;
}

Deno.serve(
  withRequestId('notify-ranking-position', async (req, _ctx) => {
    const corsHeaders = getCorsHeaders(req);
    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

    try {
      // Gera ranking e notificações para todos os vendedores — exige JWT de
      // usuário com papel admin/manager.
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

      // Bypass de RLS necessário: ranking agrega sales de toda a equipe e
      // escreve ranking_notifications de cada vendedor.
      const supabase = getServiceClient(
        'ranking agrega vendas de toda a equipe e notifica cada vendedor'
      );

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const periodStart = monthStart.toISOString().slice(0, 10);

      const [{ data: salespeople, error: spErr }, { data: sales, error: sErr }] =
        await Promise.all([
          supabase
            .from('salespeople')
            .select('id, name')
            .eq('is_active', true)
            .limit(500),
          supabase
            .from('sales')
            .select('salesperson_id, amount')
            .eq('status', 'completed')
            .gte('created_at', monthStart.toISOString())
            .lte('created_at', monthEnd.toISOString())
            .limit(50000),
        ]);

      if (spErr) throw spErr;
      if (sErr) throw sErr;

      const totals = new Map<string, number>();
      (salespeople ?? []).forEach(sp => totals.set(sp.id, 0));
      (sales ?? []).forEach(s => {
        if (!s.salesperson_id) return;
        totals.set(
          s.salesperson_id,
          (totals.get(s.salesperson_id) ?? 0) + Number(s.amount ?? 0)
        );
      });

      const ranked = (salespeople ?? [])
        .map(sp => ({ id: sp.id, name: sp.name, total: totals.get(sp.id) ?? 0 }))
        .sort((a, b) => b.total - a.total);

      const firstSales = ranked[0]?.total ?? 0;
      const totalCount = ranked.length;

      const rows = ranked.map((sp, i) => {
        const rank = i + 1;
        const nextAbove = i > 0 ? ranked[i - 1] : null;
        const gapToNext = nextAbove ? nextAbove.total - sp.total : 0;
        const gapToFirst = firstSales - sp.total;
        return {
          salesperson_id: sp.id,
          rank,
          total_sales: sp.total,
          gap_to_first: gapToFirst,
          gap_to_next: gapToNext,
          next_competitor_name: nextAbove?.name ?? null,
          period_start: periodStart,
          message: buildMessage(
            rank,
            sp.total,
            gapToFirst,
            gapToNext,
            nextAbove?.name ?? null,
            totalCount
          ),
          read_at: null,
        };
      });

      if (rows.length === 0) {
        return new Response(JSON.stringify({ sent: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error: upErr } = await supabase
        .from('ranking_notifications')
        .upsert(rows, { onConflict: 'salesperson_id,period_start' });

      if (upErr) throw upErr;

      return new Response(
        JSON.stringify({ sent: rows.length, period_start: periodStart }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (e) {
      console.error('notify-ranking-position error:', e);
      const msg = e instanceof Error ? e.message : String(e);
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  })
);
