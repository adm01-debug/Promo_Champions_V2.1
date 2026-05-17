import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const CONSENT_KEY = "promo_champions_consent";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string;
}

export function ConsentBanner() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setShow(true);
  }, []);

  const handleAcceptAll = () => {
    const consent: ConsentState = { necessary: true, analytics: true, marketing: true, acceptedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShow(false);
  };

  const handleAcceptSelected = () => {
    const consent: ConsentState = { necessary: true, analytics, marketing, acceptedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShow(false);
  };

  const handleRejectAll = () => {
    const consent: ConsentState = { necessary: true, analytics: false, marketing: false, acceptedAt: new Date().toISOString() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
          role="dialog"
          aria-labelledby="consent-title"
          aria-describedby="consent-description"
        >
          <div className="bg-popover border border-border rounded-2xl shadow-2xl p-5 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10 shrink-0">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 id="consent-title" className="font-display font-bold text-sm">Privacidade & Cookies</h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1" onClick={handleRejectAll}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p id="consent-description" className="text-xs text-muted-foreground mt-1">
                  Usamos cookies para melhorar sua experiência. Conforme LGPD, você pode gerenciar suas preferências.
                </p>

                {/* Expandable details */}
                <button
                  onClick={() => setExpanded(!expanded)}
                  aria-expanded={expanded}
                  className="flex items-center gap-1 text-[10px] text-primary mt-2 hover:underline"
                >
                  Personalizar {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                <AnimatePresence>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 mt-3 pt-3 border-t border-border/40">
                        <label className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked disabled className="rounded" />
                          <span className="text-muted-foreground">Necessários</span>
                          <span className="text-[9px] text-muted-foreground">(obrigatório)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={analytics}
                            onChange={e => setAnalytics(e.target.checked)}
                            className="rounded"
                          />
                          <span>Analytics & Performance</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={marketing}
                            onChange={e => setMarketing(e.target.checked)}
                            className="rounded"
                          />
                          <span>Marketing & Personalização</span>
                        </label>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-2 mt-4">
                  {expanded ? (
                    <Button size="sm" className="flex-1 text-xs" onClick={handleAcceptSelected}>
                      Salvar Preferências
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={handleRejectAll}>
                        Rejeitar
                      </Button>
                      <Button size="sm" className="flex-1 text-xs" onClick={handleAcceptAll}>
                        Aceitar Todos
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
