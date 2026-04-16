import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VisualSearchButtonProps {
  onResults: (data: VisualSearchResponse) => void;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export interface VisualSearchProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  sales_count: number;
  status: string;
  similarity_score: number;
}

export interface VisualSearchResponse {
  analysis: {
    product_name: string;
    keywords: string[];
    category?: string;
    color?: string;
    material?: string;
    description?: string;
  };
  results: VisualSearchProduct[];
  count: number;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export function VisualSearchButton({
  onResults,
  variant = "outline",
  size = "default",
  className,
}: VisualSearchButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande", { description: "Limite de 5 MB." });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Arquivo inválido", { description: "Selecione uma imagem." });
      return;
    }

    setLoading(true);
    try {
      const dataUrl = await fileToBase64(file);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/visual-search`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ image: dataUrl, limit: 20 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const data = (await res.json()) as VisualSearchResponse;
      onResults(data);
      toast.success(`${data.count} produto(s) encontrado(s)`, {
        description: data.analysis.product_name
          ? `Identificado: ${data.analysis.product_name}`
          : undefined,
      });
    } catch (err) {
      toast.error("Falha na busca visual", {
        description: err instanceof Error ? err.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        {size !== "icon" && <span className="ml-2">Busca Visual</span>}
      </Button>
    </>
  );
}
