// @ts-nocheck
import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Target, Users, Clock, DollarSign, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversionData {
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  avgTime: number;
}

interface ConversionAnalysisProps {
  data: ConversionData[];
  period?: string;
  className?: string;
}

export const ConversionAnalysis: FC<ConversionAnalysisProps> = ({
  data,
  period = 'Este mês',
  className,
}) => {
  const totalDeals = data[0]?.count || 0;
  const wonDeals = data[data.length - 1]?.count || 0;
  const overallConversion = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : '0';

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Análise de Conversão</h3>
          <p className="text-sm text-muted-foreground">{period}</p>
        </div>
        <Badge variant="outline" className="text-lg font-bold">
          {overallConversion}% geral
        </Badge>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={100} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'count') return [value, 'Negócios'];
                if (name === 'conversionRate') return [`${value}%`, 'Conversão'];
                return [value, name];
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
        {data.map((stage, index) => (
          <div key={stage.stage} className="text-center">
            <p className="text-xs text-muted-foreground truncate">{stage.stage}</p>
            <p className="font-semibold">{stage.conversionRate}%</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

interface WinLossData {
  reason: string;
  count: number;
  percentage: number;
  value: number;
}

interface WinLossReasonChartProps {
  winReasons: WinLossData[];
  lossReasons: WinLossData[];
  className?: string;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];
const LOSS_COLORS = ['#ef4444', '#f97316', '#eab308', '#a855f7', '#6366f1'];

export const WinLossReasonChart: FC<WinLossReasonChartProps> = ({
  winReasons,
  lossReasons,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'wins' | 'losses'>('wins');

  const data = activeTab === 'wins' ? winReasons : lossReasons;
  const colors = activeTab === 'wins' ? COLORS : LOSS_COLORS;

  return (
    <Card className={cn('p-4', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'wins' | 'losses')}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Razões de Win/Loss</h3>
          <TabsList>
            <TabsTrigger value="wins" className="gap-1">
              <ThumbsUp size={14} />
              Ganhos
            </TabsTrigger>
            <TabsTrigger value="losses" className="gap-1">
              <ThumbsDown size={14} />
              Perdidos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="wins" className="mt-0">
          <ReasonList data={winReasons} colors={COLORS} type="win" />
        </TabsContent>
        <TabsContent value="losses" className="mt-0">
          <ReasonList data={lossReasons} colors={LOSS_COLORS} type="loss" />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

const ReasonList: FC<{ data: WinLossData[]; colors: string[]; type: 'win' | 'loss' }> = ({
  data,
  colors,
  type,
}) => (
  <div className="space-y-3">
    {data.map((item, index) => (
      <div key={item.reason} className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: colors[index % colors.length] }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium truncate">{item.reason}</span>
            <span className="text-sm text-muted-foreground">{item.count}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-1">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${item.percentage}%`,
                backgroundColor: colors[index % colors.length],
              }}
            />
          </div>
        </div>
        <span className="text-sm font-medium w-12 text-right">{item.percentage}%</span>
      </div>
    ))}
  </div>
);
