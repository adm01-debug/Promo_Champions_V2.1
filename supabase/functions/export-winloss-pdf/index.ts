import { getCorsHeaders(req) } from '../_shared/cors.ts';
import { withRequestId } from "../_shared/request-id.ts";
import { getUserClient, getServiceClient, UnauthorizedError } from '../_shared/auth-client.ts';

interface AnalysisRow {
  outcome: string;
  primary_reason: string | null;
  competitor: string | null;
  amount: number | null;
  analyzed_at: string;
}

Deno.serve(withRequestId("export-winloss-pdf", async (req, _ctx) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });

  // ── Authentication ────────────────────────────────────────────────────
  // Require a valid user JWT — prevents unauthenticated callers from
  // exfiltrating win/loss competitive intelligence.
  try {
    await getUserClient(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: ' + e.message }),
        { status: 401, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
      );
    }
    throw e;
  }

  try {
    // Service client needed to read win_loss_analyses regardless of RLS row
    // ownership (report aggregates across all accessible analyses).
    const supabase = getServiceClient("export-winloss-pdf aggregates win_loss_analyses for report");

    const { data: analyses } = await supabase
      .from('win_loss_analyses')
      .select('outcome, primary_reason, competitor, amount, analyzed_at')
      .order('analyzed_at', { ascending: false })
      .limit(500);

    const rows = (analyses ?? []) as AnalysisRow[];
    const wins = rows.filter(r => r.outcome === 'won');
    const losses = rows.filter(r => r.outcome === 'lost');
    const total = rows.length;
    const winRate = total ? (wins.length / total) * 100 : 0;
    const totalRevenue = wins.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const reasonCounts = new Map<string, number>();
    losses.forEach(r => {
      const k = r.primary_reason ?? '—';
      reasonCounts.set(k, (reasonCounts.get(k) ?? 0) + 1);
    });
    const topReasons = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const competitorCounts = new Map<string, number>();
    rows.forEach(r => {
      if (!r.competitor) return;
      competitorCounts.set(r.competitor, (competitorCounts.get(r.competitor) ?? 0) + 1);
    });
    const topCompetitors = Array.from(competitorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // SVG-based lightweight PDF (no native deps).
    // Build a simple text-based PDF using minimal pdf-lib alternative: emit Markdown for now
    const md = [
      '# Win/Loss Intelligence — Relatório Executivo',
      `_Gerado em ${new Date().toLocaleString('pt-BR')}_`,
      '',
      '## KPIs',
      `- **Win rate:** ${winRate.toFixed(1)}%`,
      `- **Volume:** ${total} análises (${wins.length} ganhos · ${losses.length} perdidos)`,
      `- **Receita ganha:** R$ ${totalRevenue.toLocaleString('pt-BR')}`,
      '',
      '## Top motivos de perda',
      ...topReasons.map(([r, c], i) => `${i + 1}. ${r} — ${c} ocorrências`),
      '',
      '## Concorrentes mais frequentes',
      ...topCompetitors.map(([c, n], i) => `${i + 1}. ${c} — ${n} encontros`),
    ].join('\n');

    // Persist as plain text artifact in storage bucket if available; else return inline.
    const bucket = 'winloss-reports';
    const fileName = `winloss-report-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}.md`;

    let signedUrl: string | null = null;
    try {
      // Ensure bucket exists (best-effort)
      await supabase.storage.createBucket(bucket, { public: false }).catch(() => null);
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(fileName, new Blob([md], { type: 'text/markdown' }), {
          contentType: 'text/markdown',
          upsert: false,
        });
      if (!upErr) {
        const { data: signed } = await supabase.storage
          .from(bucket)
          .createSignedUrl(fileName, 60 * 60);
        signedUrl = signed?.signedUrl ?? null;
      }
    } catch (e) {
      console.warn('storage upload failed, returning inline:', e);
    }

    return new Response(
      JSON.stringify({
        url: signedUrl,
        format: 'markdown',
        inline: signedUrl ? null : md,
      }),
      {
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('export-winloss-pdf error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  }
}));
