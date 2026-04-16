import React, { FC, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Flag, Plus, Pencil, Trash2, Loader2, Shield, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FeatureFlag {
  id: string;
  key: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  allowed_roles: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const FeatureFlagsAdmin: FC = () => {
  const queryClient = useQueryClient();
  const [editFlag, setEditFlag] = useState<FeatureFlag | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['admin-feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('feature_flags').select('*').order('key');
      if (error) throw error;
      return (data ?? []) as FeatureFlag[];
    },
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase.from('feature_flags').update({ is_enabled }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Flag atualizada');
    },
  });

  const updateRollout = useMutation({
    mutationFn: async ({ id, rollout_percentage }: { id: string; rollout_percentage: number }) => {
      const { error } = await supabase.from('feature_flags').update({ rollout_percentage }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      toast.success('Rollout atualizado');
    },
  });

  const deleteFlag = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feature_flags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
      toast.success('Flag removida');
    },
  });

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted/30 animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          Feature Flags ({flags.length})
        </h3>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowCreate(true)}>
          <Plus className="h-3 w-3 mr-1" /> Nova Flag
        </Button>
      </div>

      <div className="space-y-2">
        {flags.map(flag => (
          <Card key={flag.id} className={cn('border-none shadow-sm transition-all', flag.is_enabled && 'ring-1 ring-success/30')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono font-semibold text-foreground">{flag.key}</code>
                    <Badge variant={flag.is_enabled ? 'default' : 'secondary'} className="text-[10px] h-5">
                      {flag.is_enabled ? 'ON' : 'OFF'}
                    </Badge>
                    {flag.rollout_percentage < 100 && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        <Percent className="h-2.5 w-2.5 mr-0.5" />
                        {flag.rollout_percentage}%
                      </Badge>
                    )}
                    {flag.allowed_roles && flag.allowed_roles.length > 0 && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        <Shield className="h-2.5 w-2.5 mr-0.5" />
                        {flag.allowed_roles.join(', ')}
                      </Badge>
                    )}
                  </div>
                  {flag.description && <p className="text-xs text-muted-foreground mt-1 truncate">{flag.description}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={flag.is_enabled}
                    onCheckedChange={checked => toggleFlag.mutate({ id: flag.id, is_enabled: checked })}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditFlag(flag)} aria-label={`Editar flag ${flag.name}`}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteFlag.mutate(flag.id)} aria-label={`Excluir flag ${flag.name}`}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {/* Rollout slider */}
              {flag.is_enabled && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-14 shrink-0">Rollout</span>
                  <Slider
                    value={[flag.rollout_percentage]}
                    min={0}
                    max={100}
                    step={5}
                    className="flex-1"
                    onValueCommit={([val]) => updateRollout.mutate({ id: flag.id, rollout_percentage: val })}
                  />
                  <span className="text-xs font-mono text-foreground w-10 text-right">{flag.rollout_percentage}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {flags.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Flag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma feature flag criada</p>
          </CardContent>
        </Card>
      )}

      <CreateFlagDialog open={showCreate} onOpenChange={setShowCreate} />
      {editFlag && <EditFlagDialog flag={editFlag} open={!!editFlag} onOpenChange={open => !open && setEditFlag(null)} />}
    </div>
  );
};

const CreateFlagDialog: FC<{ open: boolean; onOpenChange: (v: boolean) => void }> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleCreate = async () => {
    if (!key.trim()) return;
    setIsPending(true);
    const { error } = await supabase.from('feature_flags').insert({ key: key.trim(), description: description.trim() || null });
    setIsPending(false);
    if (error) { toast.error('Erro ao criar flag'); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
    toast.success('Flag criada');
    setKey(''); setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Nova Feature Flag</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Chave</Label>
            <Input value={key} onChange={e => setKey(e.target.value)} placeholder="ex: new_dashboard_v2" className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição opcional" />
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={!key.trim() || isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Flag className="h-4 w-4 mr-2" />}
            Criar Flag
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const EditFlagDialog: FC<{ flag: FeatureFlag; open: boolean; onOpenChange: (v: boolean) => void }> = ({ flag, open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState(flag.description || '');
  const [roles, setRoles] = useState((flag.allowed_roles || []).join(', '));
  const [isPending, setIsPending] = useState(false);

  const handleSave = async () => {
    setIsPending(true);
    const allowed_roles = roles.split(',').map(r => r.trim()).filter(Boolean);
    const { error } = await supabase.from('feature_flags').update({
      description: description.trim() || null,
      allowed_roles: allowed_roles.length > 0 ? allowed_roles : null,
    }).eq('id', flag.id);
    setIsPending(false);
    if (error) { toast.error('Erro ao salvar'); return; }
    queryClient.invalidateQueries({ queryKey: ['admin-feature-flags'] });
    toast.success('Flag atualizada');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Editar: {flag.key}</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Roles permitidos (separados por vírgula)</Label>
            <Input value={roles} onChange={e => setRoles(e.target.value)} placeholder="admin, manager" />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
