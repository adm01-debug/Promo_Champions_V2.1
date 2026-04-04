import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageTemplate,
  Channel,
  useCreateTemplate,
  useDeleteTemplate,
} from "@/hooks/useMultichannel";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, Copy, FileText, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  templates: MessageTemplate[];
  isLoading: boolean;
  channelConfig: Record<string, { label: string; icon: typeof MessageCircle; color: string }>;
}

export function TemplateManager({ templates, isLoading, channelConfig }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("geral");
  const { salesperson } = useAuth();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleCreate = () => {
    if (!name.trim() || !body.trim() || !salesperson?.id) return;

    // Extract {{variables}} from body
    const vars = (body.match(/\{\{(\w+)\}\}/g) || []).map(v => v.replace(/[{}]/g, ""));

    createTemplate.mutate({
      name: name.trim(),
      channel,
      subject: subject.trim() || undefined,
      body: body.trim(),
      variables: vars,
      category: category.trim() || "geral",
      salesperson_id: salesperson.id,
    }, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        setBody("");
        setSubject("");
      },
    });
  };

  const handleCopy = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.body);
    toast.success("Template copiado para a área de transferência");
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">
          Templates de Mensagem ({templates.length})
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome do template"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Categoria"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              {channel === "email" && (
                <Input
                  placeholder="Assunto do email"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              )}
              <div>
                <Textarea
                  placeholder="Corpo da mensagem... Use {{nome}} para variáveis"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Use {"{{variável}}"} para criar placeholders dinâmicos
                </p>
              </div>
              <Button onClick={handleCreate} disabled={!name.trim() || !body.trim()} className="w-full">
                Criar Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templates.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground glass border-border/40">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhum template criado</p>
          <p className="text-sm mt-1">Crie templates para agilizar sua comunicação</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map(tpl => {
            const cfg = channelConfig[tpl.channel];
            const Icon = cfg?.icon || FileText;

            return (
              <Card key={tpl.id} className="glass border-border/40 hover-lift transition-all">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn("p-1.5 rounded-md bg-muted/50")}>
                        <Icon className={cn("h-3.5 w-3.5", cfg?.color)} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-sm truncate">{tpl.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {cfg?.label || tpl.channel}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {tpl.category}
                          </Badge>
                          {tpl.usage_count > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {tpl.usage_count}x usado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" aria-label="Copiar template" className="h-7 w-7" onClick={() => handleCopy(tpl)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-status-error hover:text-status-error"
                        onClick={() => deleteTemplate.mutate(tpl.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {tpl.body}
                  </p>
                  {tpl.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tpl.variables.map(v => (
                        <Badge key={v} variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                          {`{{${v}}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
