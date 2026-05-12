import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { Activity, Users, BarChart3, AlertTriangle, Download, Zap } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportToCSV } from "@/utils/csvExport";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  type PeriodFilter, type ViewMode, type ActivityTypeFilter,
  useSDRActivityTrend, ACTIVITY_COLORS, ACTIVITY_LABELS, COLORS,
} from "@/hooks/useSDRActivityTrend";

interface SDRActivityTrendProps {
  period: PeriodFilter;
}

export function SDRActivityTrend({ period }: SDRActivityTrendProps) {
  const [selectedSDR, setSelectedSDR] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("activity");
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityTypeFilter>("all");
  const { data, isLoading } = useSDRActivityTrend(period, selectedSDR, viewMode, activityTypeFilter);

  if (isLoading) {
    return (
      <Card className="glass border-border/40 h-[450px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-2">
           <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
           <span className="text-[10px] font-mono uppercase tracking-widest text-primary/60">Scanning Activity Trends...</span>
         </div>
      </Card>
    );
  }

  const { activityData = [], comparisonData = [], sdrs = [], totals, dailyGoal = 0, sdrGoals = {}, underperformingSDRs = [] } = data || {};

  const handleExportCSV = () => {
    if (viewMode === 'activity') {
      exportToCSV(activityData as Record<string, unknown>[], `sdr-atividades-por-tipo-${format(new Date(), "yyyy-MM-dd")}`, ["label", "calls", "emails", "meetings", "linkedin", "whatsapp", "total"]);
    } else {
      exportToCSV(comparisonData as Record<string, unknown>[], `sdr-comparacao-${format(new Date(), "yyyy-MM-dd")}`, ["label", ...sdrs.map(sdr => sdr.id)]);
    }
    toast.success("CSV exportado com sucesso");
  };

  const totalActivities = totals ? totals.calls + totals.emails + totals.meetings + totals.linkedin + totals.whatsapp : 0;

  return (
    <Card className="glass border-primary/20 bg-black/40 backdrop-blur-xl relative overflow-hidden group h-full">
      {/* Decorative corners */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-primary/20 group-hover:border-primary/40 transition-colors" />
      </div>

      <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-[0.3em] flex items-center gap-2 text-primary">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Activity className="h-3.5 w-3.5" />
            </div>
            Activity Dynamics
          </CardTitle>
          {totalActivities > 0 && viewMode === 'activity' && (
            <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-widest bg-white/5 border-white/10">
              VOL: {totalActivities}
            </Badge>
          )}
          {viewMode === 'comparison' && underperformingSDRs.length > 0 && (
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Badge variant="destructive" className="gap-1.5 cursor-help animate-pulse text-[9px] uppercase tracking-widest">
                    <AlertTriangle className="w-3 h-3" />
                    {underperformingSDRs.length} AT RISK
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs bg-black/90 border-destructive/30 backdrop-blur-xl">
                  <div className="space-y-2 p-1">
                    <p className="font-mono font-bold text-[10px] text-destructive uppercase tracking-widest">Alert: Performance GAP Detected</p>
                    <ul className="space-y-1">
                      {underperformingSDRs.map(sdr => (
                        <li key={sdr.id} className="text-[10px] font-mono flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">{sdr.name}</span>
                          <span className="text-destructive font-black">{sdr.consecutiveDays}D | -{sdr.avgDeficit}/DAY</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="h-8">
            <TabsList className="h-8 bg-black/40 border border-white/5 p-1">
              <TabsTrigger value="activity" className="text-[9px] font-black uppercase tracking-tighter px-2 h-6">MODE: TYPE</TabsTrigger>
              <TabsTrigger value="comparison" className="text-[9px] font-black uppercase tracking-tighter px-2 h-6">MODE: SQUAD</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-1.5">
            {viewMode === 'activity' ? (
              <Select value={selectedSDR} onValueChange={setSelectedSDR}>
                <SelectTrigger className="w-[140px] h-8 text-[9px] font-mono font-bold uppercase tracking-widest bg-black/40 border-white/10">
                  <SelectValue placeholder="All SDRs" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                  <SelectItem value="all" className="text-[10px] font-mono uppercase">Global Spectrum</SelectItem>
                  {sdrs.map(sdr => (<SelectItem key={sdr.id} value={sdr.id} className="text-[10px] font-mono uppercase">{sdr.name}</SelectItem>))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={activityTypeFilter} onValueChange={(v) => setActivityTypeFilter(v as ActivityTypeFilter)}>
                <SelectTrigger className="w-[140px] h-8 text-[9px] font-mono font-bold uppercase tracking-widest bg-black/40 border-white/10">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                  <SelectItem value="all" className="text-[10px] font-mono uppercase">All Channels</SelectItem>
                  {Object.entries(ACTIVITY_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val} className="text-[10px] font-mono uppercase">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button variant="outline" size="icon" className="h-8 w-8 border-white/10 bg-black/40 hover:bg-primary/10 hover:text-primary transition-all" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-8 relative z-10">
        <div className="absolute inset-x-6 top-0 bottom-6 opacity-[0.03] pointer-events-none border border-white/10 rounded-xl"
             style={{
               backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
               backgroundSize: "20px 20px"
             }} />
        
        {viewMode === 'activity' ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(ACTIVITY_COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                    <stop offset="60%" stopColor={color} stopOpacity={0.1} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontWeight: 600 }} width={40} />
              {dailyGoal > 0 && (
                <ReferenceLine y={dailyGoal} stroke="hsl(var(--primary))" strokeDasharray="5 5" strokeWidth={1.5}
                  label={{ value: `TARGET: ${dailyGoal}`, position: 'right', fill: 'hsl(var(--primary))', fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 800 }} />
              )}
              <Tooltip 
                cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const dataPoint = activityData.find(p => p.label === label);
                  return (
                    <div className="glass p-4 border-white/10 rounded-xl shadow-2xl backdrop-blur-xl min-w-[180px]">
                      <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/5 pb-2">
                        <p className="font-mono font-black text-[10px] text-foreground uppercase tracking-widest">{label}</p>
                        <Badge variant="outline" className="font-mono text-[9px] border-primary/30 text-primary">TOTAL: {(dataPoint as any)?.total ?? 0}</Badge>
                      </div>
                      <div className="space-y-2">
                        {payload.map((entry) => (
                          <div key={String(entry.dataKey)} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: String(entry.stroke ?? entry.color ?? '') }} />
                            <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">{ACTIVITY_LABELS[String(entry.dataKey)] || String(entry.dataKey)}</span>
                            <span className="text-[10px] font-mono font-black ml-auto">{Number(entry.value ?? 0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
              }} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" iconSize={8}
                formatter={(value) => <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">{ACTIVITY_LABELS[value] || value}</span>} />
              {(['calls', 'emails', 'meetings', 'linkedin', 'whatsapp'] as const).map(key => (
                <Area key={key} type="monotone" dataKey={key} stroke={ACTIVITY_COLORS[key]} fill={`url(#gradient-${key})`} strokeWidth={2} activeDot={{ r: 4, strokeWidth: 1, stroke: 'white' }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontWeight: 600 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontWeight: 600 }} width={40} />
              <Tooltip 
                cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const total = payload.reduce((sum: number, entry) => sum + (Number(entry.value ?? 0)), 0);
                  return (
                    <div className="glass p-4 border-white/10 rounded-xl shadow-2xl backdrop-blur-xl min-w-[200px]">
                      <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/5 pb-2">
                        <p className="font-mono font-black text-[10px] text-foreground uppercase tracking-widest">{label}</p>
                        <Badge variant="outline" className="font-mono text-[9px] border-primary/30 text-primary">SUM: {total}</Badge>
                      </div>
                      <div className="space-y-3">
                        {[...payload].sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0)).map((entry) => {
                          const dk = String(entry.dataKey ?? '');
                          const sdr = sdrs.find(s => s.id === dk);
                          const goal = sdrGoals[dk] || 0;
                          const entryVal = Number(entry.value ?? 0);
                          const diff = goal > 0 ? entryVal - goal : 0;
                          return (
                            <div key={dk} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: String(entry.stroke ?? entry.color ?? '') }} />
                                <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider truncate max-w-[120px]">{sdr?.name || dk}</span>
                                <span className={`text-[10px] font-mono font-black ml-auto ${goal > 0 ? diff >= 0 ? 'text-success' : 'text-destructive' : ''}`}>{entryVal}</span>
                              </div>
                              {goal > 0 && (
                                <div className="flex items-center gap-1.5 ml-3.5">
                                  <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                                     <div className={cn("h-full", diff >= 0 ? "bg-success" : "bg-destructive")} style={{ width: `${Math.min((entryVal/goal)*100, 100)}%` }} />
                                  </div>
                                  <span className={cn("text-[8px] font-mono font-bold", diff >= 0 ? "text-success/60" : "text-destructive/60")}>{diff >= 0 ? '+' : ''}{diff}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
              }} />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" iconSize={8}
                formatter={(value) => { const sdr = sdrs.find(s => s.id === value); return <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">{sdr?.name || value}</span>; }} />
              {sdrs.map((sdr, index) => (
                <Line key={sdr.id} type="monotone" dataKey={sdr.id} name={sdr.id} stroke={COLORS[index % COLORS.length]} strokeWidth={3}
                  dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 0, r: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: 'white' }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
