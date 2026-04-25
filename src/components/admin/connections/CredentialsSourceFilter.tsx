import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCredentialsSource, type CredentialsSource } from "./CredentialsSourceFilterContext";

const OPTIONS: Array<{ value: CredentialsSource; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "db", label: "Banco" },
  { value: "env", label: "ENV" },
  { value: "secret", label: "Secrets" },
];

export function CredentialsSourceFilter() {
  const { source, setSource } = useCredentialsSource();
  return (
    <Tabs value={source} onValueChange={(v) => setSource(v as CredentialsSource)}>
      <TabsList>
        {OPTIONS.map((opt) => (
          <TabsTrigger key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
