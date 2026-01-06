import { FC } from "react";
import { motion } from "framer-motion";
import { StatCard } from "../StatCard";
import { SalesChart } from "../SalesChart";
import { GoalProgress } from "../GoalProgress";
import { FunnelChart } from "../FunnelChart";
import { TopProducts } from "../TopProducts";
import { SalesForecast } from "../SalesForecast";
import { AlertsPanel } from "../AlertsPanel";
import { KPIGrid } from "../KPIGrid";
import { CompetitiveLeaderboard } from "@/components/gamification/CompetitiveLeaderboard";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useSalespeople } from "@/hooks/useSalespeople";
import { itemVariants, containerVariants } from "@/components/transitions/PageTransition";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target,
  BarChart3,
  Activity,
  Award,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GestorDashboardProps {
  className?: string;
}

export const GestorDashboard: FC<GestorDashboardProps> = ({ className }) => {
  const { data: kpis } = useDashboardKPIs();
  const { data: goalsData } = useGoalsDashboard();
  const { data: salespeople } = useSalespeople();

  const formatCurrency = (value: number) => 
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  // Calculate team metrics
  const activeSalespeople = salespeople?.filter(s => s.is_active).length ?? 0;

  return (
    <div className={className}>
      {/* Gestor Focus: Team Overview & Forecast */}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Team Overview Stats */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Receita Total"
              value={formatCurrency(kpis?.current.totalRevenue ?? 0)}
              change={kpis?.changes.revenue ?? 0}
              icon={DollarSign}
              variant="primary"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Equipe Ativa"
              value={String(activeSalespeople)}
              change={0}
              icon={Users}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Meta da Equipe"
              value={`${goalsData ? Math.round((goalsData.totalSales / (goalsData.totalGoal || 1)) * 100) : 0}%`}
              change={0}
              icon={Target}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Crescimento"
              value={`${kpis?.changes.revenue ?? 0}%`}
              change={kpis?.changes.revenue ?? 0}
              icon={TrendingUp}
            />
          </motion.div>
        </motion.div>

        {/* Main Charts Row */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="lg:col-span-2 min-h-[280px]">
            <SalesChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <GoalProgress 
              current={goalsData?.totalSales ?? kpis?.current.totalRevenue ?? 0} 
              goal={goalsData?.totalGoal || 0}
              label="Meta da Equipe"
            />
          </motion.div>
        </motion.div>

        {/* Team Performance */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="glass border-border/40 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Performance da Equipe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {salespeople?.slice(0, 5).map((person, index) => (
                  <div key={person.id} className="flex items-center gap-3">
                    <span className="text-sm font-bold w-5 text-muted-foreground">
                      {index + 1}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={person.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {person.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{person.name}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={70 - index * 10} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {70 - index * 10}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass border-border/40 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Atenção Necessária
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">2 vendedores abaixo da meta</p>
                  <p className="text-xs text-muted-foreground mt-1">Precisam de suporte imediato</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-sm font-medium text-warning">5 deals estagnados há 7+ dias</p>
                  <p className="text-xs text-muted-foreground mt-1">Revisar estratégia</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary">3 clientes grandes sem contato</p>
                  <p className="text-xs text-muted-foreground mt-1">Follow-up recomendado</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Analytics Row */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <FunnelChart />
          </motion.div>
          <motion.div variants={itemVariants}>
            <SalesForecast />
          </motion.div>
          <motion.div variants={itemVariants}>
            <TopProducts />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPIGrid />
          </motion.div>
        </motion.div>

        {/* Leaderboard & Alerts */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <CompetitiveLeaderboard showAll />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AlertsPanel showAll />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
