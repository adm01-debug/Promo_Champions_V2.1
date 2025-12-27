import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DocumentSigner {
  id: string;
  document_id: string;
  name: string;
  email: string;
  status: 'pending' | 'signed' | 'rejected';
  signed_at: string | null;
  sign_order: number;
  created_at: string;
}

export interface DigitalSignature {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'pending' | 'signed' | 'rejected' | 'expired';
  file_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  signed_at: string | null;
  document_signers?: DocumentSigner[];
}

export interface CreateDocumentInput {
  title: string;
  description?: string;
  signers?: { name: string; email: string }[];
}

export function useDigitalSignatures() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['digital-signatures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('digital_signatures')
        .select(`
          *,
          document_signers (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DigitalSignature[];
    },
  });

  const createDocument = useMutation({
    mutationFn: async (input: CreateDocumentInput) => {
      // Get current salesperson
      const { data: salesperson } = await supabase
        .from('salespeople')
        .select('id')
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      // Create document
      const { data: doc, error: docError } = await supabase
        .from('digital_signatures')
        .insert({
          title: input.title,
          description: input.description || null,
          status: 'draft',
          created_by: salesperson?.id || null,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Add signers if provided
      if (input.signers && input.signers.length > 0) {
        const signersToInsert = input.signers.map((signer, index) => ({
          document_id: doc.id,
          name: signer.name,
          email: signer.email,
          sign_order: index + 1,
        }));

        const { error: signersError } = await supabase
          .from('document_signers')
          .insert(signersToInsert);

        if (signersError) throw signersError;
      }

      return doc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-signatures'] });
      toast({
        title: "Documento criado",
        description: "O documento foi criado como rascunho.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendForSignature = useMutation({
    mutationFn: async (documentId: string) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase
        .from('digital_signatures')
        .update({
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-signatures'] });
      toast({
        title: "Documento enviado",
        description: "O documento foi enviado para assinatura.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSignerStatus = useMutation({
    mutationFn: async ({ signerId, status }: { signerId: string; status: 'signed' | 'rejected' }) => {
      const { error } = await supabase
        .from('document_signers')
        .update({
          status,
          signed_at: status === 'signed' ? new Date().toISOString() : null,
        })
        .eq('id', signerId);

      if (error) throw error;

      // Check if all signers have signed, then update document status
      const { data: signer } = await supabase
        .from('document_signers')
        .select('document_id')
        .eq('id', signerId)
        .single();

      if (signer) {
        const { data: allSigners } = await supabase
          .from('document_signers')
          .select('status')
          .eq('document_id', signer.document_id);

        if (allSigners?.every(s => s.status === 'signed')) {
          await supabase
            .from('digital_signatures')
            .update({
              status: 'signed',
              signed_at: new Date().toISOString(),
            })
            .eq('id', signer.document_id);
        } else if (allSigners?.some(s => s.status === 'rejected')) {
          await supabase
            .from('digital_signatures')
            .update({ status: 'rejected' })
            .eq('id', signer.document_id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-signatures'] });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('digital_signatures')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-signatures'] });
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addSigner = useMutation({
    mutationFn: async ({ documentId, name, email }: { documentId: string; name: string; email: string }) => {
      const { data: existingSigners } = await supabase
        .from('document_signers')
        .select('sign_order')
        .eq('document_id', documentId)
        .order('sign_order', { ascending: false })
        .limit(1);

      const nextOrder = (existingSigners?.[0]?.sign_order || 0) + 1;

      const { error } = await supabase
        .from('document_signers')
        .insert({
          document_id: documentId,
          name,
          email,
          sign_order: nextOrder,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital-signatures'] });
      toast({
        title: "Signatário adicionado",
        description: "O signatário foi adicionado ao documento.",
      });
    },
  });

  return {
    documents,
    isLoading,
    error,
    createDocument,
    sendForSignature,
    updateSignerStatus,
    deleteDocument,
    addSigner,
  };
}
