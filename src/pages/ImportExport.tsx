import React, { useState, useCallback, useRef, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTransition, containerVariants, itemVariants } from "@/components/transitions/PageTransition";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Upload, Download, FileSpreadsheet, Check, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLogAuditEvent } from "@/hooks/useAuditLogs";

type ImportStep = "upload" | "mapping" | "preview" | "complete";

interface ParsedRow {
  [key: string]: string;
}

interface FieldMapping {
  source: string;
  target: string;
}

const TARGET_FIELDS = [
  { value: "name", label: "Nome" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Telefone" },
  { value: "company", label: "Empresa" },
  { value: "skip", label: "— Ignorar —" },
];

const ImportExport = () => {
  const [step, setStep] = useState<ImportStep>("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { mutate: logAudit } = useLogAuditEvent();

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) { toast.error("Arquivo vazio ou inválido"); return; }

      const delimiter = lines[0].includes(";") ? ";" : ",";
      const hdrs = lines[0].split(delimiter).map((h) => h.trim().replace(/"/g, ""));
      const data = lines.slice(1).map((line) => {
        const cols = line.split(delimiter).map((c) => c.trim().replace(/"/g, ""));
        const row: ParsedRow = {};
        hdrs.forEach((h, i) => { row[h] = cols[i] || ""; });
        return row;
      });

      setHeaders(hdrs);
      setRows(data);
      setMappings(hdrs.map((h) => ({
        source: h,
        target: TARGET_FIELDS.find((f) => h.toLowerCase().includes(f.value))?.value || "skip",
      })));
      setStep("mapping");
    };
    reader.readAsText(file);
  }, []);

  const updateMapping = useCallback((idx: number, target: string) => {
    setMappings((prev) => prev.map((m, i) => (i === idx ? { ...m, target } : m)));
  }, []);

  const previewData = useMemo(() => {
    return rows.slice(0, 5).map((row) => {
      const mapped: Record<string, string> = {};
      mappings.forEach((m) => {
        if (m.target !== "skip") mapped[m.target] = row[m.source] || "";
      });
      return mapped;
    });
  }, [rows, mappings]);

  const importMutation = useMutation({
    mutationFn: async () => {
      const records = rows.map((row) => {
        const mapped: Record<string, string> = {};
        mappings.forEach((m) => {
          if (m.target !== "skip") mapped[m.target] = row[m.source] || "";
        });
        return mapped;
      }).filter((r) => r.name);

      const { error } = await supabase
        .from("clients")
        .insert(records.map((r) => ({
          name: r.name || "Sem nome",
          email: r.email || null,
          phone: r.phone || null,
          company: r.company || null,
        })));
      if (error) throw error;
      return records.length;
    },
    onSuccess: (count) => {
      setImportedCount(count);
      setStep("complete");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(`${count} registros importados com sucesso!`);
    },
    onError: () => toast.error("Erro ao importar dados"),
  });

  const handleExport = useCallback(async () => {
    const { data } = await supabase.from("clients").select("name, email, phone, company, total_value").limit(1000);
    if (!data?.length) { toast.error("Nenhum dado para exportar"); return; }

    // Log the audit event
    logAudit({
      action: "EXPORT_DATA",
      entity_type: "clients",
      metadata: {
        record_count: data.length,
        format: "CSV",
        fields: ["name", "email", "phone", "company", "total_value"]
      }
    });

    const csvHeaders = Object.keys(data[0]);
    const csvRows = data.map((r) => csvHeaders.map((h) => `"${(r as Record<string, unknown>)[h] ?? ""}"`).join(","));
    const csv = [csvHeaders.join(","), ...csvRows].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clientes_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exportação concluída!");
  }, [logAudit]);

  return (
    <>
      <Helmet>
        <title>Importar / Exportar | Promo Champions</title>
        <meta name="description" content="Importe e exporte dados do CRM via CSV." />
      </Helmet>
      <PageTransition>
        <div className="container max-w-4xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <h1 className="text-page-title font-display">Import / Export</h1>
              <p className="text-sm text-muted-foreground mt-1">Importe clientes via CSV ou exporte sua base</p>
            </div>
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs">
            {(["upload", "mapping", "preview", "complete"] as ImportStep[]).map((s, i) => (
              <React.Fragment key={s}>
                {i > 0 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                <Badge variant={step === s ? "default" : "outline"} className="text-xs">
                  {s === "upload" ? "Upload" : s === "mapping" ? "Mapear" : s === "preview" ? "Preview" : "Concluído"}
                </Badge>
              </React.Fragment>
            ))}
          </div>

          {/* Upload step */}
          {step === "upload" && (
            <motion.div variants={itemVariants}>
              <Card
                className="p-12 glass border-border/40 border-dashed text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-display font-semibold">Arraste um arquivo CSV ou clique para selecionar</p>
                <p className="text-sm text-muted-foreground mt-1">Suporta CSV e TSV com cabeçalhos</p>
                <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFile} />
              </Card>
            </motion.div>
          )}

          {/* Mapping step */}
          {step === "mapping" && (
            <motion.div variants={itemVariants}>
              <Card className="p-4 glass border-border/40 space-y-3">
                <p className="text-sm font-semibold">{rows.length} registros encontrados. Mapeie os campos:</p>
                {mappings.map((m, i) => (
                  <div key={m.source} className="flex items-center gap-3">
                    <Badge variant="outline" className="min-w-[120px] justify-center text-xs">{m.source}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Select value={m.target} onValueChange={(v) => updateMapping(i, v)}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TARGET_FIELDS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" size="sm" onClick={() => setStep("upload")}>Voltar</Button>
                  <Button size="sm" onClick={() => setStep("preview")}>Pré-visualizar</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Preview step */}
          {step === "preview" && (
            <motion.div variants={itemVariants}>
              <Card className="p-4 glass border-border/40 space-y-3">
                <p className="text-sm font-semibold">Prévia dos primeiros 5 registros:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/30">
                        {Object.keys(previewData[0] || {}).map((h) => (
                          <th key={h} className="py-2 px-2 text-left text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i} className="border-b border-border/20">
                          {Object.values(row).map((v, j) => (
                            <td key={j} className="py-1.5 px-2">{v || "—"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground">Total: {rows.length} registros serão importados</p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setStep("mapping")}>Voltar</Button>
                  <Button size="sm" onClick={() => importMutation.mutate()} disabled={importMutation.isPending}>
                    {importMutation.isPending ? "Importando..." : `Importar ${rows.length} registros`}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Complete step */}
          {step === "complete" && (
            <motion.div variants={itemVariants}>
              <Card className="p-8 glass border-border/40 text-center">
                <Check className="h-16 w-16 text-status-success mx-auto mb-4" />
                <p className="text-xl font-display font-bold">{importedCount} registros importados!</p>
                <p className="text-sm text-muted-foreground mt-1">Dados disponíveis na base de clientes</p>
                <Button className="mt-4" onClick={() => { setStep("upload"); setRows([]); setHeaders([]); }}>
                  Nova Importação
                </Button>
              </Card>
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default ImportExport;
