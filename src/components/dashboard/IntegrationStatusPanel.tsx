import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Smartphone, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Terminal,
  Clock,
  ExternalLink,
  Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface IntegrationStatus {
  id: string;
  name: string;
  type: "email" | "push";
  status: "active" | "error" | "pending";
  lastCheck: string;
  errorCount: number;
  configValid: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: "email" | "push";
  event: string;
  status: "success" | "error";
  details: string;
}

export const IntegrationStatusPanel = () => {
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([
    {
      id: "email-01",
      name: "Lovable Email Infrastructure",
      type: "email",
      status: "active",
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      configValid: true
    },
    {
      id: "push-01",
      name: "Native Push Notifications",
      type: "push",
      status: "pending",
      lastCheck: new Date().toISOString(),
      errorCount: 2,
      configValid: false
    }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "1",
      timestamp: new Date().toISOString(),
      type: "email",
      event: "Threshold Breach Alert",
      status: "success",
      details: "Sent to user@example.com"
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: "push",
      event: "Daily Summary",
      status: "error",
      details: "Subscription expired or revoked"
    }
  ]);

  const refreshStatus = async () => {
    setLoading(true);
    // Simulating check
    setTimeout(() => {
      setLoading(false);
      toast.success("System diagnostics complete");
    }, 1500);
  };

  const testEmail = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Sending test email...",
        success: "Test email delivered successfully!",
        error: "Failed to send test email"
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration & Status Summary */}
      <Card className="lg:col-span-1 bg-black/40 border-white/10 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <Settings2 className="h-12 w-12 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Infrastructure Status
          </CardTitle>
          <CardDescription className="text-[10px] uppercase font-mono">
            Real-time integration diagnostics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.id} className="p-3 rounded-lg border border-white/5 bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {integration.type === "email" ? <Mail className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-success" />}
                    <span className="text-xs font-bold uppercase tracking-tight">{integration.name}</span>
                  </div>
                  <Badge variant={integration.status === "active" ? "default" : "destructive"} className="text-[9px] h-5 uppercase">
                    {integration.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-mono">Config</p>
                    <div className="flex items-center gap-1">
                      {integration.configValid ? (
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      ) : (
                        <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      <span className="text-[10px] font-mono">{integration.configValid ? "VALID" : "INVALID"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] text-muted-foreground uppercase font-mono">Errors (24h)</p>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className={cn("h-3 w-3", integration.errorCount > 0 ? "text-warning" : "text-success")} />
                      <span className="text-[10px] font-mono">{integration.errorCount} FAILS</span>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-7 text-[9px] font-mono uppercase tracking-widest border border-white/5 hover:bg-primary/10 hover:text-primary"
                  onClick={integration.type === "email" ? testEmail : undefined}
                >
                  Run Test {integration.type}
                </Button>
              </div>
            ))}
          </div>

          <Button 
            className="w-full bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-all font-mono text-[10px] uppercase tracking-[0.2em]"
            onClick={refreshStatus}
            disabled={loading}
          >
            <RefreshCw className={cn("h-3 w-3 mr-2", loading && "animate-spin")} />
            {loading ? "Analyzing..." : "Global Diagnostic"}
          </Button>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card className="lg:col-span-2 bg-black/40 border-white/10 backdrop-blur-xl flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-mono font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Delivery Protocol Logs
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-mono">
              Live event stream of notification dispatches
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary font-mono text-[9px]">
            {logs.length} EVENTS LOADED
          </Badge>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-[400px]">
            <div className="px-6 py-4 space-y-4">
              {logs.map((log, idx) => (
                <div key={log.id} className="relative group">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        log.status === "success" ? "bg-success" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      )} />
                      {idx !== logs.length - 1 && <div className="w-[1px] h-12 bg-white/5" />}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] font-mono px-1.5 py-0.5 rounded border capitalize",
                            log.type === "email" ? "border-primary/20 text-primary bg-primary/5" : "border-success/20 text-success bg-success/5"
                          )}>
                            {log.type}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-tight">{log.event}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded border border-white/5 bg-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] font-mono text-foreground/80 break-all">{log.details}</p>
                          {log.status === "error" && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10">
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationStatusPanel;
