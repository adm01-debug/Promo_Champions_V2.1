import { getCorsHeaders } from '../_shared/cors.ts';
import { withRequestId } from "../_shared/request-id.ts";
import { getUserClient, getServiceClient, UnauthorizedError, type AuthenticatedContext } from '../_shared/auth-client.ts';
import { toBusinessDate } from "../_shared/business-date.ts";
import {
  collectErrors, validateEnum, validateArray,
  validationErrorResponse, type ValidationError,
} from '../_shared/validation.ts';

interface AnalysisRow {
  outcome: string;
  primary_reason: string | null;
  competitor: string | null;
  amount: number | null;
  analyzed_at: string;
}

Deno.serve(withRequestId("export-winloss-pdf", async (req, _ctx) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // ── Authentication ────────────────────────────────────────────────────
  // Require a valid user JWT — prevents unauthenticated callers from
  // exfiltrating win/loss competitive intelligence.
  let authCtx: AuthenticatedContext | null = null;
  try {
    authCtx = await getUserClient(req);
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: ' + e.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    throw e;
  }

  try {
    // Governanca (A3): o relatorio so expoe o que o usuario ja enxerga na UI.
    // admin/manager (is_admin_or_manager) veem o conjunto global; os demais
    // rodam com o client escopado ao JWT, e a policy RLS "wla read auth"
    // (20260515150338) filtra win_loss_analyses pelo dono via sale_id. Isso
    // impede que o PDF vaze analises de win/loss de outro vendedor.
    const { data: isPrivileged } = await authCtx!.client.rpc(
      "is_admin_or_manager",
      { _user_id: authCtx!.userId }
    );
    const supabase = isPrivileged
      ? getServiceClient("export-winloss-pdf: admin/manager agregam win_loss_analyses globais para o relatorio")
      : authCtx.client;

    // AUD-VALIDACAO: o body chega como { filters }. Validação de entrada antes
    // de qualquer leitura — period do conjunto permitido, listas sem tamanho
    // abusivo. Um body inválido responde 400 sem tocar no banco.
    let bodyData: unknown = {};
    try {
      bodyData = await req.json();
    } catch {
      // body ausente/vazio é tratado como filtros padrão (sem erro).
    }
    const rawFilters = (bodyData as { filters?: unknown })?.filters ?? {};
    const fperiod = (rawFilters as { period?: unknown })?.period;
    const fsales = (rawFilters as { salespersonIds?: unknown })?.salespersonIds;
    const fseg = (rawFilters as { segments?: unknown })?.segments;
    const fsrc = (rawFilters as { sources?: unknown })?.sources;
    const periodStr = typeof fperiod === "number" ? String(fperiod) : null;
    const errors: (ValidationError | null)[] = [
      periodStr ? validateEnum(periodStr, "period", ["7", "30", "90", "180", "365"]) : null,
      validateArray(fsales ?? [], "salespersonIds", { required: false, maxLength: 100 }),
      validateArray(fseg ?? [], "segments", { required: false, maxLength: 100 }),
      validateArray(fsrc ?? [], "sources", { required: false, maxLength: 100 }),
    ];
    const collected = collectErrors(errors);
    if (collected.length) {
      return validationErrorResponse(collected, corsHeaders);
    }
    const periodDays = periodStr ? Number(periodStr) : 90;
    const since = new Date();
    since.setDate(since.getDate() - periodDays);

    const query = supabase
      .from('win_loss_analyses')
      .select('outcome, primary_reason, competitor, amount, analyzed_at')
      .gte('analyzed_at', since.toISOString())
      .order('analyzed_at', { ascending: false })
      .limit(500);
    const { data: analyses } = await query;

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
    const fileName = `winloss-report-${toBusinessDate()}-${crypto.randomUUID().slice(0, 8)}.md`;

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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (e) {
    console.error('export-winloss-pdf error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'unknown' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}));
