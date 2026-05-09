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
import { BookOpen, Plus, Copy, Trash2, Search, ThumbsUp, MessageSquare, CheckCircle2, Sparkles, Tag, Star, Edit3, X, Filter, BarChart3, TrendingUp, Maximize2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { Slider } from '@/components/ui/slider';

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
  const [newObjection, setNewObjection] = useState({ 
    objection: '', 
    response: '', 
    category: 'general', 
    tags: [] as string[], 
    effectiveness_score: 5 
  });
  const [tagInput, setTagInput] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const isDedicatedPage = location.pathname === '/analytics/objections';

  const { data: objections, isLoading } = useObjectionsLibrary(selectedCategory);
  const addObjection = useAddObjection();
  const updateObjection = useUpdateObjection();
  const incrementUsage = useIncrementObjectionUsage();
  const deleteObjection = useDeleteObjection();

  // Sort objections by effectiveness and usage
  const sortedObjections = useMemo(() => {
    if (!objections) return [];
    return [...objections].sort((a, b) => {
      const scoreA = (a.effectiveness_score || 0) * (a.usage_count || 1);
      const scoreB = (b.effectiveness_score || 0) * (b.usage_count || 1);
      return scoreB - scoreA;
    });
  }, [objections]);

  // Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!sortedObjections || sortedObjections.length === 0) return null;
    return new Fuse(sortedObjections, {
      keys: ['objection', 'response', 'category', 'tags'],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 1,
    });
  }, [sortedObjections]);

  const filteredObjections = useMemo(() => {
    if (!sortedObjections) return [];
    if (!searchTerm.trim()) return sortedObjections;
    if (!fuse) return sortedObjections;
    return fuse.search(searchTerm).map(result => result.item);
  }, [sortedObjections, fuse, searchTerm]);

  const handleCopyResponse = async (id: string, response: string) => {
    await navigator.clipboard.writeText(response);
    incrementUsage.mutate(id);
    toast.success('Resposta copiada!');
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (newObjection.tags.includes(tagInput.trim())) {
      setTagInput('');
      return;
    }
    setNewObjection({ ...newObjection, tags: [...newObjection.tags, tagInput.trim()] });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setNewObjection({ ...newObjection, tags: newObjection.tags.filter(t => t !== tag) });
  };

  const handleEdit = (obj: any) => {
    setEditingObjection(obj);
    setNewObjection({
      objection: obj.objection,
      response: obj.response,
      category: obj.category,
      tags: obj.tags || [],
      effectiveness_score: obj.effectiveness_score || 5
    });
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!newObjection.objection.trim() || !newObjection.response.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (editingObjection) {
      updateObjection.mutate({ id: editingObjection.id, ...newObjection }, {
        onSuccess: () => {
          setEditingObjection(null);
          setNewObjection({ objection: '', response: '', category: 'general', tags: [], effectiveness_score: 5 });
          setIsAddDialogOpen(false);
        }
      });
    } else {
      addObjection.mutate(newObjection, {
        onSuccess: () => {
          setNewObjection({ objection: '', response: '', category: 'general', tags: [], effectiveness_score: 5 });
          setIsAddDialogOpen(false);
        }
      });
    }
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getCategoryColor = (value: string) => {
    return CATEGORY_COLORS[value] || CATEGORY_COLORS.general;
  };

  return (
    <Card className="glass dark:border-glow card-elevated hover-lift animate-fade-in h-full">
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
          <div className="flex items-center gap-2">
            {!isDedicatedPage && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-primary/10"
                onClick={() => navigate('/analytics/objections')}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) {
                setEditingObjection(null);
                setNewObjection({ objection: '', response: '', category: 'general', tags: [], effectiveness_score: 5 });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" variant="glow" className="gap-1.5 hover-lift">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border/50 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-display flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {editingObjection ? 'Editar Objeção' : 'Nova Objeção'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Objeção do Cliente</label>
                      <Textarea
                        placeholder="Ex: Está muito caro..."
                        value={newObjection.objection}
                        onChange={(e) => setNewObjection({ ...newObjection, objection: e.target.value })}
                        className="glass border-border/50 focus:border-primary/50 min-h-[80px]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Resposta Recomendada</label>
                      <Textarea
                        placeholder="Ex: Entendo sua preocupação..."
                        value={newObjection.response}
                        onChange={(e) => setNewObjection({ ...newObjection, response: e.target.value })}
                        className="glass border-border/50 focus:border-primary/50 min-h-[120px]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Categoria</label>
                      <Select
                        value={newObjection.category}
                        onValueChange={(value) => setNewObjection({ ...newObjection, category: value })}
                      >
                        <SelectTrigger className="glass border-border/50">
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
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Efetividade (1-10)</label>
                      <div className="flex items-center gap-3 pt-2">
                        <Slider 
                          value={[newObjection.effectiveness_score]} 
                          max={10} 
                          min={1} 
                          step={1} 
                          onValueChange={(val) => setNewObjection({ ...newObjection, effectiveness_score: val[0] })}
                          className="flex-1"
                        />
                        <span className="text-lg font-bold text-primary w-6 text-center">{newObjection.effectiveness_score}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Tags</label>
                      <div className="flex gap-2 mb-2">
                        <Input 
                          placeholder="Adicionar tag..." 
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                          className="glass border-border/50"
                        />
                        <Button variant="outline" onClick={handleAddTag} className="glass">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {newObjection.tags.map(tag => (
                          <Badge key={tag} className="gap-1 bg-primary/10 text-primary border-primary/20">
                            {tag}
                            <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full hover-lift" variant="glow-pulse" disabled={addObjection.isPending || updateObjection.isPending}>
                    {addObjection.isPending || updateObjection.isPending ? 'Salvando...' : 'Salvar Objeção'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por objeção, resposta ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 glass border-border/50 focus:border-primary/50"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-40 glass border-border/50">
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
          <ScrollArea className={`${isDedicatedPage ? 'h-[70vh]' : 'h-[500px]'} pr-3`}>
            <div className="grid grid-cols-1 gap-3">
              {filteredObjections.map((obj, index) => (
                <div 
                  key={obj.id} 
                  className="glass rounded-xl p-4 border border-border/40 dark:border-glow hover:border-primary/40 transition-all duration-300 hover-lift animate-fade-in group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={`${getCategoryColor(obj.category)} text-[10px] border px-2 py-0`}>
                          {getCategoryLabel(obj.category)}
                        </Badge>
                        <div className="flex items-center gap-1 bg-status-success/10 text-status-success px-2 py-0.5 rounded-full text-[10px] border border-status-success/20">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          Eficiência: {obj.effectiveness_score || 5}/10
                        </div>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-full border border-border/30">
                          <ThumbsUp className="h-2.5 w-2.5" />
                          {obj.usage_count || 0} usos
                        </span>
                        {(obj.tags || []).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0 bg-muted/50">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm font-medium flex items-start gap-2 pt-1">
                        <MessageSquare className="h-4 w-4 text-status-error mt-0.5 shrink-0 opacity-70" />
                        <span className="italic text-muted-foreground leading-relaxed">"{obj.objection}"</span>
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-primary/20 text-primary"
                        onClick={() => handleEdit(obj)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-status-success/20 text-status-success"
                        onClick={() => handleCopyResponse(obj.id, obj.response)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-status-error/20 text-muted-foreground hover:text-status-error"
                        onClick={() => deleteObjection.mutate(obj.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="glass rounded-lg p-3 border border-status-success/30 bg-gradient-to-br from-status-success/10 to-transparent relative overflow-hidden group/response">
                    <div className="flex items-start gap-2 relative z-10">
                      <CheckCircle2 className="h-4 w-4 text-status-success mt-0.5 shrink-0" />
                      <p className="text-sm text-status-success whitespace-pre-wrap leading-relaxed font-medium">
                        {obj.response}
                      </p>
                    </div>
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/response:opacity-100 transition-opacity">
                      <Zap className="h-12 w-12 text-status-success/5 -rotate-12" />
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
