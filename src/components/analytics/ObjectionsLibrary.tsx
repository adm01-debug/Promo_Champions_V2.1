import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useObjectionsLibrary, useAddObjection, useUpdateObjection, useIncrementObjectionUsage, useDeleteObjection } from '@/hooks/useObjectionsLibrary';
import { BookOpen, Plus, Copy, Trash2, Search, ThumbsUp, MessageSquare, CheckCircle2, Sparkles, Tag, Star, Edit3, X, Filter, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'all', label: 'Todas' },
  { value: 'preco', label: 'Preço' },
  { value: 'tempo', label: 'Tempo/Urgência' },
  { value: 'concorrencia', label: 'Concorrência' },
  { value: 'autoridade', label: 'Autoridade/Decisão' },
  { value: 'confianca', label: 'Confiança' },
  { value: 'necessidade', label: 'Necessidade' },
  { value: 'general', label: 'Geral' },
];

const CATEGORY_COLORS: Record<string, string> = {
  preco: 'bg-status-error/20 text-status-error border-status-error/30',
  tempo: 'bg-status-warning/20 text-status-warning border-status-warning/30',
  concorrencia: 'bg-status-info/20 text-status-info border-status-info/30',
  autoridade: 'bg-status-purple/20 text-status-purple border-status-purple/30',
  confianca: 'bg-status-success/20 text-status-success border-status-success/30',
  necessidade: 'bg-primary/20 text-primary border-primary/30',
  general: 'bg-muted text-muted-foreground border-border',
};

export function ObjectionsLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingObjection, setEditingObjection] = useState<any>(null);
  const [newObjection, setNewObjection] = useState({ objection: '', response: '', category: 'general', tags: [] as string[], effectiveness_score: 5 });
  const [tagInput, setTagInput] = useState('');

  const { data: objections, isLoading } = useObjectionsLibrary(selectedCategory);
  const addObjection = useAddObjection();
  const updateObjection = useUpdateObjection();
  const incrementUsage = useIncrementObjectionUsage();
  const deleteObjection = useDeleteObjection();

  // Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!objections || objections.length === 0) return null;
    return new Fuse(objections, {
      keys: ['objection', 'response', 'category'],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [objections]);

  const filteredObjections = useMemo(() => {
    if (!objections) return [];
    if (!searchTerm.trim()) return objections;
    if (!fuse) return objections;
    return fuse.search(searchTerm).map(result => result.item);
  }, [objections, fuse, searchTerm]);

  const handleCopyResponse = async (id: string, response: string) => {
    await navigator.clipboard.writeText(response);
    incrementUsage.mutate(id);
    toast.success('Resposta copiada!');
  };

  const handleAddObjection = () => {
    if (!newObjection.objection.trim() || !newObjection.response.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    addObjection.mutate(newObjection, {
      onSuccess: () => {
        setNewObjection({ objection: '', response: '', category: 'general', tags: [], effectiveness_score: 5 });
        setIsAddDialogOpen(false);
      }
    });
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getCategoryColor = (value: string) => {
    return CATEGORY_COLORS[value] || CATEGORY_COLORS.general;
  };

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift animate-fade-in">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <span className="gradient-text font-display">Biblioteca de Objeções</span>
            {filteredObjections && filteredObjections.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                {filteredObjections.length}
              </Badge>
            )}
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="glow" className="gap-1.5 hover-lift">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border/50">
              <DialogHeader>
                <DialogTitle className="font-display flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Nova Objeção
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium font-display">Objeção do Cliente</label>
                  <Textarea
                    placeholder="Ex: Está muito caro..."
                    value={newObjection.objection}
                    onChange={(e) => setNewObjection({ ...newObjection, objection: e.target.value })}
                    className="mt-1.5 glass border-border/50 focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-display">Resposta Recomendada</label>
                  <Textarea
                    placeholder="Ex: Entendo sua preocupação com o investimento..."
                    value={newObjection.response}
                    onChange={(e) => setNewObjection({ ...newObjection, response: e.target.value })}
                    className="mt-1.5 glass border-border/50 focus:border-primary/50"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium font-display">Categoria</label>
                  <Select
                    value={newObjection.category}
                    onValueChange={(value) => setNewObjection({ ...newObjection, category: value })}
                  >
                    <SelectTrigger className="mt-1.5 glass border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-border/50">
                      {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddObjection} className="w-full hover-lift" variant="glow-pulse" disabled={addObjection.isPending}>
                  {addObjection.isPending ? 'Salvando...' : 'Salvar Objeção'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar objeção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 glass border-border/50 focus:border-primary/50"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40 glass border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass border-border/50">
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Objections List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-28 glass rounded-xl animate-pulse border border-border/30"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        ) : filteredObjections && filteredObjections.length > 0 ? (
          <ScrollArea className="h-[500px] pr-3">
            <div className="space-y-3">
              {filteredObjections.map((obj, index) => (
                <div 
                  key={obj.id} 
                  className="glass rounded-xl p-4 border border-border/40 dark:border-glow hover:border-primary/40 transition-all duration-300 hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`${getCategoryColor(obj.category)} text-xs border`}>
                          {getCategoryLabel(obj.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-full">
                          <ThumbsUp className="h-3 w-3" />
                          {obj.usage_count} usos
                        </span>
                      </div>
                      <p className="text-sm font-medium flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-status-error mt-0.5 shrink-0" />
                        <span className="italic text-muted-foreground leading-relaxed">"{obj.objection}"</span>
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon" aria-label="Copiar"
                        className="h-8 w-8 hover:bg-status-success/20 hover:text-status-success transition-colors"
                        onClick={() => handleCopyResponse(obj.id, obj.response)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon" aria-label="Excluir"
                        className="h-8 w-8 hover:bg-status-error/20 text-muted-foreground hover:text-status-error transition-colors"
                        onClick={() => deleteObjection.mutate(obj.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="glass rounded-lg p-3 border border-status-success/30 bg-gradient-to-br from-status-success/10 to-transparent">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-status-success mt-0.5 shrink-0" />
                      <p className="text-sm text-status-success whitespace-pre-wrap leading-relaxed">
                        {obj.response}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground glass rounded-xl border border-dashed border-border/50">
            <div className="p-4 rounded-2xl bg-muted/20 mb-3 animate-pulse">
              <BookOpen className="h-10 w-10 opacity-50" />
            </div>
            <p className="font-medium font-display">Nenhuma objeção encontrada</p>
            <p className="text-sm mt-1">Adicione respostas para objeções comuns</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
