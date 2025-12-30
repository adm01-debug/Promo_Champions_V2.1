// Melhoria 77 - Toast Notification System
import { toast, ToastPatterns } from '@/improvements/components/empty-states-toast';

// ✅ SUBSTITUIR toast() manual (120+ ocorrências)

// ANTES:
// toast({ title: "Sucesso", description: "Cliente salvo" });

// DEPOIS:
export const saveClient = async (client) => {
  try {
    await api.save(client);
    toast.success('Cliente salvo com sucesso!');
  } catch (error) {
    toast.error('Erro ao salvar cliente', {
      action: {
        label: 'Tentar Novamente',
        onClick: () => saveClient(client),
      }
    });
  }
};

// ✅ Promise toast
export const asyncOperation = () => {
  toast.promise(
    api.longOperation(),
    {
      loading: 'Processando...',
      success: 'Operação concluída!',
      error: 'Falha na operação',
    }
  );
};

// ✅ Patterns pré-configurados
export const deleteClient = async (id) => {
  await api.delete(id);
  ToastPatterns.deleted('Cliente');
};

export const updateClient = async (client) => {
  await api.update(client);
  ToastPatterns.saved('Cliente');
};

// ✅ RESULTADO: Consistência visual, menos código
