import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const CONSENT_KEY = "lgpd_consent";

interface ConsentPreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  accepted_at: string | null;
}

const defaultPrefs: ConsentPreferences = {
  essential: true,
  analytics: false,
  marketing: false,
  accepted_at: null,
};

export const LGPDConsentBanner = () => {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<ConsentPreferences>(defaultPrefs);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const save = useCallback((p: ConsentPreferences) => {
    const withTimestamp = { ...p, accepted_at: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(withTimestamp));
    setVisible(false);
  }, []);

  const acceptAll = () => save({ ...prefs, analytics: true, marketing: true });
  const acceptSelected = () => save(prefs);
  const rejectOptional = () => save({ ...defaultPrefs });

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999]"
      >
        <div className="glass border border-border/50 rounded-2xl p-5 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-sm mb-1">Privacidade & Cookies</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Utilizamos cookies para melhorar sua experiência. Cookies essenciais são necessários para o funcionamento. 
                Você pode gerenciar suas preferências abaixo.
              </p>
            </div>
            <button
              onClick={rejectOptional}
              className="p-1 rounded-md hover:bg-muted transition-colors shrink-0"
              aria-label="Fechar banner de cookies"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3"
              >
                <div className="space-y-3 py-2 border-t border-border/30 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">Essenciais</p>
                      <p className="text-[10px] text-muted-foreground">Necessários para o funcionamento</p>
                    </div>
                    <Switch checked disabled aria-label="Cookies essenciais (sempre ativo)" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">Analytics</p>
                      <p className="text-[10px] text-muted-foreground">Nos ajudam a melhorar o produto</p>
                    </div>
                    <Switch
                      checked={prefs.analytics}
                      onCheckedChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
                      aria-label="Cookies de analytics"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">Marketing</p>
                      <p className="text-[10px] text-muted-foreground">Conteúdo personalizado</p>
                    </div>
                    <Switch
                      checked={prefs.marketing}
                      onCheckedChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
                      aria-label="Cookies de marketing"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs flex-1" onClick={() => setShowDetails(!showDetails)}>
              <Settings className="h-3 w-3 mr-1" />
              {showDetails ? "Ocultar" : "Gerenciar"}
            </Button>
            {showDetails ? (
              <Button size="sm" className="text-xs flex-1" onClick={acceptSelected}>
                Salvar preferências
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" className="text-xs" onClick={rejectOptional}>
                  Recusar
                </Button>
                <Button size="sm" className="text-xs flex-1" onClick={acceptAll}>
                  Aceitar todos
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
