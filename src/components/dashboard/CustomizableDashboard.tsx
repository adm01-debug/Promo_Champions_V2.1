import { useState, useCallback } from "react";
import {
  useDashboardLayout,
  useSaveDashboardLayout,
  AVAILABLE_WIDGETS,
  WidgetConfig,
} from "@/hooks/dashboard/useDashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { toast } from "sonner";

// Real widget components
import { RevenueKpiWidget } from "./widgets/RevenueKpiWidget";
import { ActivitiesTodayWidget } from "./widgets/ActivitiesTodayWidget";
import { ConversionRateWidget } from "./widgets/ConversionRateWidget";
import { GoalProgressWidget } from "./widgets/GoalProgressWidget";
import { ForecastWidget } from "./widgets/ForecastWidget";
import { PipelineFunnelWidget } from "./widgets/PipelineFunnelWidget";
import { TopDealsWidget } from "./widgets/TopDealsWidget";
import { RecentActivitiesWidget } from "./widgets/RecentActivitiesWidget";
import { TeamRankingWidget } from "./widgets/TeamRankingWidget";
import { CalendarPreviewWidget } from "./widgets/CalendarPreviewWidget";
import { CustomReportWidget } from "./widgets/CustomReportWidget";
import { CustomReportWidgetEditor } from "./widgets/CustomReportWidgetEditor";
import { Pencil } from "lucide-react";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { AISalesCoachWidget } from "./widgets/AISalesCoachWidget";

const WIDGET_COMPONENTS: Record<string, React.ComponentType> = {
  revenue_kpi: RevenueKpiWidget,
  pipeline_funnel: PipelineFunnelWidget,
  activities_today: ActivitiesTodayWidget,
  top_deals: TopDealsWidget,
  conversion_rate: ConversionRateWidget,
  recent_activities: RecentActivitiesWidget,
  goal_progress: GoalProgressWidget,
  team_ranking: TeamRankingWidget,
  forecast_summary: ForecastWidget,
  calendar_preview: CalendarPreviewWidget,
  ai_sales_coach: AISalesCoachWidget,
};

function RealWidget({ config, onEdit }: { config: WidgetConfig; onEdit?: () => void }) {
  if (config.type === "custom_report") {
    const cfg = (config.config ?? {}) as { report_id?: string; height?: number };
    return (
      <div className="relative h-full group">
        <CustomReportWidget reportId={cfg.report_id} height={cfg.height} />
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-10 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onEdit}
            title="Editar widget"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }
  const Component = WIDGET_COMPONENTS[config.type];
  if (!Component) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-xs text-muted-foreground">Widget não encontrado</p>
        </CardContent>
      </Card>
    );
  }
  return <Component />;
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
                    <Button size="sm" variant="outline" className="gap-1 h-7 text-xs" onClick={() => onAddWidget(widget.type)}>
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
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentLayout = layout || savedLayout || [];
  const editingWidget = currentLayout.find(w => w.id === editingId) ?? null;

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
    if (type === "custom_report") setEditingId(newWidget.id);
  }, [currentLayout]);

  const handleSaveCustomReport = useCallback((cfg: { report_id: string; height: number }) => {
    if (!editingId) return;
    const updated = currentLayout.map(w => w.id === editingId ? { ...w, config: cfg } : w);
    setLayout(updated);
    setHasChanges(true);
  }, [currentLayout, editingId]);

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
            <RealWidget key={widget.id} config={widget} onEdit={widget.type === "custom_report" ? () => setEditingId(widget.id) : undefined} />
          ))}
        </div>
      )}

      {/* Large Widgets */}
      {largeWidgets.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-4">
          {largeWidgets.map(widget => (
            <RealWidget key={widget.id} config={widget} onEdit={widget.type === "custom_report" ? () => setEditingId(widget.id) : undefined} />
          ))}
        </div>
      )}

      {visibleWidgets.length === 0 && (
        <div className="max-w-2xl mx-auto py-12">
          <DashboardEmptyState type="revenue" hero={true} />
        </div>
      )}

      <CustomReportWidgetEditor
        open={!!editingWidget && editingWidget.type === "custom_report"}
        onOpenChange={(o) => !o && setEditingId(null)}
        initialReportId={(editingWidget?.config as { report_id?: string } | undefined)?.report_id}
        initialHeight={(editingWidget?.config as { height?: number } | undefined)?.height}
        onSave={handleSaveCustomReport}
      />
    </div>
  );
}
