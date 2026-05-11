import { useState, useMemo } from "react";
import { 
  useEnablementAssets, 
  useLogAssetUsage, 
  useCreateAsset, 
  usePlaybooks,
  useAssetEfficiency,
  type EnablementAsset,
  type Playbook 
} from "@/hooks/useSalesEnablement";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Eye, 
  ExternalLink, 
  Plus, 
  Search, 
  FileText, 
  Video, 
  Presentation, 
  FileSpreadsheet, 
  Target, 
  TrendingUp, 
  Shield, 
  Zap,
  BarChart3,
  CheckCircle2,
  Lock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "Todos" },
  { value: "pitch", label: "Pitch & Demo" },
  { value: "case_study", label: "Cases" },
  { value: "proposal", label: "Propostas" },
  { value: "battle_card", label: "Battle Cards" },
  { value: "training", label: "Treinamento" },
  { value: "general", label: "Geral" },
];

const typeIcon = (t: string) => {
  if (t === "video") return Video;
  if (t === "presentation") return Presentation;
  if (t === "spreadsheet") return FileSpreadsheet;
  return FileText;
};

const AssetCard = ({ asset }: { asset: EnablementAsset }) => {
  const log = useLogAssetUsage();
  const { data: efficiency } = useAssetEfficiency(asset.id);
  const Icon = typeIcon(asset.asset_type);
  const handleOpen = () => {
    log.mutate({ asset_id: asset.id, action: "view" });
    if (asset.file_url) window.open(asset.file_url, "_blank", "noopener,noreferrer");
  };
  return (
    <Card className="group hover:shadow-elegant transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="size-5" />
          </div>
          <Badge variant="secondary" className="text-xs gap-1">
            <Eye className="size-3" />
            {asset.view_count}
          </Badge>
        </div>
        <CardTitle className="text-base mt-3 line-clamp-2 group-hover:text-primary transition-colors">{asset.title}</CardTitle>
        {asset.description && (
          <CardDescription className="line-clamp-2 text-xs">{asset.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {efficiency && efficiency.deals_influenced > 0 && (
          <div className="p-2 rounded-lg bg-success/5 border border-success/20 space-y-1">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-success">
              <span>Eficiência de Conversão</span>
              <span>{efficiency.win_rate_influenced.toFixed(1)}%</span>
            </div>
            <Progress value={Number(efficiency.win_rate_influenced)} className="h-1 bg-success/20" />
            <p className="text-[9px] text-muted-foreground italic">Influenciou {efficiency.deals_influenced} deals fechados</p>
          </div>
        )}
        
        <div className="flex flex-wrap gap-1">
          {asset.funnel_stage && <Badge variant="outline" className="text-xs">{asset.funnel_stage}</Badge>}
          {asset.tags.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
          ))}
        </div>
        <Button size="sm" variant="outline" className="w-full" onClick={handleOpen} disabled={!asset.file_url}>
          <ExternalLink className="size-4 mr-2" />
          Abrir material
        </Button>
      </CardContent>
    </Card>
  );
};

const NewAssetDialog = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "general", asset_type: "document", file_url: "", funnel_stage: "" });
  const create = useCreateAsset();
  const submit = async () => {
    await create.mutateAsync(form);
    setOpen(false);
    setForm({ title: "", description: "", category: "general", asset_type: "document", file_url: "", funnel_stage: "" });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="size-4 mr-2" />Novo material</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar material</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><Label>Descrição</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Categoria</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.filter((c) => c.value !== "all").map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div><Label>Tipo</Label>
              <select className="w-full h-10 px-3 rounded-md border border-input bg-background" value={form.asset_type} onChange={(e) => setForm({ ...form, asset_type: e.target.value })}>
                <option value="document">Documento</option>
                <option value="presentation">Apresentação</option>
                <option value="video">Vídeo</option>
                <option value="spreadsheet">Planilha</option>
              </select>
            </div>
          </div>
          <div><Label>URL do arquivo</Label><Input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." /></div>
          <div><Label>Estágio do funil (opcional)</Label><Input value={form.funnel_stage} onChange={(e) => setForm({ ...form, funnel_stage: e.target.value })} placeholder="ex: prospecting, proposal" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!form.title || create.isPending}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const SalesEnablementHub = () => {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const { data: assets, isLoading } = useEnablementAssets(category);

  const filtered = (assets ?? []).filter((a) =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-page-title font-bold flex items-center gap-2">
            <BookOpen className="size-7 text-primary" />
            Sales Enablement Hub
          </h1>
          <p className="text-muted-foreground mt-1">Materiais, propostas e treinamentos para acelerar suas vendas</p>
        </div>
        <NewAssetDialog />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input placeholder="Buscar por título ou tag..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap h-auto">
          {CATEGORIES.map((c) => <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>)}
        </TabsList>
        <TabsContent value={category} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <BookOpen className="size-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum material encontrado nesta categoria.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((a) => <AssetCard key={a.id} asset={a} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
