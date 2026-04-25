import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCredentialsSource, type HealthStatusFilter as Status } from "./CredentialsSourceFilterContext";

const OPTIONS: Array<{ value: Status; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "healthy", label: "Saudável" },
  { value: "warning", label: "Atenção" },
  { value: "failing", label: "Falha" },
];

export function HealthStatusFilter() {
  const { healthStatus, setHealthStatus } = useCredentialsSource();
  return (
    <Tabs value={healthStatus} onValueChange={(v) => setHealthStatus(v as Status)}>
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
