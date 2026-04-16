import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { itemVariants } from "@/components/transitions/PageTransition";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFieldPicker } from "./ReportFieldPicker";
import { ReportFilterBuilder } from "./ReportFilterBuilder";
import { ReportPreview } from "./ReportPreview";
import { CrossObjectJoinPanel } from "./CrossObjectJoinPanel";
import { useReportExecution } from "@/hooks/reporting/useReportExecution";
import { useCreateCustomReport, useUpdateCustomReport, type CustomReport } from "@/hooks/reporting/useCustomReports";
import {
  ENTITY_LABELS, VIZ_LABELS, defaultConfigForEntity,
  type ReportEntity, type ReportConfig, type VizType, type CrossBaseEntity, type ReportJoin,
} from "@/hooks/reporting/reportBuilderHelpers";
import { Save, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialReport?: CustomReport;
  onSaved?: (report: CustomReport) => void;
}

export function ReportBuilder({ initialReport, onSaved }: Props) {
  const [name, setName] = useState(initialReport?.name ?? "");
  const [description, setDescription] = useState(initialReport?.description ?? "");
  const [isShared, setIsShared] = useState(initialReport?.is_shared ?? false);
  const [entity, setEntity] = useState<ReportEntity>(initialReport?.entity ?? "sales");
  const [config, setConfig] = useState<ReportConfig>(
    initialReport?.config ?? defaultConfigForEntity("sales"),
  );
  const [previewKey, setPreviewKey] = useState(0);

  const create = useCreateCustomReport();
  const update = useUpdateCustomReport();

  const exec = useReportExecution(initialReport?.id, config, 1, 100);

  const handleEntityChange = useCallback((v: ReportEntity) => {
    setEntity(v);
    setConfig(defaultConfigForEntity(v));
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) { toast.error("Nome obrigatório"); return; }
    if (config.columns.length === 0) { toast.error("Selecione ao menos uma coluna"); return; }

    if (initialReport) {
      const r = await update.mutateAsync({ id: initialReport.id, name, description, entity, config, is_shared: isShared });
      onSaved?.(r);
    } else {
      const r = await create.mutateAsync({ name, description, entity, config, is_shared: isShared });
      onSaved?.(r);
    }
  }, [name, description, entity, config, isShared, initialReport, create, update, onSaved]);

  const canPreview = useMemo(() => initialReport?.id && config.columns.length > 0, [initialReport, config]);

  return (
    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4 glass border-border/40 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Configuração</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Vendas por categoria" className="h-9 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea value={description ?? ""} onChange={(e) => setDescription(e.target.value)} rows={2} className="text-xs mt-1" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-xs">Compartilhar com a equipe</Label>
            <Switch checked={isShared} onCheckedChange={setIsShared} />
          </div>
        </div>

        <Tabs defaultValue="data" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="data" className="text-xs">Dados</TabsTrigger>
            <TabsTrigger value="filters" className="text-xs">Filtros</TabsTrigger>
            <TabsTrigger value="viz" className="text-xs">Visual</TabsTrigger>
          </TabsList>

          <TabsContent value="data" className="space-y-3 mt-3">
            <div>
              <Label className="text-xs">Entidade</Label>
              <Select value={entity} onValueChange={(v) => handleEntityChange(v as ReportEntity)}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ENTITY_LABELS) as ReportEntity[]).map((e) => (
                    <SelectItem key={e} value={e}>{ENTITY_LABELS[e]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {entity === "cross" && (
              <CrossObjectJoinPanel
                base={(config.base ?? "sales") as CrossBaseEntity}
                joins={config.joins ?? []}
                onBaseChange={(b) => setConfig({ ...config, base: b, columns: [] })}
                onJoinsChange={(j: ReportJoin[]) => setConfig({ ...config, joins: j })}
              />
            )}
            <div>
              <Label className="text-xs">Colunas ({config.columns.length})</Label>
              <div className="mt-1">
                <ReportFieldPicker
                  entity={entity}
                  selected={config.columns}
                  onChange={(cols) => setConfig({ ...config, columns: cols })}
                  base={config.base}
                  joins={config.joins}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="filters" className="mt-3">
            <ReportFilterBuilder
              entity={entity}
              filters={config.filters ?? []}
              onChange={(filters) => setConfig({ ...config, filters })}
              base={config.base}
              joins={config.joins}
            />
          </TabsContent>

          <TabsContent value="viz" className="space-y-3 mt-3">
            <div>
              <Label className="text-xs">Tipo de visualização</Label>
              <Select value={config.viz_type ?? "table"} onValueChange={(v) => setConfig({ ...config, viz_type: v as VizType })}>
                <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(VIZ_LABELS) as VizType[]).map((v) => (
                    <SelectItem key={v} value={v}>{VIZ_LABELS[v]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-2 border-t border-border/40">
          <Button onClick={handleSave} className="gap-2 flex-1" disabled={create.isPending || update.isPending}>
            <Save className="h-4 w-4" />
            {initialReport ? "Salvar" : "Criar relatório"}
          </Button>
          {canPreview && (
            <Button variant="outline" onClick={() => { setPreviewKey((k) => k + 1); exec.refetch(); }} className="gap-2">
              <Play className="h-4 w-4" /> Executar
            </Button>
          )}
        </div>
      </Card>

      <div className="space-y-3" key={previewKey}>
        {canPreview ? (
          <ReportPreview
            result={exec.data}
            isLoading={exec.isLoading || exec.isFetching}
            error={exec.error as Error | null}
            vizType={config.viz_type ?? "table"}
            columns={config.columns}
          />
        ) : (
          <Card className="p-12 glass border-border/40 text-center">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              {initialReport ? "Selecione colunas para visualizar" : "Salve o relatório para ver o preview"}
            </p>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
