import { Helmet } from "react-helmet-async";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Silent tracking for 404s can be added here if needed via captureError
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Página Não Encontrada | Promo Champions</title>
        <meta name="description" content="A página solicitada não existe" />
      </Helmet>
      <div className="flex min-h-[70vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md px-6"
        >
          <div className="relative mb-6 mx-auto w-fit">
            <span className="text-[120px] font-display font-black leading-none bg-gradient-to-b from-primary/30 to-primary/5 bg-clip-text text-transparent select-none">
              404
            </span>
            <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-primary/60" />
          </div>

          <h1 className="text-xl font-display font-bold mb-2">Página não encontrada</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            A rota <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">{location.pathname}</code> não existe ou foi movida.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <Button size="sm" asChild className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Início
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
