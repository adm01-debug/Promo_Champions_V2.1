import { useState, useCallback } from "react";
import {
  useDashboardLayout,
  useSaveDashboardLayout,
  AVAILABLE_WIDGETS,
  WidgetConfig,
} from "@/hooks/useDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutGrid,
  Plus,
  Settings2,
  Save,
  RotateCcw,
  GripVertical,
  Eye,
  EyeOff,
  TrendingUp,
  Target,
  Activity,
  Star,
  BarChart3,
  Clock,
  Trophy,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WIDGET_ICONS: Record<string, React.ReactNode> = {
  revenue_kpi: <TrendingUp className="h-5 w-5 text-primary" />,
  pipeline_funnel: <BarChart3 className="h-5 w-5 text-status-info" />,
  activities_today: <Activity className="h-5 w-5 text-status-warning" />,
  top_deals: <Star className="h-5 w-5 text-status-success" />,
  conversion_rate: <TrendingUp className="h-5 w-5 text-status-purple" />,
  recent_activities: <Clock className="h-5 w-5 text-muted-foreground" />,
  goal_progress: <Target className="h-5 w-5 text-primary" />,
  team_ranking: <Trophy className="h-5 w-5 text-status-warning" />,
  forecast_summary: <TrendingUp className="h-5 w-5 text-status-success" />,
  calendar_preview: <Calendar className="h-5 w-5 text-status-info" />,
};

function WidgetPlaceholder({ config }: { config: WidgetConfig }) {
  const icon = WIDGET_ICONS[config.type] || <LayoutGrid className="h-5 w-5" />;
  const widgetMeta = AVAILABLE_WIDGETS.find(w => w.type === config.type);

  return (
    <Card className={cn(
      "h-full transition-all hover:shadow-md border-border/50",
      !config.visible && "opacity-40"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-display flex items-center gap-2">
          <GripVertical className="h-3 w-3 text-muted-foreground cursor-grab" />
          {icon}
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="text-center py-4">
          <p className="text-3xl font-bold text-primary">—</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {widgetMeta?.description || "Widget"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function WidgetManagerDialog({
  layout,
  onToggleWidget,
  onAddWidget,
}: {
  layout: WidgetConfig[];
  onToggleWidget: (id: string) => void;
  onAddWidget: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const activeTypes = layout.map(w => w.type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings2 className="h-4 w-4" />
          Gerenciar Widgets
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <LayoutGrid className="h-5 w-5 text-primary" />
            Widgets Disponíveis
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-2">
            {AVAILABLE_WIDGETS.map(widget => {
              const isActive = activeTypes.includes(widget.type);
              const existingWidget = layout.find(w => w.type === widget.type);

              return (
                <div
                  key={widget.type}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/30"
                >
                  <span className="text-xl">{widget.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{widget.title}</p>
                    <p className="text-xs text-muted-foreground">{widget.description}</p>
                  </div>
                  {isActive ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px]">Ativo</Badge>
                      <Switch
                        checked={existingWidget?.visible ?? true}
                        onCheckedChange={() => existingWidget && onToggleWidget(existingWidget.id)}
                      />
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => {
                      onAddWidget(widget.type);
                    }}>
                      <Plus className="h-3 w-3" />
                      Adicionar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export function CustomizableDashboard() {
  const { data: savedLayout, isLoading } = useDashboardLayout();
  const saveLayout = useSaveDashboardLayout();
  const [layout, setLayout] = useState<WidgetConfig[] | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const currentLayout = layout || savedLayout || [];

  const handleToggleWidget = useCallback((id: string) => {
    const updated = currentLayout.map(w =>
      w.id === id ? { ...w, visible: !w.visible } : w
    );
    setLayout(updated);
    setHasChanges(true);
  }, [currentLayout]);

  const handleAddWidget = useCallback((type: string) => {
    const widgetMeta = AVAILABLE_WIDGETS.find(w => w.type === type);
    if (!widgetMeta) return;

    const newWidget: WidgetConfig = {
      id: `w${Date.now()}`,
      type,
      title: widgetMeta.title,
      x: 0,
      y: currentLayout.length,
      w: widgetMeta.defaultW,
      h: widgetMeta.defaultH,
      visible: true,
    };

    setLayout([...currentLayout, newWidget]);
    setHasChanges(true);
    toast.success(`Widget "${widgetMeta.title}" adicionado!`);
  }, [currentLayout]);

  const handleSave = useCallback(() => {
    saveLayout.mutate(currentLayout, {
      onSuccess: () => setHasChanges(false),
    });
  }, [currentLayout, saveLayout]);

  const handleReset = useCallback(() => {
    setLayout(savedLayout || []);
    setHasChanges(false);
  }, [savedLayout]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 lg:p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const visibleWidgets = currentLayout.filter(w => w.visible);
  const smallWidgets = visibleWidgets.filter(w => w.w === 1 && w.h === 1);
  const largeWidgets = visibleWidgets.filter(w => w.w > 1 || w.h > 1);

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10">
            <LayoutGrid className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Meu Dashboard</h1>
            <p className="text-sm text-muted-foreground">Personalize seus widgets e métricas favoritas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WidgetManagerDialog
            layout={currentLayout}
            onToggleWidget={handleToggleWidget}
            onAddWidget={handleAddWidget}
          />
          {hasChanges && (
            <>
              <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Desfazer
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saveLayout.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                {saveLayout.isPending ? "Salvando..." : "Salvar Layout"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Row (small widgets) */}
      {smallWidgets.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {smallWidgets.map(widget => (
            <WidgetPlaceholder key={widget.id} config={widget} />
          ))}
        </div>
      )}

      {/* Large Widgets */}
      {largeWidgets.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          {largeWidgets.map(widget => (
            <WidgetPlaceholder key={widget.id} config={widget} />
          ))}
        </div>
      )}

      {visibleWidgets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <LayoutGrid className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="font-display font-semibold text-lg mb-1">Nenhum widget visível</h3>
            <p className="text-sm text-muted-foreground mb-4">Adicione widgets para montar seu dashboard personalizado</p>
            <WidgetManagerDialog
              layout={currentLayout}
              onToggleWidget={handleToggleWidget}
              onAddWidget={handleAddWidget}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
