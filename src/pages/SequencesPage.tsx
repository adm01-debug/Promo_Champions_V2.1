import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSequences, useCreateSequence, useDeleteSequence, useUpdateSequence, type Sequence } from "@/hooks/sequences/useSequences";
import { useTriggerSequenceRunner } from "@/hooks/sequences/useEnrollContacts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Play, Trash2, Users, Workflow, ArrowLeft, FlaskConical, Settings2 } from "lucide-react";
import { SequenceBuilder } from "@/components/sequences/SequenceBuilder";
import { SequenceEnrollmentsDrawer } from "@/components/sequences/SequenceEnrollmentsDrawer";
import { ABTestPanel } from "@/components/sequences/ABTestPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SequencesPage() {
  const { data: sequences, isLoading } = useSequences();
  const create = useCreateSequence();
  const update = useUpdateSequence();
  const del = useDeleteSequence();
  const runner = useTriggerSequenceRunner();

  const [selected, setSelected] = useState<Sequence | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    const created = await create.mutateAsync({ name, description: desc });
    setName(""); setDesc(""); setCreateOpen(false);
    setSelected(created);
  };

  if (selected) {
    return (
      <>
        <Helmet>
          <title>{selected.name} | Sequências</title>
        </Helmet>
        <div className="container mx-auto p-4 md:p-6 max-w-5xl space-y-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="ghost" size="icon-sm" onClick={() => setSelected(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold truncate">{selected.name}</h1>
                {selected.description && (
                  <p className="text-sm text-muted-foreground truncate">{selected.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border">
                <Switch
                  checked={selected.enabled}
                  onCheckedChange={(v) => update.mutate({ id: selected.id, enabled: v })}
                />
                <span className="text-sm">{selected.enabled ? "Ativa" : "Pausada"}</span>
              </div>
              <Button variant="outline" onClick={() => setEnrollOpen(true)}>
                <Users className="h-4 w-4 mr-2" />Inscritos
              </Button>
              <Button variant="outline" onClick={() => runner.mutate()} loading={runner.isPending}>
                <Play className="h-4 w-4 mr-2" />Executar agora
              </Button>
            </div>
          </div>
          <Tabs defaultValue="builder">
            <TabsList>
              <TabsTrigger value="builder"><Settings2 className="h-4 w-4 mr-2" />Builder</TabsTrigger>
              <TabsTrigger value="ab"><FlaskConical className="h-4 w-4 mr-2" />A/B Testing</TabsTrigger>
            </TabsList>
            <TabsContent value="builder" className="mt-4">
              <SequenceBuilder sequenceId={selected.id} />
            </TabsContent>
            <TabsContent value="ab" className="mt-4">
              <ABTestPanel sequenceId={selected.id} />
            </TabsContent>
          </Tabs>
          <SequenceEnrollmentsDrawer open={enrollOpen} onOpenChange={setEnrollOpen} sequenceId={selected.id} />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sequências | CRM</title>
        <meta name="description" content="Motor de sequências multistep multicanal: e-mail, WhatsApp, ligações e LinkedIn em cadências automatizadas." />
      </Helmet>
      <div className="container mx-auto p-4 md:p-6 max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Workflow className="h-7 w-7 text-primary" />Sequências <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase">10/10</Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Motor de engajamento avançado: A/B testing, IA personalizada e otimização de envio.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => runner.mutate()} loading={runner.isPending}>
              <Play className="h-4 w-4 mr-2" />Executar runner
            </Button>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Nova sequência</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Nova sequência</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Outbound C-Level" />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreate} loading={create.isPending} disabled={!name.trim()}>Criar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
          </div>
        ) : (sequences?.length ?? 0) === 0 ? (
          <Card className="p-12 text-center">
            <Workflow className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma sequência ainda</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              Crie sua primeira cadência multistep para automatizar follow-ups multicanal.
            </p>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />Criar primeira sequência
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sequences?.map((s) => (
              <Card key={s.id} className="p-5 hover:shadow-md transition-all cursor-pointer group" onClick={() => setSelected(s)}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{s.name}</h3>
                  <Badge variant={s.enabled ? "default" : "outline"}>
                    {s.enabled ? "Ativa" : "Pausada"}
                  </Badge>
                </div>
                {s.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{s.description}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    {s.exit_on_reply && "Pausa ao responder"}
                  </span>
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); del.mutate(s.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
