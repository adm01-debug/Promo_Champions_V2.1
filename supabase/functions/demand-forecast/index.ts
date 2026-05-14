import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";



interface SalesData {
  product_id: string;
  product_name: string;
  total_sales: number;
  total_quantity: number;
  avg_per_month: number;
}

interface ForecastResult {
  product_id: string;
  product_name: string;
  current_stock: number;
  predicted_demand_30d: number;
  predicted_demand_60d: number;
  predicted_demand_90d: number;
  reorder_recommendation: string;
  confidence: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, product_id } = await req.json();

    if (action === 'generate-forecasts') {
      console.info('[Demand Forecast] Generating forecasts for all products...');
      
      // Get all products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, sales_count')
        .eq('status', 'active');

      if (productsError) throw productsError;

      // Get historical sales data (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('product_name, amount, created_at, status')
        .gte('created_at', sixMonthsAgo.toISOString())
        .eq('status', 'fechado');

      if (salesError) throw salesError;

      // Get inventory levels
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_levels')
        .select('*');

      if (inventoryError && inventoryError.code !== 'PGRST116') {
        console.info('[Demand Forecast] No inventory data yet');
      }

      const inventoryMap = new Map(
        (inventory || []).map((inv: any) => [inv.product_id, inv])
      );

      // Calculate sales by product
      const salesByProduct = new Map<string, { count: number; revenue: number; dates: Date[] }>();
      
      for (const sale of sales || []) {
        const existing = salesByProduct.get(sale.product_name) || { count: 0, revenue: 0, dates: [] };
        existing.count += 1;
        existing.revenue += sale.amount;
        existing.dates.push(new Date(sale.created_at));
        salesByProduct.set(sale.product_name, existing);
      }

      const forecasts: ForecastResult[] = [];

      for (const product of products || []) {
        const productSales = salesByProduct.get(product.name) || { count: 0, revenue: 0, dates: [] };
        const inventoryLevel = inventoryMap.get(product.id);
        
        // Calculate monthly average
        const monthsOfData = Math.max(1, 6); // 6 months
        const avgMonthly = productSales.count / monthsOfData;
        
        // Calculate trend (comparing recent 3 months vs older 3 months)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        
        const recentSales = productSales.dates.filter(d => d >= threeMonthsAgo).length;
        const olderSales = productSales.dates.filter(d => d < threeMonthsAgo).length;
        
        let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
        let trendMultiplier = 1;
        
        if (recentSales > olderSales * 1.2) {
          trend = 'increasing';
          trendMultiplier = 1.15;
        } else if (recentSales < olderSales * 0.8) {
          trend = 'decreasing';
          trendMultiplier = 0.85;
        }
        
        // Generate predictions
        const predicted30d = Math.round(avgMonthly * trendMultiplier);
        const predicted60d = Math.round(avgMonthly * 2 * trendMultiplier);
        const predicted90d = Math.round(avgMonthly * 3 * trendMultiplier);
        
        // Determine risk level based on inventory
        const currentStock = inventoryLevel?.current_stock || 0;
        const reorderPoint = inventoryLevel?.reorder_point || 20;
        
        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        let reorderRecommendation = 'Estoque adequado';
        
        if (currentStock <= 0) {
          riskLevel = 'critical';
          reorderRecommendation = `Estoque zerado! Reabastecer imediatamente com ${predicted30d * 2} unidades`;
        } else if (currentStock < predicted30d) {
          riskLevel = 'high';
          reorderRecommendation = `Estoque crítico! Reabastecer com ${predicted60d - currentStock} unidades`;
        } else if (currentStock < predicted60d) {
          riskLevel = 'medium';
          reorderRecommendation = `Considere reabastecer com ${predicted90d - currentStock} unidades`;
        }
        
        // Calculate confidence based on data availability
        const confidence = Math.min(0.95, 0.5 + (productSales.count / 100) * 0.45);

        forecasts.push({
          product_id: product.id,
          product_name: product.name,
          current_stock: currentStock,
          predicted_demand_30d: predicted30d,
          predicted_demand_60d: predicted60d,
          predicted_demand_90d: predicted90d,
          reorder_recommendation: reorderRecommendation,
          confidence: Math.round(confidence * 100) / 100,
          trend,
          risk_level: riskLevel,
        });

        // Save forecast to database
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + 30);
        
        await supabase
          .from('demand_forecasts')
          .upsert({
            product_id: product.id,
            forecast_date: forecastDate.toISOString().split('T')[0],
            predicted_quantity: predicted30d,
            predicted_revenue: predicted30d * product.price,
            confidence_score: confidence,
            factors: {
              trend,
              avg_monthly: avgMonthly,
              total_historical_sales: productSales.count,
              trend_multiplier: trendMultiplier,
            },
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'product_id',
            ignoreDuplicates: false,
          });
      }

      // Sort by risk level
      const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      forecasts.sort((a, b) => riskOrder[a.risk_level] - riskOrder[b.risk_level]);

      console.info(`[Demand Forecast] Generated ${forecasts.length} forecasts`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          forecasts,
          generated_at: new Date().toISOString(),
          total_products: forecasts.length,
          critical_items: forecasts.filter(f => f.risk_level === 'critical').length,
          high_risk_items: forecasts.filter(f => f.risk_level === 'high').length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get-product-forecast' && product_id) {
      // Get specific product forecast
      const { data: forecast, error } = await supabase
        .from('demand_forecasts')
        .select('*, products(name, price, sales_count)')
        .eq('product_id', product_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(
        JSON.stringify({ success: true, forecast }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[Demand Forecast] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
