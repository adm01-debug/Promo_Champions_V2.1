import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VisualSearchResult {
  analysis: {
    product_name: string;
    keywords: string[];
    category?: string;
    color?: string;
    material?: string;
    description?: string;
  };
  results: any[];
  count: number;
}

export const useVisualSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<VisualSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchByImage = async (imageFile: File | string) => {
    setIsLoading(true);
    setError(null);

    try {
      let imageData: string;

      if (imageFile instanceof File) {
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } else {
        imageData = imageFile;
      }

      const { data, error: invokeError } = await supabase.functions.invoke('visual-search', {
        body: { image: imageData, limit: 10 },
      });

      if (invokeError) throw invokeError;

      setResults(data as VisualSearchResult);
      return data as VisualSearchResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao realizar busca visual';
      setError(msg);
      console.error('Visual search error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return {
    searchByImage,
    results,
    isLoading,
    error,
    clearResults,
  };
};
