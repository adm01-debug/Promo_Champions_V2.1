import { FC, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPoint {
  date: string;
  value: number;
}

interface TrendAnalysisProps {
  data: DataPoint[];
  title: string;
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
}

export const TrendAnalysis: FC<TrendAnalysisProps> = ({
  data,
  title,
  valuePrefix = '',
  valueSuffix = '',
  className
}) => {
  const analysis = useMemo(() => {
    if (data.length < 2) return null;
    
    const values = data.map(d => d.value);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const trend = avgSecond > avgFirst ? 'up' : avgSecond < avgFirst ? 'down' : 'stable';
    const changePercent = avgFirst !== 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;
    
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return { trend, changePercent, max, min, avg };
  }, [data]);

  if (!analysis) return null;

  return (
    <Card className={cn("p-4", className)}>
      <h4 className="font-medium text-sm mb-3">{title}</h4>
      
      {/* Trend visualization */}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn(
          "p-2 rounded-full",
          analysis.trend === 'up' ? 'bg-green-500/10 text-green-500' : 
          analysis.trend === 'down' ? 'bg-red-500/10 text-red-500' :
          'bg-muted text-muted-foreground'
        )}>
          {analysis.trend === 'up' ? <TrendingUp className="h-5 w-5" /> : 
           analysis.trend === 'down' ? <TrendingDown className="h-5 w-5" /> :
           <ArrowRight className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-semibold">
            {analysis.trend === 'up' ? 'Tendência de Alta' : 
             analysis.trend === 'down' ? 'Tendência de Baixa' :
             'Estável'}
          </p>
          <p className="text-sm text-muted-foreground">
            {analysis.changePercent > 0 ? '+' : ''}{analysis.changePercent.toFixed(1)}% de variação
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Mínimo</p>
          <p className="font-medium text-sm">{valuePrefix}{analysis.min.toLocaleString('pt-BR')}{valueSuffix}</p>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Média</p>
          <p className="font-medium text-sm">{valuePrefix}{analysis.avg.toFixed(0)}{valueSuffix}</p>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">Máximo</p>
          <p className="font-medium text-sm">{valuePrefix}{analysis.max.toLocaleString('pt-BR')}{valueSuffix}</p>
        </div>
      </div>
    </Card>
  );
};

interface QuickInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  message: string;
  metric?: string;
}

interface QuickInsightsProps {
  insights: QuickInsight[];
  title?: string;
  className?: string;
}

export const QuickInsights: FC<QuickInsightsProps> = ({
  insights,
  title = 'Insights Rápidos',
  className
}) => {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "flex items-start gap-2 p-2 rounded-lg text-sm",
              insight.type === 'positive' && "bg-green-500/10 text-green-700 dark:text-green-400",
              insight.type === 'negative' && "bg-red-500/10 text-red-700 dark:text-red-400",
              insight.type === 'neutral' && "bg-muted"
            )}
          >
            <span className="mt-0.5">
              {insight.type === 'positive' ? '✓' : 
               insight.type === 'negative' ? '!' : 
               '•'}
            </span>
            <div className="flex-1">
              <p>{insight.message}</p>
              {insight.metric && (
                <p className="text-xs mt-0.5 opacity-75">{insight.metric}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
};

interface GoalProgressWidgetProps {
  goals: {
    id: string;
    label: string;
    current: number;
    target: number;
    unit?: string;
  }[];
  className?: string;
}

export const GoalProgressWidget: FC<GoalProgressWidgetProps> = ({
  goals,
  className
}) => {
  const overallProgress = useMemo(() => {
    const total = goals.reduce((acc, goal) => {
      const progress = Math.min((goal.current / goal.target) * 100, 100);
      return acc + progress;
    }, 0);
    return total / goals.length;
  }, [goals]);

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-sm">Progresso das Metas</h4>
        <span className={cn(
          "text-sm font-semibold",
          overallProgress >= 100 ? "text-green-500" :
          overallProgress >= 75 ? "text-primary" :
          overallProgress >= 50 ? "text-amber-500" :
          "text-red-500"
        )}>
          {overallProgress.toFixed(0)}%
        </span>
      </div>

      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = Math.min((goal.current / goal.target) * 100, 100);
          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{goal.label}</span>
                <span>
                  {goal.current}{goal.unit} / {goal.target}{goal.unit}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={cn(
                    "h-full rounded-full",
                    progress >= 100 ? "bg-green-500" : "bg-primary"
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
