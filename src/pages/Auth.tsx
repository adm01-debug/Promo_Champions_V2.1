import { Helmet } from "react-helmet-async";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthBrandPanel } from "@/components/auth/AuthBrandPanel";
import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { useAuthForm } from "@/hooks/auth/useAuthForm";

export default function Auth() {
  const authProps = useAuthForm();

  return (
    <>
      <Helmet>
        <title>Login | Circuito de Vencedores</title>
        <meta name="description" content="Acesse a plataforma Circuito de Vencedores. Entre no jogo, acompanhe suas metas e supere seus limites no maior ecossistema de vendas inteligente." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="min-h-screen w-full relative overflow-hidden bg-[#05060f] text-white flex items-center justify-center p-4 sm:p-8">
        <AuthBackground />

        {/* Main container */}
        <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center z-10">
          <AuthBrandPanel />
          <AuthFormCard {...authProps} />
        </div>
      </div>
    </>
  );
}
