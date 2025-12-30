import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquareWarning, 
  Bug, 
  Lightbulb, 
  HelpCircle,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  ExternalLink
} from 'lucide-react';

interface FeedbackFormProps {
  type?: 'bug' | 'feature' | 'feedback' | 'question';
  onSubmit?: (data: { type: string; title: string; description: string; rating?: number }) => void;
}

export const FeedbackForm: FC<FeedbackFormProps> = ({ type = 'feedback', onSubmit }) => {
  const [formType, setFormType] = useState(type);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);

  const types = [
    { id: 'bug', icon: Bug, label: 'Bug', color: 'text-red-500' },
    { id: 'feature', icon: Lightbulb, label: 'Sugestão', color: 'text-yellow-500' },
    { id: 'feedback', icon: MessageSquareWarning, label: 'Feedback', color: 'text-blue-500' },
    { id: 'question', icon: HelpCircle, label: 'Dúvida', color: 'text-green-500' }
  ];

  const handleSubmit = () => {
    onSubmit?.({ type: formType, title, description, rating: rating || undefined });
    setTitle('');
    setDescription('');
    setRating(0);
  };

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-4">Enviar Feedback</h4>

      <div className="flex gap-2 mb-4">
        {types.map((t) => (
          <Button
            key={t.id}
            variant={formType === t.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFormType(t.id as typeof formType)}
          >
            <t.icon className={`h-4 w-4 mr-1 ${formType === t.id ? '' : t.color}`} />
            {t.label}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <Textarea
          placeholder="Descreva em detalhes..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[120px]"
        />

        {formType === 'feedback' && (
          <div>
            <label className="text-sm font-medium mb-2 block">Sua avaliação</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1"
                >
                  <Star 
                    className={`h-6 w-6 ${
                      star <= rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={!title.trim() || !description.trim()}
        >
          <Send className="h-4 w-4 mr-2" />
          Enviar
        </Button>
      </div>
    </Card>
  );
};

interface NPSWidgetProps {
  question?: string;
  onSubmit?: (score: number, comment?: string) => void;
}

export const NPSWidget: FC<NPSWidgetProps> = ({ 
  question = "Qual a probabilidade de recomendar nosso produto?",
  onSubmit 
}) => {
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (score !== null) {
      onSubmit?.(score, comment || undefined);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Card className="p-6 text-center">
        <ThumbsUp className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h4 className="font-semibold mb-2">Obrigado pelo feedback!</h4>
        <p className="text-sm text-muted-foreground">
          Sua opinião é muito importante para nós.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h4 className="font-semibold mb-4 text-center">{question}</h4>

      <div className="flex justify-center gap-1 mb-4">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            onClick={() => setScore(num)}
            className={`w-9 h-9 rounded border text-sm font-medium transition-colors ${
              score === num 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'hover:border-primary'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>Pouco provável</span>
        <span>Muito provável</span>
      </div>

      {score !== null && (
        <>
          <Textarea
            placeholder="Algum comentário adicional? (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4"
          />
          <Button className="w-full" onClick={handleSubmit}>
            Enviar Resposta
          </Button>
        </>
      )}
    </Card>
  );
};

interface HelpCenterProps {
  articles: {
    id: string;
    title: string;
    category: string;
    excerpt: string;
  }[];
  onArticleClick?: (articleId: string) => void;
  onContactSupport?: () => void;
}

export const HelpCenter: FC<HelpCenterProps> = ({
  articles,
  onArticleClick,
  onContactSupport
}) => {
  const [search, setSearch] = useState('');
  
  const filtered = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Central de Ajuda</h4>
      </div>

      <Input
        placeholder="Buscar artigos..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="space-y-3 mb-4">
        {filtered.slice(0, 5).map((article) => (
          <div 
            key={article.id}
            className="p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => onArticleClick?.(article.id)}
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs mb-1">{article.category}</Badge>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
            <h5 className="font-medium">{article.title}</h5>
            <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full" onClick={onContactSupport}>
        <MessageSquareWarning className="h-4 w-4 mr-2" />
        Falar com Suporte
      </Button>
    </Card>
  );
};
