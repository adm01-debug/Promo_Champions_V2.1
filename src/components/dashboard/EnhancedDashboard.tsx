import { FC } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartSuggestions } from '@/components/suggestions/SmartSuggestions';
import { GaugeChart, SparklineChart, RadialProgress, TrendIndicator, KPICard } from '@/components/charts';
import { AnimateOnScroll, StaggerChildren, StaggerItem } from '@/components/animations';
import { 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2,
  Zap,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedDashboardProps {
  salespersonId?: string;
  className?: string;
  metrics?: {
    conversionRate?: number;
    goalProgress?: number;
    avgDealTime?: number;
    winRate?: number;
    activitiesCompleted?: number;
    activitiesTotal?: number;
    revenue?: number;
    previousRevenue?: number;
    deals?: number;
    previousDeals?: number;
    sparklineData?: number[];
  };
}

export const EnhancedDashboard: FC<EnhancedDashboardProps> = ({
  salespersonId,
  className,
  metrics = {}
}) => {
  const {
    conversionRate = 32,
    goalProgress = 78,
    avgDealTime = 14,
    winRate = 68,
    activitiesCompleted = 24,
    activitiesTotal = 30,
    revenue = 145000,
    previousRevenue = 120000,
    deals = 45,
    previousDeals = 38,
    sparklineData = [20, 35, 25, 40, 30, 45, 50, 42, 55, 48, 60, 52]
  } = metrics;

  const revenueChange = previousRevenue > 0 
    ? ((revenue - previousRevenue) / previousRevenue) * 100 
    : 0;
    
  const dealsChange = previousDeals > 0 
    ? ((deals - previousDeals) / previousDeals) * 100 
    : 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* AI Suggestions Panel */}
      <AnimateOnScroll animation="slide-up">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Sugestões Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SmartSuggestions 
              salespersonId={salespersonId} 
              variant="list" 
              maxSuggestions={3} 
            />
          </CardContent>
        </Card>
      </AnimateOnScroll>

      {/* KPI Cards with Advanced Charts */}
      <StaggerChildren className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <KPICard
            title="Faturamento"
            value={`R$ ${(revenue / 1000).toFixed(0)}k`}
            change={revenueChange}
            icon={DollarSign}
            trend={revenueChange >= 0 ? 'up' : 'down'}
            sparklineData={sparklineData}
            variant="primary"
          />
        </StaggerItem>
        
        <StaggerItem>
          <KPICard
            title="Negócios"
            value={String(deals)}
            change={dealsChange}
            icon={TrendingUp}
            trend={dealsChange >= 0 ? 'up' : 'down'}
            sparklineData={sparklineData.map(v => v * 0.7)}
          />
        </StaggerItem>
        
        <StaggerItem>
          <KPICard
            title="Taxa de Conversão"
            value={`${conversionRate}%`}
            icon={Target}
            progress={conversionRate}
          />
        </StaggerItem>
        
        <StaggerItem>
          <KPICard
            title="Win Rate"
            value={`${winRate}%`}
            icon={Award}
            progress={winRate}
            variant="success"
          />
        </StaggerItem>
      </StaggerChildren>

      {/* Visual Indicators Grid */}
      <StaggerChildren className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StaggerItem>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Meta do Mês</span>
              <TrendIndicator value={goalProgress - 100} size="sm" />
            </div>
            <GaugeChart 
              value={goalProgress} 
              max={100} 
              size="md"
              showValue
              thresholds={{ warning: 50, danger: 80 }}
            />
          </Card>
        </StaggerItem>
        
        <StaggerItem>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Conversão</span>
              <TrendIndicator value={5.2} size="sm" />
            </div>
            <RadialProgress 
              value={conversionRate} 
              max={100}
              size="md"
              showValue
              label={`${conversionRate}%`}
            />
          </Card>
        </StaggerItem>
        
        <StaggerItem>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Atividades</span>
              <span className="text-xs text-muted-foreground">
                {activitiesCompleted}/{activitiesTotal}
              </span>
            </div>
            <RadialProgress 
              value={activitiesCompleted} 
              max={activitiesTotal}
              size="md"
              showValue
              color="hsl(var(--primary))"
              strokeWidth={8}
            />
          </Card>
        </StaggerItem>
        
        <StaggerItem>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Vendas (30d)</span>
              <TrendIndicator value={revenueChange} size="sm" />
            </div>
            <SparklineChart 
              data={sparklineData}
              color="hsl(var(--primary))"
              height={80}
              showArea
              animate
            />
          </Card>
        </StaggerItem>
      </StaggerChildren>

      {/* Quick Stats Row */}
      <AnimateOnScroll animation="fade">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
          >
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{avgDealTime}d</p>
              <p className="text-xs text-muted-foreground">Tempo médio</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
          >
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{winRate}%</p>
              <p className="text-xs text-muted-foreground">Win rate</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
          >
            <Users className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{deals}</p>
              <p className="text-xs text-muted-foreground">Negócios ativos</p>
            </div>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
          >
            <Target className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{goalProgress}%</p>
              <p className="text-xs text-muted-foreground">Meta atingida</p>
            </div>
          </motion.div>
        </div>
      </AnimateOnScroll>
    </div>
  );
};
