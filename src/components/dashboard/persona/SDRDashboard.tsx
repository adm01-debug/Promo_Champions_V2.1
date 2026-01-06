import { FC } from "react";
import { motion } from "framer-motion";
import { StatCard } from "../StatCard";
import { AlertsPanel } from "../AlertsPanel";
import { KPIGrid } from "../KPIGrid";
import { DailyChallengesCard } from "@/components/gamification/DailyChallengesCard";
import { DailyChallengesCard } from "@/components/gamification/DailyChallengesCard";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { CompetitiveStatusBar } from "@/components/gamification/CompetitiveStatusBar";
import { useDashboardKPIs } from "@/hooks/useDashboardKPIs";
import { useGoalsDashboard } from "@/hooks/useGoalsDashboard";
import { useAuth } from "@/contexts/AuthContext";
import { itemVariants, containerVariants } from "@/components/transitions/PageTransition";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Calendar,
  Target,
  Users,
  TrendingUp,
  Zap
} from "lucide-react";
import { useActivities } from "@/hooks/useActivities";

interface SDRDashboardProps {
  className?: string;
}

export const SDRDashboard: FC<SDRDashboardProps> = ({ className }) => {
  const { salesperson } = useAuth();
  const { data: kpis } = useDashboardKPIs();
  const { data: goalsData } = useGoalsDashboard();
  const { data: activities } = useActivities();

  // Calculate today's activities
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activities?.filter(a => 
    a.created_at.startsWith(today)
  ) || [];

  const callsToday = todayActivities.filter(a => a.activity_type === 'call').length;
  const emailsToday = todayActivities.filter(a => a.activity_type === 'email').length;
  const meetingsToday = todayActivities.filter(a => a.activity_type === 'meeting').length;
  const messagesToday = todayActivities.filter(a => 
    a.activity_type === 'whatsapp' || a.activity_type === 'linkedin'
  ).length;

  return (
    <div className={className}>
      {/* SDR Focus: Activities & Lead Generation */}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Competitive Status */}
        <motion.div variants={itemVariants} className="hidden sm:block">
          <CompetitiveStatusBar />
        </motion.div>

        {/* Activity Stats - SDR Primary Focus */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Ligações Hoje"
              value={String(callsToday)}
              change={0}
              icon={Phone}
              variant="primary"
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="E-mails Hoje"
              value={String(emailsToday)}
              change={0}
              icon={Mail}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Mensagens"
              value={String(messagesToday)}
              change={0}
              icon={MessageSquare}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Reuniões"
              value={String(meetingsToday)}
              change={0}
              icon={Calendar}
            />
          </motion.div>
        </motion.div>

        {/* Goals & Performance */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="glass rounded-xl p-4 border border-border/40">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Meta de Atividades</h3>
              </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">Ligações</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{callsToday}/30</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min((callsToday / 30) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">E-mails</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{emailsToday}/50</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min((emailsToday / 50) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">Mensagens</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{messagesToday}/20</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min((messagesToday / 20) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40">
                  <p className="text-xs text-muted-foreground mb-1">Reuniões</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{meetingsToday}/5</span>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min((meetingsToday / 5) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StreakWidget salespersonId={salesperson?.id} />
          </motion.div>
        </motion.div>

        {/* Secondary Metrics */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <StatCard
              title="Leads Ativos"
              value={String(kpis?.current.newClients ?? 0)}
              change={kpis?.changes.clients ?? 0}
              icon={Users}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <StatCard
              title="Taxa Resposta"
              value={`${(kpis?.current.conversionRate ?? 0).toFixed(0)}%`}
              change={kpis?.changes.conversion ?? 0}
              icon={TrendingUp}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KPIGrid compact />
          </motion.div>
          <motion.div variants={itemVariants}>
            <AlertsPanel compact />
          </motion.div>
        </motion.div>

        {/* Gamification */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <DailyChallengesCard salespersonId={salesperson?.id} showTestButton />
          </motion.div>
          <motion.div variants={itemVariants}>
            <div className="glass rounded-xl p-4 border border-border/40 h-full">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-warning" />
                <h3 className="font-semibold">Próximas Ações</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• 5 leads aguardando follow-up</p>
                <p>• 3 cadências para iniciar hoje</p>
                <p>• 2 reuniões agendadas</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
