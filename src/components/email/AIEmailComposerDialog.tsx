import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, RefreshCw, Send, Copy, Clock, Lightbulb } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useComposeEmail, useSendComposedEmail, type ComposeEmailResult } from "@/hooks/email/useComposeEmail";
import {
  GOAL_OPTIONS,
  TONE_OPTIONS,
  LANGUAGE_OPTIONS,
  LENGTH_OPTIONS,
  composeFormSchema,
  DEFAULT_COMPOSE_VALUES,
  type ComposeFormValues,
  type RecipientType,
} from "./aiEmailHelpers";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recipientId?: string;
  recipientType?: RecipientType;
  recipientEmail?: string;
  recipientName?: string;
  recipientCompany?: string;
  clientId?: string;
}

export function AIEmailComposerDialog({
  open,
  onOpenChange,
  recipientId,
  recipientType = "manual",
  recipientEmail,
  recipientName,
  recipientCompany,
  clientId,
}: Props) {
  const [result, setResult] = useState<ComposeEmailResult | null>(null);
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");
  const [toEmail, setToEmail] = useState(recipientEmail ?? "");

  const compose = useComposeEmail();
  const send = useSendComposedEmail();

  const form = useForm<ComposeFormValues>({
    resolver: zodResolver(composeFormSchema),
    defaultValues: DEFAULT_COMPOSE_VALUES,
  });

  const handleGenerate = async (values: ComposeFormValues) => {
    const data = await compose.mutateAsync({
      ...values,
      recipient_id: recipientId,
      recipient_type: recipientType,
      contact_context: recipientType === "manual" && recipientName
        ? { name: recipientName, company: recipientCompany }
        : undefined,
    });
    setResult(data);
    setEditedSubject(data.subject);
    setEditedBody(data.body_text);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`Assunto: ${editedSubject}\n\n${editedBody}`);
    toast({ title: "Copiado", description: "Assunto e corpo copiados para a área de transferência." });
  };

  const handleSend = async () => {
    if (!toEmail || !result) return;
    await send.mutateAsync({
      to: toEmail,
      subject: editedSubject,
      body_text: editedBody,
      body_html: result.body_html,
      recipient_name: recipientName,
      client_id: clientId,
    });
    onOpenChange(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setResult(null);
      setEditedSubject("");
      setEditedBody("");
      compose.reset();
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Escrever e-mail com IA
          </DialogTitle>
          <DialogDescription>
            Gere um e-mail profissional personalizado em segundos.
            {recipientName && (
              <span className="ml-1 text-foreground">
                Para: <strong>{recipientName}</strong>
                {recipientCompany && ` (${recipientCompany})`}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {GOAL_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tom</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {TONE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {LENGTH_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="custom_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções extras (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: mencionar nosso case com a empresa X, oferecer demo de 15min..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" loading={compose.isPending} loadingText="Gerando..." className="w-full" variant="glow">
              <Sparkles className="h-4 w-4" />
              {result ? "Regenerar" : "Gerar com IA"}
            </Button>
          </form>
        </Form>

        {result && (
          <div className="space-y-3 border-t pt-4 mt-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" /> {result.suggested_send_time}
              </Badge>
              {result.variables_used?.length > 0 && (
                <Badge variant="outline">{result.variables_used.length} variáveis</Badge>
              )}
            </div>

            <div>
              <Label htmlFor="ai-subject">Assunto</Label>
              <Input
                id="ai-subject"
                value={editedSubject}
                onChange={(e) => setEditedSubject(e.target.value)}
                maxLength={120}
              />
            </div>

            <div>
              <Label htmlFor="ai-body">Corpo</Label>
              <Textarea
                id="ai-body"
                value={editedBody}
                onChange={(e) => setEditedBody(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            {result.follow_up_hint && (
              <div className="flex gap-2 text-sm text-muted-foreground bg-muted/40 rounded-md p-3">
                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-status-warning" />
                <span><strong className="text-foreground">Follow-up:</strong> {result.follow_up_hint}</span>
              </div>
            )}

            <div>
              <Label htmlFor="ai-to">Destinatário (e-mail)</Label>
              <Input
                id="ai-to"
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="contato@empresa.com"
              />
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleCopy} className="gap-1">
                <Copy className="h-4 w-4" /> Copiar
              </Button>
              <Button variant="outline" onClick={() => form.handleSubmit(handleGenerate)()} loading={compose.isPending}>
                <RefreshCw className="h-4 w-4" /> Regenerar
              </Button>
              <Button onClick={handleSend} loading={send.isPending} disabled={!toEmail} variant="glow-success" className="gap-1">
                <Send className="h-4 w-4" /> Enviar agora
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
