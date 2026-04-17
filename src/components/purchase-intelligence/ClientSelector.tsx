import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  value?: string;
  onChange: (v: string) => void;
}

export function ClientSelector({ value, onChange }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["clients-selector"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, total_value")
        .order("total_value", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60_000,
  });

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger className="w-full md:w-80">
        <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um cliente"} />
      </SelectTrigger>
      <SelectContent>
        {(data ?? []).map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
