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

export const DIGITAL_SIGNATURE_INTEGRATION_MESSAGE =
  "O envio e a confirmação de assinatura estão indisponíveis até que uma integração de assinatura seja configurada e validada.";

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
        .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
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
        title: "Rascunho criado",
        description: "O documento foi salvo internamente; ele ainda não foi enviado para assinatura.",
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
    mutationFn: async (_documentId: string) => {
      throw new Error(DIGITAL_SIGNATURE_INTEGRATION_MESSAGE);
    },
    onError: () => {
      toast({
        title: "Envio para assinatura indisponível",
        description: DIGITAL_SIGNATURE_INTEGRATION_MESSAGE,
        variant: "destructive",
      });
    },
  });

  const updateSignerStatus = useMutation({
    mutationFn: async (_input: { signerId: string; status: 'signed' | 'rejected' }) => {
      throw new Error(DIGITAL_SIGNATURE_INTEGRATION_MESSAGE);
    },
    onError: () => {
      toast({
        title: "Confirmação de assinatura indisponível",
        description: DIGITAL_SIGNATURE_INTEGRATION_MESSAGE,
        variant: "destructive",
      });
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
    signatureIntegrationConfigured: false,
    signatureIntegrationMessage: DIGITAL_SIGNATURE_INTEGRATION_MESSAGE,
  };
}
