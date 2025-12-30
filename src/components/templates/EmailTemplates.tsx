import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Copy, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  RefreshCw,
  Send,
  ThumbsUp,
  ThumbsDown,
  Edit
} from 'lucide-react';

interface TemplateData {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  usageCount: number;
}

interface EmailTemplateProps {
  template: TemplateData;
  onUse?: (content: string) => void;
  onEdit?: () => void;
}

export const EmailTemplate: FC<EmailTemplateProps> = ({ template, onUse, onEdit }) => {
  const [preview, setPreview] = useState(template.content);

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h4 className="font-medium">{template.name}</h4>
          </div>
          <Badge variant="outline" className="mt-1 text-xs">
            {template.category}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(preview)}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm">
        {preview}
      </div>

      {template.variables.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {template.variables.map((variable) => (
            <Badge key={variable} variant="secondary" className="text-xs">
              {`{{${variable}}}`}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Usado {template.usageCount} vezes
        </span>
        <Button size="sm" onClick={() => onUse?.(preview)}>
          <Send className="h-4 w-4 mr-2" />
          Usar Template
        </Button>
      </div>
    </Card>
  );
};

interface MessageComposerProps {
  type: 'email' | 'whatsapp' | 'linkedin';
  recipientName?: string;
  onSend?: (message: string) => void;
  onGenerateAI?: () => void;
}

export const MessageComposer: FC<MessageComposerProps> = ({
  type,
  recipientName,
  onSend,
  onGenerateAI
}) => {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const icons = {
    email: Mail,
    whatsapp: MessageSquare,
    linkedin: MessageSquare
  };
  const Icon = icons[type];

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setMessage(`Olá ${recipientName || '[Nome]'},\n\nEspero que esteja bem! Gostaria de conversar sobre como podemos ajudar sua empresa a alcançar melhores resultados.\n\nPodemos agendar uma conversa rápida?\n\nAbraços`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-medium capitalize">{type}</span>
        {recipientName && (
          <span className="text-muted-foreground">para {recipientName}</span>
        )}
      </div>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite sua mensagem..."
        className="min-h-[150px] mb-4"
      />

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Gerar com IA
        </Button>
        <Button onClick={() => onSend?.(message)} disabled={!message.trim()}>
          <Send className="h-4 w-4 mr-2" />
          Enviar
        </Button>
      </div>
    </Card>
  );
};

interface TemplateLibraryProps {
  templates: TemplateData[];
  onSelect?: (template: TemplateData) => void;
  onCreateNew?: () => void;
}

export const TemplateLibrary: FC<TemplateLibraryProps> = ({ 
  templates, 
  onSelect,
  onCreateNew 
}) => {
  const [filter, setFilter] = useState<string>('all');
  
  const categories = ['all', ...new Set(templates.map(t => t.category))];
  const filtered = filter === 'all' 
    ? templates 
    : templates.filter(t => t.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={filter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'Todos' : cat}
            </Button>
          ))}
        </div>
        <Button onClick={onCreateNew}>
          <FileText className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((template) => (
          <Card 
            key={template.id} 
            className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onSelect?.(template)}
          >
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-primary" />
              <h4 className="font-medium">{template.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {template.content}
            </p>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">{template.category}</Badge>
              <span className="text-xs text-muted-foreground">
                {template.usageCount} usos
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
