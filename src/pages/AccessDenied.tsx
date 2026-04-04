import { Helmet } from "react-helmet-async";
import { ShieldX, ArrowLeft, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserRoles } from "@/hooks/useUserRoles";

const AccessDenied = () => {
  const { currentUserRole } = useUserRoles();

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    manager: "Gerente",
    salesperson: "Vendedor",
  };

  return (
    <>
    <Helmet>
      <title>Acesso Negado | Promo Champions</title>
      <meta name="description" content="Você não tem permissão para acessar esta página" />
    </Helmet>
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-display font-bold mb-3">
          Acesso Negado
        </h1>
        
        <p className="text-muted-foreground mb-6">
          Você não tem permissão para acessar esta página. 
          {currentUserRole && (
            <span className="block mt-2">
              Seu nível de acesso atual é: <strong className="text-foreground">{roleLabels[currentUserRole.role] || currentUserRole.role}</strong>
            </span>
          )}
        </p>

        <div className="glass rounded-xl p-4 mb-6 text-left">
          <h3 className="font-medium mb-2 text-sm">Esta página requer:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Nível de acesso <strong>Administrador</strong> ou <strong>Gerente</strong>
            </li>
          </ul>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Se você acredita que deveria ter acesso, entre em contato com seu administrador.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Ir para Dashboard
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    </div>
  </>
  );
};

export default AccessDenied;
