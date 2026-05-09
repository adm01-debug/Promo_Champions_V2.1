import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";

const data = [
  { name: 'Week 1', revenue: 4000, forecast: 4400 },
  { name: 'Week 2', revenue: 3000, forecast: 3200 },
  { name: 'Week 3', revenue: 5000, forecast: 4800 },
  { name: 'Week 4', revenue: 4780, forecast: 5100 },
  { name: 'Week 5', revenue: 5890, forecast: 6200 },
  { name: 'Week 6', revenue: 6390, forecast: 6800 },
];

export const PerformanceTrends = () => {
  return (
    <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              Revenue <span className="text-primary">Performance Trends</span>
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold opacity-60">Real vs. Predicted (Weekly)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[250px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700 }} 
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: 'bold'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke="rgba(255,255,255,0.2)" 
              strokeDasharray="5 5"
              fill="transparent" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};