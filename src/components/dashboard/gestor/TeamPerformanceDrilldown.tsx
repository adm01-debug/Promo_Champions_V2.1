import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSalespeople } from "@/hooks/useSalespeople";
import { usePipelineDeals } from "@/hooks/usePipeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  BarChart3,
  ChevronRight,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string;
  email: string | null;
  is_active: boolean;
  performance: {
    goalProgress: number;
    totalRevenue: number;
    dealsWon: number;
    dealsLost: number;
    avgDealSize: number;
    conversionRate: number;
    activitiesCount: number;
    trend: "up" | "down" | "stable";
  };
}

interface TeamPerformanceDrilldownProps {
  className?: string;
}

export const TeamPerformanceDrilldown: FC<TeamPerformanceDrilldownProps> = ({
  className,
}) => {
  const { data: salespeople, isLoading } = useSalespeople();
  const { deals } = usePipelineDeals();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [sortBy, setSortBy] = useState<"performance" | "revenue" | "activities">("performance");

  // Calculate performance metrics for each team member
  const teamWithPerformance: TeamMember[] = (salespeople || []).map((person) => {
    const personDeals = deals?.filter((d) => d.salesperson_id === person.id) || [];
    const wonDeals = personDeals.filter((d) => d.status === "won");
    const lostDeals = personDeals.filter((d) => d.status === "lost");
    const totalRevenue = wonDeals.reduce((acc, d) => acc + d.amount, 0);
    const avgDealSize = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
    const conversionRate =
      personDeals.length > 0
        ? Math.round((wonDeals.length / personDeals.length) * 100)
        : 0;

    // Simulated goal progress (replace with actual data)
    const goalProgress = Math.min(100, Math.round(Math.random() * 40 + 60));

    return {
      ...person,
      performance: {
        goalProgress,
        totalRevenue,
        dealsWon: wonDeals.length,
        dealsLost: lostDeals.length,
        avgDealSize,
        conversionRate,
        activitiesCount: Math.round(Math.random() * 50 + 20),
        trend: goalProgress >= 80 ? "up" : goalProgress >= 50 ? "stable" : "down",
      },
    };
  });

  // Sort team members
  const sortedTeam = [...teamWithPerformance].sort((a, b) => {
    switch (sortBy) {
      case "revenue":
        return b.performance.totalRevenue - a.performance.totalRevenue;
      case "activities":
        return b.performance.activitiesCount - a.performance.activitiesCount;
      default:
        return b.performance.goalProgress - a.performance.goalProgress;
    }
  });

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-warning" />;
    }
  };

  const getPerformanceColor = (progress: number) => {
    if (progress >= 80) return "text-success";
    if (progress >= 50) return "text-warning";
    return "text-destructive";
  };

  const formatCurrency = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  if (isLoading) {
    return (
      <Card className={cn("glass border-border/40", className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-2 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn("glass border-border/40", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Performance da Equipe
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant={sortBy === "performance" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSortBy("performance")}
              >
                <Target className="h-3 w-3 mr-1" />
                Meta
              </Button>
              <Button
                variant={sortBy === "revenue" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSortBy("revenue")}
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Receita
              </Button>
              <Button
                variant={sortBy === "activities" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setSortBy("activities")}
              >
                <Activity className="h-3 w-3 mr-1" />
                Atividades
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[360px]">
            <div className="p-4 pt-0 space-y-2">
              <AnimatePresence mode="popLayout">
                {sortedTeam.map((member, index) => (
                  <motion.div
                    key={member.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-lg",
                      "bg-card/50 hover:bg-accent/50 border border-transparent",
                      "hover:border-border/50 cursor-pointer transition-all",
                      "hover:shadow-sm"
                    )}
                    onClick={() => setSelectedMember(member)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="text-sm font-bold w-5 text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-background">
                        <AvatarImage src={member.avatar_url || undefined} />
                        <AvatarFallback className="text-xs font-medium">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5">
                        {getTrendIcon(member.performance.trend)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0",
                            member.role === "sdr" && "border-blue-500/50 text-blue-500",
                            member.role === "closer" && "border-purple-500/50 text-purple-500",
                            member.role === "gestao" && "border-amber-500/50 text-amber-500"
                          )}
                        >
                          {member.role.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={member.performance.goalProgress}
                          className="h-1.5 flex-1"
                        />
                        <span
                          className={cn(
                            "text-xs font-medium tabular-nums",
                            getPerformanceColor(member.performance.goalProgress)
                          )}
                        >
                          {member.performance.goalProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-0.5 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {formatCurrency(member.performance.totalRevenue)}
                      </span>
                      <span>{member.performance.activitiesCount} atividades</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Drill-down Sheet */}
      <Sheet open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedMember && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-4 ring-background shadow-lg">
                    <AvatarImage src={selectedMember.avatar_url || undefined} />
                    <AvatarFallback className="text-lg font-medium">
                      {selectedMember.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-xl">{selectedMember.name}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1">
                      <Badge
                        className={cn(
                          selectedMember.role === "sdr" && "bg-blue-500",
                          selectedMember.role === "closer" && "bg-purple-500",
                          selectedMember.role === "gestao" && "bg-amber-500"
                        )}
                      >
                        {selectedMember.role.toUpperCase()}
                      </Badge>
                      {selectedMember.email && (
                        <span className="text-xs">{selectedMember.email}</span>
                      )}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">
                    Visão Geral
                  </TabsTrigger>
                  <TabsTrigger value="deals" className="flex-1">
                    Deals
                  </TabsTrigger>
                  <TabsTrigger value="activities" className="flex-1">
                    Atividades
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4 space-y-4">
                  {/* Goal Progress */}
                  <Card className="glass border-border/40">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Progresso da Meta</span>
                        <span
                          className={cn(
                            "text-2xl font-bold tabular-nums",
                            getPerformanceColor(selectedMember.performance.goalProgress)
                          )}
                        >
                          {selectedMember.performance.goalProgress}%
                        </span>
                      </div>
                      <Progress
                        value={selectedMember.performance.goalProgress}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>
                          {formatCurrency(selectedMember.performance.totalRevenue)} vendido
                        </span>
                        <span>Meta: {formatCurrency(100000)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="glass border-border/40">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xs">Receita Total</span>
                        </div>
                        <p className="text-lg font-bold">
                          {formatCurrency(selectedMember.performance.totalRevenue)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="glass border-border/40">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <BarChart3 className="h-4 w-4" />
                          <span className="text-xs">Ticket Médio</span>
                        </div>
                        <p className="text-lg font-bold">
                          {formatCurrency(selectedMember.performance.avgDealSize)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="glass border-border/40">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Target className="h-4 w-4" />
                          <span className="text-xs">Conversão</span>
                        </div>
                        <p className="text-lg font-bold">
                          {selectedMember.performance.conversionRate}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="glass border-border/40">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Activity className="h-4 w-4" />
                          <span className="text-xs">Atividades</span>
                        </div>
                        <p className="text-lg font-bold">
                          {selectedMember.performance.activitiesCount}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Deals Summary */}
                  <Card className="glass border-border/40">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium mb-3">Resumo de Deals</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-success/10">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span className="text-sm">Ganhos</span>
                          </div>
                          <span className="font-bold text-success">
                            {selectedMember.performance.dealsWon}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/10">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <span className="text-sm">Perdidos</span>
                          </div>
                          <span className="font-bold text-destructive">
                            {selectedMember.performance.dealsLost}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar Email
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar 1:1
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="deals" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Detalhes dos deals em breve</p>
                  </div>
                </TabsContent>

                <TabsContent value="activities" className="mt-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Histórico de atividades em breve</p>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
