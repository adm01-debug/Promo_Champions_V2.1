import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  useUpdateActivity,
  type ActivityOutcome,
  type ActivityType,
} from '@/hooks/activities/useActivities';
import { activityTypeOptions, outcomeOptions } from './activityConstants';

// Mesmas regras de validação do formulário de criação (ActivityLogForm).
const activityEditSchema = z.object({
  activity_type: z.enum([
    'call',
    'email',
    'meeting',
    'linkedin',
    'whatsapp',
    'note',
    'other',
  ]),
  outcome: z.enum([
    'connected',
    'no_answer',
    'scheduled',
    'voicemail',
    'busy',
    'callback',
    'not_interested',
    'qualified',
    'bad_timing',
    'wrong_person',
    'unsubscribed',
  ]),
  contact_name: z
    .string()
    .max(100, 'Nome do contato deve ter no máximo 100 caracteres')
    .optional(),
  duration_minutes: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true;
      const num = parseInt(val);
      return !isNaN(num) && num >= 1 && num <= 480;
    }, 'Duração deve ser entre 1 e 480 minutos'),
  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .optional(),
});

type ActivityEditFormData = z.infer<typeof activityEditSchema>;

export interface EditableActivity {
  id: string;
  activity_type: ActivityType;
  outcome: ActivityOutcome;
  contact_name: string | null;
  notes: string | null;
  duration_minutes: number | null;
}

interface ActivityEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: EditableActivity;
}

const toFormValues = (activity: EditableActivity): ActivityEditFormData => ({
  activity_type: activity.activity_type,
  outcome: activity.outcome,
  contact_name: activity.contact_name ?? '',
  duration_minutes: activity.duration_minutes ? String(activity.duration_minutes) : '',
  notes: activity.notes ?? '',
});

export function ActivityEditDialog({
  open,
  onOpenChange,
  activity,
}: ActivityEditDialogProps) {
  const updateActivity = useUpdateActivity();

  const form = useForm<ActivityEditFormData>({
    resolver: zodResolver(activityEditSchema),
    // O diálogo é montado só quando aberto (ver ActivityItemRow), então os
    // valores iniciais sempre refletem a atividade atual.
    defaultValues: toFormValues(activity),
  });

  const onSubmit = (data: ActivityEditFormData) => {
    updateActivity.mutate(
      {
        id: activity.id,
        activity_type: data.activity_type,
        outcome: data.outcome,
        contact_name: data.contact_name?.trim() || null,
        notes: data.notes?.trim() || null,
        duration_minutes: data.duration_minutes ? parseInt(data.duration_minutes) : null,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-section-title flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            Editar Atividade
          </DialogTitle>
          <DialogDescription>Altere os dados da atividade registrada.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="activity_type"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-label text-xs text-muted-foreground">
                      Tipo de Atividade
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypeOptions.map(opt => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-xs"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outcome"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-label text-xs text-muted-foreground">
                      Resultado / Desfecho
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {outcomeOptions.map(opt => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-xs"
                          >
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-label text-xs text-muted-foreground">
                      Contato
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome do contato"
                        className="h-9 text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration_minutes"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-label text-xs text-muted-foreground">
                      Duração (min)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={e => field.onChange(e.target.value)}
                        placeholder="5"
                        className="h-9 text-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-label text-xs text-muted-foreground">
                    Observações
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detalhes da atividade..."
                      className="min-h-[80px] text-xs resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateActivity.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateActivity.isPending}>
                {updateActivity.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
