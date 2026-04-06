import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PenTool, Plus, FileSignature, Clock, CheckCircle2, XCircle, Send, Download, Eye, Trash2, Loader2 } from "lucide-react";
import { useDigitalSignatures } from "@/hooks/useDigitalSignatures";
import { SignatureStatsCards } from "@/components/signature/SignatureStatsCards";

const getStatusBadge = (status: string) => {
  const configs: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
    draft: { variant: "outline", label: "Rascunho", icon: <FileSignature className="h-3 w-3" /> },
    pending: { variant: "secondary", label: "Aguardando", icon: <Clock className="h-3 w-3" /> },
    signed: { variant: "default", label: "Assinado", icon: <CheckCircle2 className="h-3 w-3" /> },
    rejected: { variant: "destructive", label: "Rejeitado", icon: <XCircle className="h-3 w-3" /> },
    expired: { variant: "destructive", label: "Expirado", icon: <Clock className="h-3 w-3" /> },
  };
  const config = configs[status] || configs.draft;
  return <Badge variant={config.variant} className="gap-1">{config.icon}{config.label}</Badge>;
};

export default function AssinaturaDigital() {
  const { documents, isLoading, createDocument, sendForSignature, deleteDocument } = useDigitalSignatures();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState({ title: '', description: '', signerName: '', signerEmail: '' });

  const handleCreateDocument = () => {
    const signers = newDoc.signerEmail ? [{ name: newDoc.signerName, email: newDoc.signerEmail }] : [];
    createDocument.mutate({ title: newDoc.title, description: newDoc.description, signers }, {
      onSuccess: () => { setIsOpen(false); setNewDoc({ title: '', description: '', signerName: '', signerEmail: '' }); }
    });
  };

  return (
    <>
      <Helmet>
        <title>Assinatura Digital | PROMO CHAMPIONS</title>
        <meta name="description" content="Gerencie documentos e assinaturas digitais" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-page-title flex items-center gap-2"><PenTool className="h-6 w-6 text-primary" />Assinatura Digital</h1>
              <p className="text-muted-foreground">Crie, envie e gerencie documentos para assinatura eletrônica</p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" />Novo Documento</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Criar Documento</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Título do Documento *</Label><Input value={newDoc.title} onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))} placeholder="Ex: Contrato de Vendas" /></div>
                  <div className="space-y-2"><Label>Descrição</Label><Textarea value={newDoc.description} onChange={(e) => setNewDoc(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição do documento..." rows={3} /></div>
                  <div className="border-t pt-4"><Label className="text-sm text-muted-foreground">Signatário (opcional)</Label></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Nome</Label><Input value={newDoc.signerName} onChange={(e) => setNewDoc(prev => ({ ...prev, signerName: e.target.value }))} placeholder="Nome do signatário" /></div>
                    <div className="space-y-2"><Label>Email</Label><Input type="email" value={newDoc.signerEmail} onChange={(e) => setNewDoc(prev => ({ ...prev, signerEmail: e.target.value }))} placeholder="email@exemplo.com" /></div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateDocument} disabled={!newDoc.title || createDocument.isPending}>{createDocument.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Documento</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <SignatureStatsCards total={documents.length} pending={documents.filter(d => d.status === 'pending').length} signed={documents.filter(d => d.status === 'signed').length} drafts={documents.filter(d => d.status === 'draft').length} isLoading={isLoading} />

          {/* Documents Table */}
          <Card className="glass border-border/40">
            <CardHeader><CardTitle>Documentos</CardTitle><CardDescription>Lista de todos os documentos criados</CardDescription></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 w-full rounded bg-muted animate-pulse" />)}</div>
              ) : documents.length > 0 ? (
                <Table>
                  <TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Signatários</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-center">Criado em</TableHead><TableHead className="text-center">Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell><div><div className="font-medium">{doc.title}</div>{doc.description && <div className="text-xs text-muted-foreground truncate max-w-[300px]">{doc.description}</div>}</div></TableCell>
                        <TableCell>
                          {doc.document_signers?.length ? (
                            <div className="space-y-1">{doc.document_signers.map((s) => (
                              <div key={s.id} className="flex items-center gap-2 text-sm">
                                {s.status === 'signed' ? <CheckCircle2 className="h-3 w-3 text-status-success" /> : s.status === 'rejected' ? <XCircle className="h-3 w-3 text-destructive" /> : <Clock className="h-3 w-3 text-muted-foreground" />}
                                <span>{s.name}</span>
                              </div>
                            ))}</div>
                          ) : <span className="text-muted-foreground text-sm">Nenhum</span>}
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(doc.status)}</TableCell>
                        <TableCell className="text-center text-sm">{new Date(doc.created_at).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                            {doc.status === 'draft' && (<>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => sendForSignature.mutate(doc.id)} disabled={sendForSignature.isPending}><Send className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => { setDocumentToDelete(doc.id); setDeleteDialogOpen(true); }} disabled={deleteDocument.isPending}><Trash2 className="h-4 w-4" /></Button>
                            </>)}
                            {doc.status === 'signed' && <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Download className="h-4 w-4" /></Button>}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground"><PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhum documento criado.</p><p className="text-sm">Clique em "Novo Documento" para começar.</p></div>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10"><FileSignature className="h-6 w-6 text-primary" /></div>
                <div><h3 className="font-semibold mb-1">Integração com Serviços de Assinatura</h3><p className="text-sm text-muted-foreground">Este módulo pode ser integrado com serviços como DocuSign, Clicksign ou D4Sign para assinaturas digitais com validade jurídica. Entre em contato para configurar.</p></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Excluir documento?</AlertDialogTitle><AlertDialogDescription>Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (documentToDelete) deleteDocument.mutate(documentToDelete); setDeleteDialogOpen(false); setDocumentToDelete(null); }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
