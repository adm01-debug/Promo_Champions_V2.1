import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useObjectionsLibrary, useAddObjection, useIncrementObjectionUsage, useDeleteObjection } from '@/hooks/useObjectionsLibrary';
import { BookOpen, Plus, Copy, Trash2, Search, ThumbsUp, MessageSquare } from 'lucide-react';
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

export function ObjectionsLibrary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newObjection, setNewObjection] = useState({ objection: '', response: '', category: 'general' });

  const { data: objections, isLoading } = useObjectionsLibrary(selectedCategory);
  const addObjection = useAddObjection();
  const incrementUsage = useIncrementObjectionUsage();
  const deleteObjection = useDeleteObjection();

  const filteredObjections = objections?.filter(obj => 
    obj.objection.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        setNewObjection({ objection: '', response: '', category: 'general' });
        setIsAddDialogOpen(false);
      }
    });
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Biblioteca de Objeções
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Objeção</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium">Objeção do Cliente</label>
                  <Textarea
                    placeholder="Ex: Está muito caro..."
                    value={newObjection.objection}
                    onChange={(e) => setNewObjection({ ...newObjection, objection: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Resposta Recomendada</label>
                  <Textarea
                    placeholder="Ex: Entendo sua preocupação com o investimento..."
                    value={newObjection.response}
                    onChange={(e) => setNewObjection({ ...newObjection, response: e.target.value })}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select
                    value={newObjection.category}
                    onValueChange={(value) => setNewObjection({ ...newObjection, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddObjection} className="w-full" disabled={addObjection.isPending}>
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
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        ) : filteredObjections && filteredObjections.length > 0 ? (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredObjections.map((obj) => (
              <div key={obj.id} className="bg-muted/30 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {getCategoryLabel(obj.category)}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {obj.usage_count} usos
                      </span>
                    </div>
                    <p className="text-sm font-medium flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                      <span className="italic text-muted-foreground">"{obj.objection}"</span>
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyResponse(obj.id, obj.response)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteObjection.mutate(obj.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-2">
                  <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                    {obj.response}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>Nenhuma objeção encontrada</p>
            <p className="text-sm">Adicione respostas para objeções comuns</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
