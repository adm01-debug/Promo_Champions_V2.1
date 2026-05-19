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
        <title>Circuito de Vencedores | Promo Champions</title>
        <meta name="description" content="Entre no Circuito. Competa. Vença." />
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
