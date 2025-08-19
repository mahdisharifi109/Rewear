
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { SellForm } from "@/components/sell-form";
import { useToast } from '@/hooks/use-toast';

export default function SellPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Apenas executa a verificação quando o carregamento terminar
    if (!loading) {
      if (!user) {
        toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Precisa de iniciar sessão para vender um artigo.",
        });
        // Redireciona com um parâmetro para que a página de login saiba para onde voltar
        router.push('/login?redirect=/sell');
      }
    }
  }, [user, loading, router, toast]);

  // Mostra um estado de carregamento enquanto se verifica a autenticação
  if (loading || !user) {
    return (
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
            <p>A verificar autenticação...</p>
        </div>
    );
  }

  // Apenas renderiza o formulário se o utilizador estiver autenticado
  return (
    <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <SellForm />
    </div>
  );
}
