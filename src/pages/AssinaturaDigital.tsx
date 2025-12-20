import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  PenTool, 
  Plus, 
  FileSignature, 
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Download,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Document {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'expired';
  signers: { name: string; email: string; status: string; signed_at?: string }[];
  created_at: string;
  expires_at?: string;
}

// Mock data - in production this would come from an API/database
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Contrato de Vendas - Cliente ABC',
    description: 'Contrato padrão de prestação de serviços',
    status: 'pending',
    signers: [
      { name: 'João Silva', email: 'joao@clienteabc.com', status: 'pending' },
      { name: 'Maria Santos', email: 'maria@empresa.com', status: 'signed', signed_at: '2024-01-15T10:30:00' },
    ],
    created_at: '2024-01-10T09:00:00',
    expires_at: '2024-02-10T23:59:59',
  },
  {
    id: '2',
    title: 'Proposta Comercial - Projeto XYZ',
    description: 'Proposta de implementação do sistema',
    status: 'signed',
    signers: [
      { name: 'Pedro Costa', email: 'pedro@xyz.com', status: 'signed', signed_at: '2024-01-12T14:00:00' },
    ],
    created_at: '2024-01-05T11:00:00',
  },
  {
    id: '3',
    title: 'NDA - Parceria Estratégica',
    description: 'Acordo de confidencialidade',
    status: 'draft',
    signers: [],
    created_at: '2024-01-18T08:00:00',
  },
];

export default function AssinaturaDigital() {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [isOpen, setIsOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: '',
    description: '',
    signerName: '',
    signerEmail: '',
  });

  const handleCreateDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      title: newDoc.title,
      description: newDoc.description,
      status: 'draft',
      signers: newDoc.signerEmail ? [{ name: newDoc.signerName, email: newDoc.signerEmail, status: 'pending' }] : [],
      created_at: new Date().toISOString(),
    };
    
    setDocuments(prev => [newDocument, ...prev]);
    setIsOpen(false);
    setNewDoc({ title: '', description: '', signerName: '', signerEmail: '' });
    
    toast({
      title: "Documento criado",
      description: "O documento foi criado como rascunho.",
    });
  };

  const handleSendForSignature = (docId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId 
        ? { ...doc, status: 'pending' as const, expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
        : doc
    ));
    
    toast({
      title: "Documento enviado",
      description: "O documento foi enviado para assinatura.",
    });
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      draft: { variant: "outline", label: "Rascunho", icon: <FileSignature className="h-3 w-3" /> },
      pending: { variant: "secondary", label: "Aguardando", icon: <Clock className="h-3 w-3" /> },
      signed: { variant: "default", label: "Assinado", icon: <CheckCircle2 className="h-3 w-3" /> },
      rejected: { variant: "destructive", label: "Rejeitado", icon: <XCircle className="h-3 w-3" /> },
      expired: { variant: "destructive", label: "Expirado", icon: <Clock className="h-3 w-3" /> },
    };
    
    const config = configs[status] || configs.draft;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const pendingDocs = documents.filter(d => d.status === 'pending').length;
  const signedDocs = documents.filter(d => d.status === 'signed').length;
  const draftDocs = documents.filter(d => d.status === 'draft').length;

  return (
    <>
      <Helmet>
        <title>Assinatura Digital | SalesPro</title>
        <meta name="description" content="Gerencie documentos e assinaturas digitais" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <PenTool className="h-6 w-6 text-primary" />
                Assinatura Digital
              </h1>
              <p className="text-muted-foreground">
                Crie, envie e gerencie documentos para assinatura eletrônica
              </p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Novo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Documento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título do Documento *</Label>
                    <Input 
                      value={newDoc.title}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ex: Contrato de Vendas"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea 
                      value={newDoc.description}
                      onChange={(e) => setNewDoc(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do documento..."
                      rows={3}
                    />
                  </div>
                  <div className="border-t pt-4">
                    <Label className="text-sm text-muted-foreground">Signatário (opcional)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input 
                        value={newDoc.signerName}
                        onChange={(e) => setNewDoc(prev => ({ ...prev, signerName: e.target.value }))}
                        placeholder="Nome do signatário"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={newDoc.signerEmail}
                        onChange={(e) => setNewDoc(prev => ({ ...prev, signerEmail: e.target.value }))}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                  <Button onClick={handleCreateDocument} disabled={!newDoc.title}>
                    Criar Documento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  Total de Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
              </CardContent>
            </Card>

            <Card className="glass border-status-warning/30 bg-status-warning/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-status-warning flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Aguardando Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-warning">{pendingDocs}</div>
              </CardContent>
            </Card>

            <Card className="glass border-status-success/30 bg-status-success/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-status-success flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Assinados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-status-success">{signedDocs}</div>
              </CardContent>
            </Card>

            <Card className="glass border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  Rascunhos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{draftDocs}</div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Table */}
          <Card className="glass border-border/40">
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Lista de todos os documentos criados</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Documento</TableHead>
                      <TableHead>Signatários</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Criado em</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            {doc.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                                {doc.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {doc.signers.length > 0 ? (
                            <div className="space-y-1">
                              {doc.signers.map((signer, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  {signer.status === 'signed' ? (
                                    <CheckCircle2 className="h-3 w-3 text-status-success" />
                                  ) : (
                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                  )}
                                  <span>{signer.name}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Nenhum</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(doc.status)}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {doc.status === 'draft' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleSendForSignature(doc.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {doc.status === 'signed' && (
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <PenTool className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum documento criado.</p>
                  <p className="text-sm">Clique em "Novo Documento" para começar.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="glass border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <FileSignature className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Integração com Serviços de Assinatura</h3>
                  <p className="text-sm text-muted-foreground">
                    Este módulo pode ser integrado com serviços como DocuSign, Clicksign ou D4Sign 
                    para assinaturas digitais com validade jurídica. Entre em contato para configurar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
