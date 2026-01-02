import { useState } from 'react';
import { toast } from 'sonner';

export function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copiado!');
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      toast.error('Erro ao copiar');
      return false;
    }
  };

  return { copied, copy };
}
