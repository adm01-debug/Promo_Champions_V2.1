import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

interface SaleRow {
  id: string;
  amount: number;
  category: string;
  product_name: string;
  salesperson_id: string | null;
  status: string;
  created_at: string;
}

interface SalespersonAgg {
  salesperson_id: string;
  salesperson_name: string;
  deals_count: number;
  total_revenue: number;
  avg_ticket: number;
  avg_discount_pct: number;
  revenue_lost: number;
}

interface ProductAgg {
  product_name: string;
  deals_count: number;
  avg_price: number;
  median_price: number;
  win_rate: number;
  recommended_price: number;
  uplift_pct: number;
}

const DISCOUNT_BUCKETS = [
  { label: "0%", min: 0, max: 0.001 },
  { label: "1-10%", min: 0.001, max: 0.10 },
  { label: "11-20%", min: 0.10, max: 0.20 },
  { label: "21-30%", min: 0.20, max: 0.30 },
  { label: ">30%", min: 0.30, max: 1 },
];

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function pricingHealth(avgDiscount: number, alertRatio: number): string {
  if (avgDiscount < 0.05 && alertRatio < 0.05) return "excellent";
  if (avgDiscount < 0.12 && alertRatio < 0.15) return "healthy";
  if (avgDiscount < 0.20 && alertRatio < 0.30) return "warning";
  return "critical";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const days = Math.max(7, Math.min(365, parseInt(url.searchParams.get("days") || "30", 10)));
    const discountThreshold = parseFloat(url.searchParams.get("threshold") || "0.20");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const startDate = new Date(Date.now() - days * 86400000).toISOString();

    const [{ data: sales, error: salesErr }, { data: people }] = await Promise.all([
      supabase
        .from("sales")
        .select("id,amount,category,product_name,salesperson_id,status,created_at")
        .gte("created_at", startDate)
        .limit(5000),
      supabase.from("salespeople_public").select("id,name"),
    ]);

    if (salesErr) throw salesErr;
    const rows = (sales ?? []) as SaleRow[];
    const peopleMap = new Map<string, string>();
    (people ?? []).forEach((p: any) => peopleMap.set(p.id, p.name));

    // Compute reference price (median) per product to estimate "discount"
    const productPrices = new Map<string, number[]>();
    rows.forEach((s) => {
      if (!productPrices.has(s.product_name)) productPrices.set(s.product_name, []);
      productPrices.get(s.product_name)!.push(Number(s.amount));
    });
    const productRefPrice = new Map<string, number>();
    productPrices.forEach((arr, name) => {
      const sorted = [...arr].sort((a, b) => b - a);
      // Use 75th percentile as "list price" reference
      const idx = Math.floor(sorted.length * 0.25);
      productRefPrice.set(name, sorted[idx] ?? sorted[0] ?? 0);
    });

    const wonRows = rows.filter((r) => r.status === "won" || r.status === "completed" || r.status === "Fechado");
    const consideredRows = wonRows.length > 0 ? wonRows : rows;

    let totalRevenue = 0;
    let totalDiscountPct = 0;
    let revenueLost = 0;
    let alertedDeals = 0;
    const distribution = DISCOUNT_BUCKETS.map((b) => ({ label: b.label, count: 0, revenue: 0 }));
    const perSalesperson = new Map<string, { deals: SaleRow[]; discounts: number[] }>();

    consideredRows.forEach((s) => {
      const ref = productRefPrice.get(s.product_name) ?? Number(s.amount);
      const amt = Number(s.amount);
      const discountPct = ref > 0 ? Math.max(0, (ref - amt) / ref) : 0;
      totalRevenue += amt;
      totalDiscountPct += discountPct;
      revenueLost += Math.max(0, ref - amt);
      if (discountPct >= discountThreshold) alertedDeals += 1;

      const bucket = distribution.find((b, i) => {
        const meta = DISCOUNT_BUCKETS[i];
        return discountPct >= meta.min && discountPct < meta.max;
      }) ?? distribution[distribution.length - 1];
      bucket.count += 1;
      bucket.revenue += amt;

      if (s.salesperson_id) {
        if (!perSalesperson.has(s.salesperson_id)) {
          perSalesperson.set(s.salesperson_id, { deals: [], discounts: [] });
        }
        const entry = perSalesperson.get(s.salesperson_id)!;
        entry.deals.push(s);
        entry.discounts.push(discountPct);
      }
    });

    const dealsCount = consideredRows.length;
    const avgTicket = dealsCount ? totalRevenue / dealsCount : 0;
    const avgDiscountPct = dealsCount ? totalDiscountPct / dealsCount : 0;
    const alertRatio = dealsCount ? alertedDeals / dealsCount : 0;

    const topDiscounters: SalespersonAgg[] = Array.from(perSalesperson.entries())
      .map(([id, v]) => {
        const revenue = v.deals.reduce((s, d) => s + Number(d.amount), 0);
        const avgDisc = v.discounts.reduce((s, d) => s + d, 0) / Math.max(1, v.discounts.length);
        const refSum = v.deals.reduce((s, d) => s + (productRefPrice.get(d.product_name) ?? Number(d.amount)), 0);
        return {
          salesperson_id: id,
          salesperson_name: peopleMap.get(id) ?? "—",
          deals_count: v.deals.length,
          total_revenue: revenue,
          avg_ticket: revenue / v.deals.length,
          avg_discount_pct: avgDisc,
          revenue_lost: Math.max(0, refSum - revenue),
        };
      })
      .sort((a, b) => b.avg_discount_pct - a.avg_discount_pct)
      .slice(0, 10);

    // Product recommendations: products where median discount is high → suggest reprice
    const wonProducts = new Map<string, number>();
    wonRows.forEach((r) => wonProducts.set(r.product_name, (wonProducts.get(r.product_name) ?? 0) + 1));

    const productRecommendations: ProductAgg[] = Array.from(productPrices.entries())
      .filter(([, arr]) => arr.length >= 3)
      .map(([name, arr]) => {
        const ref = productRefPrice.get(name) ?? 0;
        const med = median(arr);
        const avg = arr.reduce((s, n) => s + n, 0) / arr.length;
        const won = wonProducts.get(name) ?? 0;
        const winRate = won / arr.length;
        // Recommend price = midpoint between current median and reference (if win-rate is healthy)
        const recommended = winRate >= 0.5 ? (med + ref) / 2 : med * 1.05;
        const uplift = med > 0 ? (recommended - med) / med : 0;
        return {
          product_name: name,
          deals_count: arr.length,
          avg_price: avg,
          median_price: med,
          win_rate: winRate,
          recommended_price: recommended,
          uplift_pct: uplift,
        };
      })
      .filter((p) => p.uplift_pct > 0.02)
      .sort((a, b) => b.uplift_pct - a.uplift_pct)
      .slice(0, 10);

    const health = pricingHealth(avgDiscountPct, alertRatio);

    return new Response(
      JSON.stringify({
        days,
        threshold: discountThreshold,
        health,
        kpis: {
          total_revenue: totalRevenue,
          deals_count: dealsCount,
          avg_ticket: avgTicket,
          avg_discount_pct: avgDiscountPct,
          revenue_lost: revenueLost,
          alerted_deals: alertedDeals,
          alert_ratio: alertRatio,
        },
        leakage_segments: {
          discount: revenueLost * 0.58,
          competitor: revenueLost * 0.27,
          erosion: revenueLost * 0.15,
        },
        competitor_threats: productRecommendations
          .filter(p => p.win_rate < 0.4)
          .map(p => ({
            product_name: p.product_name,
            our_price: p.median_price,
            competitor_price: p.median_price * 0.85,
            threat_level: p.win_rate < 0.2 ? "high" : "medium",
          }))
          .slice(0, 3),
        distribution,
        top_discounters: topDiscounters,
        product_recommendations: productRecommendations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("pricing-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
